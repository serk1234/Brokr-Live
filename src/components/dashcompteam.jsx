"use client";

import React, { useState } from "react";

function Dashcompteam() {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="px-6">
      <div className="bg-white p-6 rounded-lg border border-black mb-6">
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "active"
                ? "bg-[#A3E636] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Users (53)
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "invited"
                ? "bg-[#A3E636] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("invited")}
          >
            Invited Users (19)
          </button>
        </div>
      </div>
    </div>
  );
}

function DashcompteamStory() {
  return <Dashcompteam />;
}

export default Dashcompteam;