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
  const [documentList, setDocumentList] = useState([]);


  const incrementFileViews = async (fileId) => {
    try {
      const { data, error } = await supabase
        .from("file_uploads")
        .update({ views: supabase.raw("views + 1") }) // Increment the views
        .eq("id", fileId);

      if (error) {
        console.error("Error updating views:", error.message);
      } else {
        console.log("Views updated successfully:", data);
      }
    } catch (err) {
      console.error("Unexpected error updating views:", err.message);
    }
  };

  const handleFileView = async (file) => {
    // Increment the views count
    await incrementFileViews(file.id);

    // Load the file URL or perform other actions
    console.log(`File viewed: ${file.name}`);
  };

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
      try {
        const result = await supabase
          .from("datarooms")
          .select("*, file_uploads(*), invited_users(*), file_downloads(*)")
          .eq("id", dataroomId)
          .single();

        if (result.error) {
          console.error(result.error);
          return;
        }

        const dataroomData = result.data;

        // Calculate total users and active users
        setTotalUser(dataroomData.invited_users.length.toString());
        setTotalActiveUser(
          dataroomData.invited_users
            .filter((user) => user.status === "active")
            .length.toString()
        );

        // Calculate total downloads
        setTotalDownloads(dataroomData.file_downloads.length.toString());

        // Process document data for views and downloads
        const formattedDocuments = dataroomData.file_uploads.map((file) => {
          const views = file.views || 0; // Add a views field to your database if it doesn't exist
          const downloads = dataroomData.file_downloads.filter(
            (download) => download.file_id === file.id
          ).length;

          return {
            name: file.name,
            views,
            downloads,
            dateAdded: new Date(file.upload_at).toLocaleDateString(),
          };
        });

        setDocumentList(formattedDocuments); // Updated to use renamed setter
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    };

    fetchUserSessionAndData();
  }, [dataroomId]);

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
                  className={`px-2 py-1 rounded text-xs ${member.role === "Admin"
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
          {documentList.map((doc, index) => (
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



export default Dashboard;
