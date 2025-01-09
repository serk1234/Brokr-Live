"use client";

import React, { useEffect, useState } from "react";
import StylizedButton from "../components/stylized-button";
import { supabase } from "../../src/app/supabaseClient";
import { useRouter } from "next/router";

function HeaderLive({ email }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [dataroomOpen, setDataroomOpen] = useState(false);
  const [teamDatarooms, setTeamDatarooms] = useState([]);
  const [userDatarooms, setUserDatarooms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDatarooms = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Error fetching user:", authError.message);
        return;
      }

      // Fetch team datarooms
      const { data: teamData, error: teamError } = await supabase
        .from("datarooms")
        .select("id, name")
        .eq("user_email", user.email);

      if (teamError) {
        console.error("Error fetching team datarooms:", teamError.message);
      } else {
        setTeamDatarooms(teamData);
      }

      // Fetch user datarooms
      const { data: userData, error: invitedError } = await supabase
        .from("invited_users")
        .select("datarooms (id, name)")
        .eq("email", user.email);

      if (invitedError) {
        console.error("Error fetching user datarooms:", invitedError.message);
      } else {
        setUserDatarooms(userData.map((item) => item.datarooms));
      }
    };

    fetchDatarooms();
  }, []);

  const handleRedirect = (dataroomId, isUserDataroom = false) => {
    if (isUserDataroom) {
      router.push({
        pathname: "/userview",
        query: { id: dataroomId },
      });
    } else {
      router.push({
        pathname: "/TeamView",
        query: { id: dataroomId },
      });
    }
  };

  const handleSettings = () => {
    router.push("/profilesettings"); // Update to match your folder structure
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "https://brokr.live";
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <>
      <header className="bg-black p-4 flex items-center justify-between backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center gap-4">
          <a
            onClick={() => router.push("/dashboard")}
            className="text-white font-semibold text-xl font-open-sans hover:text-[#A3E636] transition-colors"
          >
            brokr
          </a>
          {/* Dataroom Dropdown */}
          {/* Dataroom Dropdown */}
          <div className="relative inline-block min-w-[48px]">
            <StylizedButton
              onClick={() => setDataroomOpen(!dataroomOpen)}
              text={
                <div className="flex items-center gap-2">
                  <i className="fas fa-chevron-down transition-transform duration-200 ease-in-out"></i>
                </div>
              }
            />
            {dataroomOpen && (
              <div className="absolute left-0 mt-2 w-[320px] bg-black/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl p-2 transition-all duration-200 ease-in-out">
                {/* Team Datarooms */}
                <div className="mb-2">
                  <p className="text-gray-400 text-xs px-4 py-2">TEAM DATAROOMS</p>
                  {teamDatarooms.length > 0 ? (
                    teamDatarooms.map((item) => (
                      <a
                        key={item.id}
                        onClick={() => handleRedirect(item.id)}
                        className="block w-full px-4 py-3 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-150 group cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate mb-0.5">{item.name}</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-600 group-hover:text-[#A3E636] transition-colors flex-shrink-0"></i>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm px-4 py-2">No team datarooms available</p>
                  )}
                </div>

                {/* User Datarooms */}
                <div>
                  <p className="text-gray-400 text-xs px-4 py-2">USER DATAROOMS</p>
                  {userDatarooms.length > 0 ? (
                    userDatarooms.map((item) => (
                      <a
                        key={item.id}
                        onClick={() => handleRedirect(item.id, true)}
                        className="block w-full px-4 py-3 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-150 group cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate mb-0.5">{item.name}</p>
                          </div>
                          <i className="fas fa-chevron-right text-gray-600 group-hover:text-[#A3E636] transition-colors flex-shrink-0"></i>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm px-4 py-2">No user datarooms available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative inline-block min-w-[48px]">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="group w-full px-4 py-2 rounded-lg text-gray-800 font-medium bg-gray-200 hover:bg-gray-300 transition-all duration-200 flex items-center gap-2"
          >
            <i className="fas fa-user"></i>
            <i className="fas fa-chevron-down transition-transform duration-200 ease-in-out"></i>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-[220px] bg-black/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl p-2 transition-all duration-200 ease-in-out">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm text-gray-400 truncate">{email}</p>
              </div>
              <button
                onClick={handleSettings}
                className="w-full px-4 py-3 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-150 group flex items-center justify-between"
              >
                <span>Settings</span>
                <i className="fas fa-cog text-gray-600 group-hover:text-[#A3E636] transition-colors"></i>
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-lg text-white font-medium hover:bg-white/10 transition-all duration-150 group flex items-center justify-between"
              >
                <span>Log Out</span>
                <i className="fas fa-sign-out-alt text-gray-600 group-hover:text-[#A3E636] transition-colors"></i>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default HeaderLive;

