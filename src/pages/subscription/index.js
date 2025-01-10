"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import HeaderLive from "../../components/header-live";
function SubscribeView() {
  const [userEmail, setUserEmail] = useState("");
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
      } catch (err) {
        console.error("Unexpected error:", err.message);
        alert("Unexpected error. Please refresh the page.");
      }
    };
    fetchUserSessionAndData();
  });
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderLive email={userEmail} />

      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      {/* 
      <stripe-pricing-table
        pricing-table-id="prctbl_1QfSw5E43xWZCXH3onBilnVu"
        customer-email={userEmail}
        publishable-key="pk_live_51QX5gGE43xWZCXH3ivdyoCspjeEUT2TVUCeNyAvwykKpSw95ZayoUndnephVBzkySNaqtjvJ0JVjTU4KEW7GLdN100uKErd8KG"
      ></stripe-pricing-table> */}

      <stripe-pricing-table
        customer-email={userEmail}
        pricing-table-id="prctbl_1QfokrE43xWZCXH3U7IfKTYf"
        publishable-key="pk_test_51QX5gGE43xWZCXH3LJ2HhFEboXxnv9Xas2Nnwm2vCmvyijbxXIV17UrkpTRgVELKcAsFUNYakl1nGFaItc0oC51N00jOTphvFi"
      ></stripe-pricing-table>
    </div>
  );
}

export default SubscribeView;
