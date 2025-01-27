"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import HeaderLive from "../../components/header-live";

// Initialize Stripe with the publishable key

function SubscribeView() {
  const [userEmail, setUserEmail] = useState("");
  const [customerID, setCustomerID] = useState(null);
  const [customerSecret, setCustomerSecret] = useState(null);

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

          // Fetch or create a Stripe customer
          const { data, error } = await supabase
            .from("user_stripe")
            .select("*")
            .eq("email", session.user.email)
            .single();

          /*     if (error) {
            console.error("Error fetching Stripe customer:", error.message);
            return;
          } */
          console.log(data);

          let customerId = data?.customer_id;

          if (!customerId) {
            // Create a new Stripe customer via your backend API
            const response = await fetch("/api/create-stripe-customer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: session.user.email }),
            });

            const { id, error: createError } = await response.json();

            if (createError) {
              console.error("Error creating Stripe customer:", createError);
            }

            customerId = id;

            // Save the new customer ID to Supabase
            await supabase.from("user_stripe").insert({
              email: session.user.email,
              customer_id: customerId,
            });
          }

          setCustomerID(customerId);

          // Fetch or create a customer session
          const customerSessionResponse = await fetch(
            "/api/create-customer-session",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ customerId }),
            }
          );

          console.log(customerSessionResponse);
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

    fetchUserSessionAndData();
  }, []);

  console.log("customerID", customerID);
  console.log("customerSecret", customerSecret);
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderLive email={userEmail} />
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>



      <div className="flex justify-center items-center mt-10 gap-6 flex-wrap">
        {/* Basic Plan */}
        <div className="flex-1 max-w-sm bg-gray-800 text-black p-6 rounded-xl">
          <h2 className="text-xl font-bold">Basic</h2>
          <p className="text-3xl font-bold mt-4">
            US$1,000 <span className="text-sm">per month</span>
          </p>
          <p className="mt-2 text-sm">US$12,000 billed annually</p>
          <button className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
            Subscribe
          </button>
        </div>

        {/* Premium Plan */}
        <div className="flex-1 max-w-sm bg-gray-800 text-black p-6 rounded-xl">
          <h2 className="text-xl font-bold">Premium</h2>
          <span className="inline-block px-2 py-1 mt-2 bg-yellow-500 text-black text-xs rounded">
            Most Popular
          </span>
          <p className="text-3xl font-bold mt-4">
            US$1,500 <span className="text-sm">per month</span>
          </p>
          <p className="mt-2 text-sm">US$18,000 billed annually</p>
          <button className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
            Subscribe
          </button>
        </div>
      </div>



      {customerID && customerSecret && (
        <stripe-pricing-table
          customer-session-client-secret={customerSecret}
          pricing-table-id="prctbl_1QfokrE43xWZCXH3U7IfKTYf"
          publishable-key="pk_test_51QX5gGE43xWZCXH3LJ2HhFEboXxnv9Xas2Nnwm2vCmvyijbxXIV17UrkpTRgVELKcAsFUNYakl1nGFaItc0oC51N00jOTphvFi"
        />
      )}
    </div>
  );
}

export default SubscribeView;
