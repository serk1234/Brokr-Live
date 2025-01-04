"use client";

import React, { useState } from "react";
import StylizedButton from "../components/stylized-button";

function NewComponent() {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("Jane Doe");
  const [newOrg, setNewOrg] = useState("XYZ Inc.");
  const [email] = useState("jane.doe@example.com");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDetails, setPlanDetails] = useState("");
  const [planCost, setPlanCost] = useState("");
  const [storageUsed] = useState(35);
  const [storageLimit] = useState(50);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    setPlanName("Basic Plan");
    setPlanDetails("All features included • 50GB Storage");
    setPlanCost("$1,000/mo");
    window.location.href = "https://buy.stripe.com/8wM9D66RT1E6bhCfYY";
  };

  const handleManage = () => {
    window.location.href = "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144";
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
       

          {/* Subscription Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg relative">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E7F1] flex items-center justify-center">
                  <i className="fas fa-crown text-2xl"></i>
                </div>
                <h2 className="text-2xl font-medium font-open-sans">Subscription</h2>
              </div>
              <div className="absolute right-6">
                {!isSubscribed ? (
                  <StylizedButton text="Subscribe" onClick={handleSubscribe} />
                ) : (
                  <StylizedButton text="Manage" onClick={handleManage} />
                )}
              </div>
            </div>
            {isSubscribed && (
              <div>
                <h3 className="text-xl font-medium">{planName}</h3>
                <p>{planDetails}</p>
                <p className="text-2xl font-semibold">{planCost}</p>
              </div>
            )}
            <div className="mt-4">
              <p>
                Storage: {storageUsed}GB of {storageLimit}GB used (
                {Math.round((storageUsed / storageLimit) * 100)}%)
              </p>
              <div className="w-full bg-gray-300 h-4 rounded-lg overflow-hidden mt-2">
                <div
                  className="bg-[#A3E636] h-full"
                  style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                ></div>
              </div>
            </div>
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
                <StylizedButton text="Chat" onClick={() => alert("Support chat clicked")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewComponent;
