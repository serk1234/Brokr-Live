"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Stripe from "stripe";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import HeaderLive from "../../components/header-live";

function SubscribeView() {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const [userEmail, setUserEmail] = useState("");
  const [customerID, setCustomerID] = useState(null);
  const [customerSecret, setCustomerSecret] = useState(null);
  const router = useRouter();

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
        }
        var userStripId = await supabase
          .from("user_stripe")
          .select("*")
          .eq("email", session.user.email)
          .single();
        if (userStripId.error) {
          console.log(userStripId.error);
          return;
        }
        console.log(userStripId);
        if (!userStripId || !userStripId.customer_id) {
          const customer = await stripe.customers.create({
            name: session.user.email.split("@")[0],
            email: session.user.email,
          });
          console.log(customer);

          var id = customer.id;
          await supabase.from("user_stripe").insert({
            email: session.user.email,
            customer_id: id,
          });
          setCustomerID(id);
          createCustomerSession();

          return;
        }
        setCustomerID(userStripId.customer_id);
        createCustomerSession();
      } catch (err) {
        console.error("Unexpected error:", err.message);
        alert("Unexpected error. Please refresh the page.");
      }
    };

    async function createCustomerSession() {
      const customerSession = await stripe.customerSessions.create({
        customer: customerID,
        components: {
          pricing_table: {
            enabled: true,
          },
        },
      });
      console.log(customerSession);
      setCustomerSecret(customerSession);
    }
    //fetchUserSessionAndData();
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderLive email={userEmail} />
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      {/* 
      <stripe-pricing-table
        pricing-table-id={process.env.PRICING_TABLE}
        customer-email={userEmail}
        publishable-key={process.env.STRIPE_PK_KEY}
      ></stripe-pricing-table> */}
      {/* ( customerID && customerSecret && (
      <stripe-pricing-table
        customer-email={userEmail}
        customer-session-client-secret={customerSecret}
        pricing-table-id="prctbl_1QfokrE43xWZCXH3U7IfKTYf"
        publishable-key="pk_test_51QX5gGE43xWZCXH3LJ2HhFEboXxnv9Xas2Nnwm2vCmvyijbxXIV17UrkpTRgVELKcAsFUNYakl1nGFaItc0oC51N00jOTphvFi"
      />
      )) */}

      {/*    {customerID && customerSecret && (
        <stripe-pricing-table
          customer-email={userEmail}
          customer-session-client-secret={customerSecret}
          pricing-table-id="prctbl_1QfokrE43xWZCXH3U7IfKTYf"
          publishable-key="pk_test_51QX5gGE43xWZCXH3LJ2HhFEboXxnv9Xas2Nnwm2vCmvyijbxXIV17UrkpTRgVELKcAsFUNYakl1nGFaItc0oC51N00jOTphvFi"
        ></stripe-pricing-table>
      )} */}
    </div>
  );
}

export default SubscribeView;
