"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";

function SubscribeView() {
  const [userEmail, setUserEmail] = useState("");
  const [customerID, setCustomerID] = useState(null);
  const [customerSecret, setCustomerSecret] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Function to dynamically load the Stripe script
  const loadStripeScript = () => {
    return new Promise((resolve, reject) => {
      if (
        document.querySelector(
          "script[src='https://js.stripe.com/v3/pricing-table.js']"
        )
      ) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/pricing-table.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchUserSessionAndData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching session:", sessionError.message);
          setUserEmail("No User Found");
          return;
        }

        if (session?.user?.email) {
          setUserEmail(session.user.email);

          const { data, error } = await supabase
            .from("user_stripe")
            .select("*")
            .eq("email", session.user.email)
            .single();

          let customerId = data?.customer_id;

          if (!customerId) {
            const response = await fetch("/api/create-stripe-customer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: session.user.email }),
            });

            const { id, error: createError } = await response.json();

            if (createError) {
              console.error("Error creating Stripe customer:", createError);
              return;
            }

            customerId = id;

            await supabase.from("user_stripe").insert({
              email: session.user.email,
              customer_id: customerId,
            });
          }

          setCustomerID(customerId);

          const customerSessionResponse = await fetch(
            "/api/create-customer-session",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ customerId }),
            }
          );

          const { clientSecret, error: sessionError } =
            await customerSessionResponse.json();

          if (sessionError) {
            console.error("Error creating customer session:", sessionError);
            return;
          }

          setCustomerSecret(clientSecret);
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };

    const initialize = async () => {
      try {
        await loadStripeScript();
        setStripeLoaded(true);
        fetchUserSessionAndData();
      } catch (err) {
        console.error("Error loading Stripe script:", err);
      }
    };

    initialize();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {stripeLoaded && customerID && customerSecret && (
        /*     <stripe-pricing-table
          customer-session-client-secret={customerSecret}
          pricing-table-id="prctbl_1QfokrE43xWZCXH3U7IfKTYf"
          publishable-key="pk_test_51QX5gGE43xWZCXH3LJ2HhFEboXxnv9Xas2Nnwm2vCmvyijbxXIV17UrkpTRgVELKcAsFUNYakl1nGFaItc0oC51N00jOTphvFi"
        /> */
        <stripe-pricing-table
          pricing-table-id="prctbl_1QfSw5E43xWZCXH3onBilnVu"
          publishable-key="pk_live_51QX5gGE43xWZCXH3ivdyoCspjeEUT2TVUCeNyAvwykKpSw95ZayoUndnephVBzkySNaqtjvJ0JVjTU4KEW7GLdN100uKErd8KG"
        ></stripe-pricing-table>
      )}
    </div>
  );
}

export default SubscribeView;
