"use client";

import React, { useState, useEffect } from "react";
import StylizedButton from "../components/stylized-button";
import { supabase } from "../../src/app/supabaseClient";

function NewComponent({ email }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("Jane Doe");
  const [newOrg, setNewOrg] = useState("XYZ Inc.");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDetails, setPlanDetails] = useState("");
  const [planCost, setPlanCost] = useState("");
  const [showPricingTable, setShowPricingTable] = useState(false);
  const [storageUsed] = useState(35);
  const [storageLimit] = useState(50);

  useEffect(() => {
    // Fetch subscription status from Supabase
    const fetchSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_email", email)
          .single();

        if (data) {
          setIsSubscribed(true);
          setPlanName(data.plan_name);
          setPlanDetails(data.plan_details);
          setPlanCost(data.plan_cost);
        } else if (error) {
          console.log("No active subscription found:", error.message);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err.message);
      }
    };

    fetchSubscriptionStatus();
  }, [email]);

  const handleSubscribe = () => {
    setShowPricingTable(true);
  };

  const handleManageSubscription = () => {
    // Redirect to Stripe Customer Portal for managing subscription
    window.location.href = "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144";
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg relative">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E7F1] flex items-center justify-center">
                  <i className="fas fa-user text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-medium font-open-sans">Profile</h2>
                </div>
              </div>
              <div className="absolute right-6">
                <StylizedButton text="Edit" onClick={() => setIsEditing(true)} />
              </div>
            </div>

            {isEditing ? (
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-open-sans mb-1 flex items-center gap-2">
                    <i className="fas fa-user text-gray-400"></i>
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#A3E636] outline-none"
                    name="name"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-open-sans mb-1 flex items-center gap-2">
                    <i className="fas fa-building text-gray-400"></i>
                    Organization
                  </label>
                  <input
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#A3E636] outline-none"
                    name="organization"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-open-sans mb-1 flex items-center gap-2">
                    <i className="fas fa-envelope text-gray-400"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 rounded-lg border bg-gray-50 text-gray-500"
                    name="email"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-open-sans text-gray-500 flex items-center gap-2">
                    <i className="fas fa-user text-gray-400"></i>
                    Name
                  </label>
                  <span className="font-open-sans text-lg">{newName}</span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-open-sans text-gray-500 flex items-center gap-2">
                    <i className="fas fa-building text-gray-400"></i>
                    Organization
                  </label>
                  <span className="font-open-sans text-lg">{newOrg}</span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-open-sans text-gray-500 flex items-center gap-2">
                    <i className="fas fa-envelope text-gray-400"></i>
                    Email
                  </label>
                  <span className="font-open-sans text-lg">{email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg relative">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E7F1] flex items-center justify-center">
                  <i className="fas fa-crown text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-medium font-open-sans">Subscription</h2>
                </div>
              </div>
              <div className="absolute right-6">
                <StylizedButton
                  text={isSubscribed ? "Manage" : "Subscribe"}
                  onClick={isSubscribed ? handleManageSubscription : handleSubscribe}
                />
              </div>
            </div>

            {showPricingTable && (
              <div className="mt-4">
                {/* Embed Stripe Pricing Table */}
                <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
                <stripe-pricing-table
                  pricing-table-id="prctbl_1QfSw5E43xWZCXH3onBilnVu"
                  publishable-key="pk_live_51QX5gGE43xWZCXH3ivdyoCspjeEUT2TVUCeNyAvwykKpSw95ZayoUndnephVBzkySNaqtjvJ0JVjTU4KEW7GLdN100uKErd8KG"
                ></stripe-pricing-table>
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E7F1] flex items-center justify-center">
                  <i className="fas fa-comments text-2xl"></i>
                </div>
                <h2 className="text-2xl font-medium font-open-sans">Support</h2>
              </div>
              <div className="absolute right-6">
                <StylizedButton
                  text="Chat"
                  onClick={() => alert("Support chat clicked")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewComponent;
