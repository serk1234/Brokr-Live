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
  setActiveTab,
}) {
  const [totalUser, setTotalUser] = useState("Loading...");
  const [totalActiveUser, setTotalActiveUser] = useState("Loading...");
  const [totalDownloads, setTotalDownloads] = useState("Loading...");
  const [timeSpent, setTimeSpend] = useState("Loading...");
  const [documentList, setDocumentList] = useState([]);
  const [fetchedTeamMembers, setFetchedTeamMembers] = useState([]);
  const [fetchedActiveUsers, setFetchedActiveUsers] = useState([]);

  const handleViewClick = (section) => {
    setActiveTab(section);
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

        // Set total users and active users
        setTotalUser(dataroomData.invited_users.length.toString());
        setTotalActiveUser(
          dataroomData.invited_users
            .filter((user) => user.status === "active")
            .length.toString()
        );

        // Set total downloads
        const totalDownloadCount = dataroomData.file_downloads.length;
        setTotalDownloads(totalDownloadCount.toString());

        // Set team members and active users
        setFetchedTeamMembers(dataroomData.invited_users.filter((user) => user.role === "team"));
        setFetchedActiveUsers(dataroomData.invited_users.filter((user) => user.status === "active"));

        // Process document data
        // Process document data
        const formattedDocuments = dataroomData.file_uploads.map((file) => {
          const downloads = dataroomData.file_downloads.filter(
            (download) => download.file_id === file.id
          ).length;

          return {
            name: file.new_name || file.name, // Fallback to original name if new_name is empty
            downloads,
            dateAdded: new Date(file.upload_at).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            }),
          };
        });


        setDocumentList(formattedDocuments);
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

      {/* 3-2-1 Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-6">
        {/* Total Users */}
        <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="text-4xl font-light mb-4 text-gray-800">{totalUser}</div>
          <div className="text-gray-700 text-sm">Total Users</div>
        </div>

        {/* Active Users */}
        <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="text-4xl font-light mb-4 text-gray-800">{totalActiveUser}</div>
          <div className="text-gray-700 text-sm">Active Users</div>
        </div>

        {/* Downloads */}
        <div className="bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="text-4xl font-light mb-4 text-gray-800">{totalDownloads}</div>
          <div className="text-gray-700 text-sm">Downloads</div>
        </div>
      </div>

      {/* Team and Users Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 md:gap-6 mb-6">
        {/* Team */}
        <div className="bg-[#f5f5f5] p-4 rounded-xl border border-[#ddd] hover:border-[#A3E636] transition-all duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-light hover:text-[#A3E636]">Team</h3>
            <button
              onClick={() => handleViewClick("team")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eee] hover:bg-[#A3E636] hover:text-white transition-all duration-300"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Users */}
        <div className="bg-[#f5f5f5] p-4 rounded-xl border border-[#ddd] hover:border-[#A3E636] transition-all duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-light hover:text-[#A3E636]">Users</h3>
            <button
              onClick={() => handleViewClick("users")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eee] hover:bg-[#A3E636] hover:text-white transition-all duration-300"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
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

        {/* Responsive container for mobile */}
        {/* Responsive container for mobile */}
        {/* Responsive container for mobile */}
        <div className="space-y-4">
          {documentList.map((doc, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#eee] rounded-xl hover:bg-[#e2e2e2] transition-all duration-300 group"
            >
              {/* File Icon + Name */}
              <div className="flex items-center w-full md:w-auto">
                <div className="w-10 h-10 bg-[#ddd] rounded-xl flex items-center justify-center mr-4 group-hover:bg-[#A3E636] group-hover:text-white transition-all duration-300">
                  <i className="fas fa-file-lines"></i>
                </div>
                <div className="truncate">
                  <div className="file-name font-light group-hover:text-[#A3E636]">
                    {doc.name}
                  </div>
                  <div className="text-xs text-gray-700 group-hover:text-black">
                    Added {doc.dateAdded}
                  </div>
                </div>
              </div>


              <div className="mt-2 md:mt-0 flex items-center md:justify-end w-full md:w-auto">
                <div
                  className="flex items-center space-x-1 font-bold text-base leading-none"
                  style={{
                    padding: "2px 4px", // Add a slight padding to ensure consistent spacing
                    lineHeight: "1.2", // Ensure proper line height for vertical alignment
                  }}
                >
                  <span className="font-bold text-base">{doc.downloads}</span>
                  <span className="text-sm font-bold ">Downloads</span>
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