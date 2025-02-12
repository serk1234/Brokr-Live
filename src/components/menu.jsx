"use client";
import React from "react";

function Menu({ activeTab, setActiveTab, teamCount, activeUsers, contentCount, newMessages }) {
  const tabs = [
    { name: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { name: "contents", icon: "fas fa-file-alt", label: "Contents" },
    { name: "users", icon: "fas fa-user", label: "Users", badge: activeUsers.length || null },
    { name: "team", icon: "fas fa-users", label: "Team", badge: teamCount || null },

    { name: "settings", icon: "fas fa-cog", label: "Settings" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="top-sidebar sm:flex hidden flex-col gap-4 p-4 border-r border-gray-100">
        <ul className="space-y-4">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`group cursor-pointer flex items-center p-2 rounded hover:bg-gray-200 transition-colors ${activeTab === tab.name ? "bg-gray-100" : ""
                }`}
              onClick={() => setActiveTab(tab.name)}
            >
              <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg border border-black group-hover:bg-black group-hover:text-white transition-colors">
                <i className={`${tab.icon} text-lg`} />
              </div>
              <span className="ml-3">{tab.label}</span>
              {tab.badge && (
                <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                  {tab.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Bottom Menu */}
      <div className="mobile-bottom-menu fixed bottom-0 w-full bg-gray-100 border-t border-gray-300 flex justify-around py-3 sm:hidden">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`flex flex-col items-center text-xs ${activeTab === tab.name ? "text-lime-600" : ""}`}
            onClick={() => setActiveTab(tab.name)}
          >
            <i className={`${tab.icon} text-lg`} />
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default Menu;
