"use client";

import { supabase } from "@/app/supabaseClient";
import { useEffect, useState } from "react";

function Dashboard({
  stats = {},
  activeUsers = [],
  activities = [],
  documents = [],
  teamMembers = [],
  dataroomId,
}) {
  const [totalUser, setTotalUser] = useState("Loading...");
  const [totalActiveUser, setTotalActiveUser] = useState("Loading...");
  const [totalDownloads, setTotalDownloads] = useState("Loading...");
  const [timeSpent, setTimeSpend] = useState("Loading...");

  const handleViewClick = (section) => {
    const routes = {
      team: "/9998",
      users: "/1",
      activity: "/9998",
      contents: "/X957X859",
    };
    window.location.href = routes[section];
  };

  useEffect(() => {
    const fetchUserSessionAndData = async () => {
      var result = await supabase
        .from("datarooms")
        .select("*,file_uploads(*),invited_users(*),file_downloads(*) ")
        .eq("id", dataroomId)
        .single();
      console.log(result);
      if (result.error) {
        console.log(result.error);
        return;
      }
      setTotalUser(result.data.invited_users.length.toString());
      setTotalDownloads(result.data.file_downloads.length.toString());
      setTotalActiveUser(
        result.data.invited_users
          .filter((e) => e.status == "active")
          .length.toString()
      );
    };
    fetchUserSessionAndData();
  }, []);

  return (
    <div className="bg-white text-black p-8 rounded-2xl">
      <div className="mb-12">
        <h2 className="text-3xl font-light hover:text-[#A3E636] transition-colors duration-300">
          Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Users",
            value: totalUser,
            growth: stats.userGrowth,
          },
          {
            label: "Active Users",
            value: totalActiveUser,
            growth: stats.activeGrowth,
          },
          {
            label: "Downloads",
            value: totalDownloads,
            growth: stats.downloadGrowth,
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300"
          >
            <div className="flex flex-col h-full">
              <div className="text-4xl font-light mb-4 group-hover:text-[#A3E636] text-gray-800">
                {stat.value || 0}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-700 text-sm group-hover:text-black">
                  {stat.label}
                </div>
                <div className="px-3 py-1 bg-[#eee] rounded-full text-[#A3E636] text-sm hover:bg-[#A3E636] hover:text-white">
                  +{stat.growth || 0}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-light hover:text-[#A3E636]">Team</h3>
            <button
              onClick={() => handleViewClick("team")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eee] hover:bg-[#A3E636] hover:text-white transition-all duration-300"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-[#eee] rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#A3E636] text-white rounded-lg flex items-center justify-center mr-3">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-light">{member.name}</div>
                    <div className="text-xs text-gray-700">{member.role}</div>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs ${
                    member.role === "Admin"
                      ? "bg-[#A3E636] text-white"
                      : "bg-[#ddd] text-gray-700"
                  }`}
                >
                  {member.role === "Admin" ? "Full Access" : "View Only"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-light hover:text-[#A3E636]">Users</h3>
            <button
              onClick={() => handleViewClick("users")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eee] hover:bg-[#A3E636] hover:text-white transition-all duration-300"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="space-y-4">
            {activeUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-[#eee] rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#eee] rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-eye"></i>
                  </div>
                  <div>
                    <div className="font-light">{user.name}</div>
                    <div className="text-xs text-gray-700">
                      {user.timeSpent}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-700">
                  {user.downloads} downloads
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-light hover:text-[#A3E636]">
              Activity
            </h3>
            <button
              onClick={() => handleViewClick("activity")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eee] hover:bg-[#A3E636] hover:text-white transition-all duration-300"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center p-3 hover:bg-[#eee] rounded-lg"
              >
                <div className="w-8 h-8 bg-[#eee] rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="flex-grow">
                  <div className="font-light text-sm">{activity.user}</div>
                  <div className="text-xs text-gray-700">{activity.action}</div>
                </div>
                <div className="text-xs text-gray-700">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-light hover:text-[#A3E636]">Contents</h3>
          <button
            onClick={() => handleViewClick("contents")}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eee] hover:bg-[#A3E636] hover:text-white transition-all duration-300"
          >
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-[#eee] rounded-xl hover:bg-[#e2e2e2] transition-all duration-300 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#ddd] rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#A3E636] group-hover:text-white transition-all duration-300">
                  <i className="fas fa-eye"></i>
                </div>
                <div>
                  <div className="font-light group-hover:text-[#A3E636]">
                    {doc.name}
                  </div>
                  <div className="text-xs text-gray-700 group-hover:text-black">
                    Added {doc.dateAdded}
                  </div>
                </div>
              </div>
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="font-light group-hover:text-[#A3E636]">
                    {doc.views}
                  </div>
                  <div className="text-xs text-gray-700 group-hover:text-black">
                    Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-light group-hover:text-[#A3E636]">
                    {doc.downloads}
                  </div>
                  <div className="text-xs text-gray-700 group-hover:text-black">
                    Downloads
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryComponent() {
  const mockData = {
    stats: {
      totalUsers: 342,
      userGrowth: 12,
      activeUsers: 156,
      activeGrowth: 8,
      downloads: 1234,
      downloadGrowth: 15,
      timeSpent: "456h",
      timeGrowth: 10,
    },
    teamMembers: [
      { name: "John Doe", role: "Admin", status: "Full Access" },
      { name: "Jane Smith", role: "Editor", status: "View Only" },
      { name: "Bob Wilson", role: "Viewer", status: "View Only" },
      { name: "Alice Brown", role: "Editor", status: "View Only" },
    ],
    activeUsers: [
      {
        name: "Sarah Johnson",
        timeSpent: "12h 30m",
        views: 145,
        downloads: 23,
      },
      { name: "Michael Chen", timeSpent: "10h 15m", views: 98, downloads: 15 },
      { name: "Emily Davis", timeSpent: "8h 45m", views: 76, downloads: 12 },
      { name: "James Wilson", timeSpent: "7h 20m", views: 65, downloads: 8 },
    ],
    activities: [
      {
        type: "view",
        user: "Sarah Johnson",
        action: "Viewed Financial Report.pdf",
        time: "2m ago",
      },
      {
        type: "view",
        user: "Michael Chen",
        action: "Viewed Term Sheet.docx",
        time: "5m ago",
      },
      {
        type: "view",
        user: "Emily Davis",
        action: "Viewed Pitch Deck.pptx",
        time: "10m ago",
      },
      {
        type: "view",
        user: "James Wilson",
        action: "Viewed Due Diligence.pdf",
        time: "15m ago",
      },
    ],
    documents: [
      {
        name: "Financial Report.pdf",
        dateAdded: "2d ago",
        views: 234,
        downloads: 45,
      },
      {
        name: "Term Sheet.docx",
        dateAdded: "3d ago",
        views: 187,
        downloads: 32,
      },
      {
        name: "Pitch Deck.pptx",
        dateAdded: "4d ago",
        views: 156,
        downloads: 28,
      },
      {
        name: "Due Diligence.pdf",
        dateAdded: "5d ago",
        views: 134,
        downloads: 23,
      },
    ],
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <MainComponent {...mockData} />
    </div>
  );
}

export default Dashboard;
