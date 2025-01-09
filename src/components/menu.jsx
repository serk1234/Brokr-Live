"use client";
import React from "react";

function Menu({ activeTab, setActiveTab, teamCount, activeUsers, contentCount }) {
  const tabs = [
    { name: "dashboard", icon: "fas fa-dashboard", label: "Dashboard", badge: contentCount || null },
    { name: "contents", icon: "fas fa-file-lines", label: "Contents", badge: contentCount || null },
    { name: "users", icon: "fas fa-user", label: "Users", badge: activeUsers.length || null },
    { name: "team", icon: "fas fa-users", label: "Team", badge: teamCount || null },
    { name: "settings", icon: "fas fa-cog", label: "Settings", badge: null },
  ];

  return (
    <>
      {/* Desktop Sidebar */}

      <div className=" top-sidebar sm:flex hidden flex-col gap-4 p-4 border-r border-gray-100 ">
        <ul className="space-y-4">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`group cursor-pointer ${activeTab === tab.name ? "bg-gray-100" : ""}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <div className="flex items-center p-2 rounded hover:bg-gray-100">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg border border-black">
                  <i className={tab.icon}></i>
                </div>
                <span className="ml-3">{tab.label}</span>
              </div>
              {tab.badge && (
                <div className="ml-auto px-2 py-1 bg-[#A3E636] text-black text-xs font-semibold rounded-full border border-black">
                  {tab.badge}
                </div>
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
            className={`mobile-bottom-menu-item flex flex-col items-center text-xs 
            ${activeTab === tab.name ? "text-lime-600" : ""
              }`}
            onClick={() => setActiveTab(tab.name)}
          >
            <i className={`${tab.icon} text-lg`}></i>
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default Menu;
