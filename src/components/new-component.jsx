"use client";

import React, { useState } from "react";
import StylizedButton from "../components/stylized-button";

function NewComponent({ email }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("Jane Doe");
  const [newOrg, setNewOrg] = useState("XYZ Inc.");
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
          {/* Profile Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg relative">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#E0E7F1] flex items-center justify-center">
                  <i className="fas fa-user text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-medium font-open-sans">
                    Profile
                  </h2>
                </div>
              </div>
              <div className="absolute right-6">
                <StylizedButton
                  text="Edit"
                  onClick={() => setIsEditing(true)}
                />
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
                  <h2 className="text-2xl font-medium font-open-sans">
                    Subscription
                  </h2>
                </div>
              </div>
              <div className="absolute right-6">
                <StylizedButton
                  text="Manage"
                  onClick={handleManage}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-open-sans text-xl font-medium mb-1">
                  {planName}
                </h3>
                <p className="text-gray-500 font-open-sans">{planDetails}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-open-sans text-2xl font-semibold">
                  {planCost}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold font-open-sans text-gray-700">
                    Auto-upgrade when storage full
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-white peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#A3E636] border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-open-sans text-gray-600">
                    <span>
                      Storage ({storageUsed}GB of {storageLimit}GB used)
                    </span>
                    <span>
                      {Math.round((storageUsed / storageLimit) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-lg h-4 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-[2px]">
                    <div
                      className="bg-[#A3E636] h-full rounded-[4px] transition-all duration-500 ease-out"
                      style={{
                        width: `${(storageUsed / storageLimit) * 100}%`,
                      }}
                    >
                      <div className="w-full h-full bg-[url('data:image/svg+xml;base64,...')] opacity-50"></div>
                    </div>
                  </div>
                </div>
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
