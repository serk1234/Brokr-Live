"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import StylizedButton from "../components/stylized-button";

function NewComponent({ email }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPricingTable, setShowPricingTable] = useState(false);

  useEffect(() => {
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

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error during profile update:", err.message);
    }
  };

  const handleSubscribe = () => {
    // setShowPricingTable(true);
    router.push("/subscription"); // Update to match your folder structure
  };

  const handleManageSubscription = () => {
    // Redirect to Stripe Customer Portal for managing subscription
    window.location.href =
      "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144";
    /*   window.location.href = "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144"; */
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg relative mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-medium">Profile</h2>
            <StylizedButton
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
              <StylizedButton text="Save" onClick={handleEditSubmit} />
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
        <div className="bg-white rounded-xl p-6 shadow-lg relative mb-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-medium">Subscription</h2>
            <StylizedButton
              text={isSubscribed ? "Manage" : "Subscribe"}
              onClick={
                isSubscribed ? handleManageSubscription : handleSubscribe
              }
            />
          </div>

          {showPricingTable && (
            <div className="mt-4">
              <script
                async
                src="https://js.stripe.com/v3/pricing-table.js"
              ></script>
              {/*  <stripe-pricing-table
                pricing-table-id="prctbl_1QfSw5E43xWZCXH3onBilnVu"
                publishable-key="pk_live_51QX5gGE43xWZCXH3ivdyoCspjeEUT2TVUCeNyAvwykKpSw95ZayoUndnephVBzkySNaqtjvJ0JVjTU4KEW7GLdN100uKErd8KG"
              ></stripe-pricing-table>

              <script
                async
                src="https://js.stripe.com/v3/pricing-table.js"
              ></script> */}
              <stripe-pricing-table
                pricing-table-id="prctbl_1QfokrE43xWZCXH3U7IfKTYf"
                publishable-key="pk_test_51QX5gGE43xWZCXH3LJ2HhFEboXxnv9Xas2Nnwm2vCmvyijbxXIV17UrkpTRgVELKcAsFUNYakl1nGFaItc0oC51N00jOTphvFi"
              ></stripe-pricing-table>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg relative">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-medium">Support</h2>
            <StylizedButton
              text="Chat"
              onClick={() => alert("Support chat clicked")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewComponent;
