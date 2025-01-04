"use client";
import React from "react";



function Menu({
  activeTab,
  setActiveTab,
  teamCount,
  activeUsers,
  contentCount,
}) {
  const tabs = [

    {
      name: "dashboard",
      icon: "fas fa-dashboard",
      label: "Dashboard",
      badge: contentCount || null,
    },
    {
      name: "contents",
      icon: "fas fa-file-lines",
      label: "Contents",
      badge: contentCount || null,
    },
    {
      name: "users",
      icon: "fas fa-user",
      label: "Users",
      badge: activeUsers.length || null,
    },
    {
      name: "team",
      icon: "fas fa-users",
      label: "Team",
      badge: teamCount || null,
    },
    { name: "settings", icon: "fas fa-cog", label: "Settings", badge: null },
  ];

  return (
    <div className="p-2">
      <div className="mb-8">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li
              key={tab.name}
              className={`group flex items-center justify-between cursor-pointer hover:bg-gray-100 p-2 rounded ${activeTab === tab.name ? "bg-gray-100" : ""
                }`}
              onClick={() => setActiveTab(tab.name)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white">
                  <i className={tab.icon}></i>
                </div>
                <span className="ml-2">{tab.label}</span>
              </div>
              {tab.badge > 0 && (
                <div className="px-2 py-1 bg-[#A3E636] rounded-full border border-black text-xs font-semibold">
                  {tab.badge}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MenuStory() {
  const [activeTab, setActiveTab] = React.useState("contents");
  const teamCount = 5;
  const activeUsers = [1, 2, 3, 4];
  const contentCount = 12;

  return (
    <div>
      <Menu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        teamCount={teamCount}
        activeUsers={activeUsers}
        contentCount={contentCount}
      />
    </div>
  );
}

export default Menu;