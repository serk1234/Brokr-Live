"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import SubscribeView from "../pages/subscription/index";
import ModernButton from "./modern-button";
import Popup from "./Popup";

function NewComponent({ email }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPricingTable, setShowPricingTable] = useState(false);
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false); // State to manage popup visibility
  const [popupMessage, setPopupMessage] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [showSubscribeTable, setshowSubscribeTable] = useState(false);
  const handleRedirectToPortal = async () => {
    if (!customerId) {
      alert("Please enter a valid Customer ID.");
      return;
    }

    try {
      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          returnUrl: "https://brokr.app/", // Replace with your return URL
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error("Error:", error);
        alert("Could not redirect to the customer portal.");
        return;
      }
      // Redirect to the Stripe billing portal
      window.location.href = url;
    } catch (err) {
      console.error("Unexpected error:", err.message);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(
      "pricing-table-id",
      process.env.PRICING_TABLE,
      "publishable-key",
      process.env.STRIPE_PK_KEY
    );
    // Fetch the latest profile data on component mount
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profile_updates")
          .select("new_name, new_organization")
          .eq("user_email", email)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile data:", error.message);
        } else if (data) {
          setNewName(data.new_name || "");
          setNewOrg(data.new_organization || "");
        } else {
          setNewName("");
          setNewOrg("");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err.message);
      }
    };

    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_email", email)
          .single();

        if (data) {
          setIsSubscribed(true);

          const user_stripe = await supabase
            .from("user_stripe")
            .select("*")
            .eq("email", email)
            .single();
          if (user_stripe.data) {
            setCustomerId(user_stripe.data.customer_id);
          }
        } else if (error) {
          console.log("No active subscription found:", error.message);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err.message);
      }
    };

    fetchProfileData();
    fetchSubscriptionStatus();
  }, [email]);

  const handleEditSubmit = async () => {
    try {
      if (!newName.trim() || !newOrg.trim()) {
        alert("Name and Organization cannot be empty.");
        return;
      }

      const { error } = await supabase.from("profile_updates").insert({
        user_email: email,
        new_name: newName,
        new_organization: newOrg,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving profile update:", error.message);
        return;
      }

      // Show popup instead of alert
      setPopupMessage("Profile updated successfully!");
      setShowPopup(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Error during profile update:", err.message);
    }
  };

  const handleSubscribe = () => {
    setshowSubscribeTable(true);
    // setShowPricingTable(true);
    // router.push("/subscription"); // Update to match your folder structure
  };

  const handleManageSubscription = () => {
    // Redirect to Stripe Customer Portal for managing subscription
    // window.location.href =
    // "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144";
    /*   window.location.href = "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144"; */
    handleRedirectToPortal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className=" bg-[#f5f5f5] rounded-xl p-6 shadow-lg relative mb-6 border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-medium">Profile</h2>
            <ModernButton
              text={isEditing ? "X" : "Edit"}
              onClick={() => setIsEditing(!isEditing)}
            />
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter new name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter new organization"
                />
              </div>
              <ModernButton text="Save" onClick={handleEditSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <i className="fas fa-user text-xl text-gray-400"></i>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-medium">{newName}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <i className="fas fa-building text-xl text-gray-400"></i>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="text-lg font-medium">{newOrg}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <i className="fas fa-envelope text-xl text-gray-400"></i>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium">{email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Section */}
        <div className=" bg-[#f5f5f5] rounded-xl p-6 shadow-lg relative mb-6 border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-medium">Subscription</h2>
            <ModernButton
              text={isSubscribed ? "Manage" : "Subscribe"}
              onClick={
                isSubscribed ? handleManageSubscription : handleSubscribe
              }
            />
          </div>
          {!isSubscribed && showSubscribeTable && (
            <SubscribeView></SubscribeView>
          )}

          {showPricingTable && (
            <div className="mt-4">
              <script
                async
                src="https://js.stripe.com/v3/pricing-table.js"
              ></script>

              <stripe-pricing-table
                pricing-table-id="prctbl_1QfSw5E43xWZCXH3onBilnVu"
                publishable-key="pk_live_51QX5gGE43xWZCXH3ivdyoCspjeEUT2TVUCeNyAvwykKpSw95ZayoUndnephVBzkySNaqtjvJ0JVjTU4KEW7GLdN100uKErd8KG"
              ></stripe-pricing-table>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className=" bg-[#f5f5f5] rounded-xl p-6 shadow-lg relative  border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-medium">Support</h2>
            <ModernButton
              text="Chat"
              onClick={() => {
                window.location.href =
                  "mailto:contact@hellobrokr.com?bcc=serkan@hellobrokr.com&subject=brokr%20Support";
              }}
            />
          </div>
        </div>
      </div>

      {showPopup && (
        <Popup message={popupMessage} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default NewComponent;
