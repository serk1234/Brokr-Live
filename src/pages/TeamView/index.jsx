"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import Contentmanager from "../../components/contentmanager";
import Dashboard from "../../components/dashboard";
import Dashcompteam from "../../components/dashcompteam";
import Footer from "../../components/footer";
import HeaderLive from "../../components/header-live";
import Menu from "../../components/menu";
import SettingsTab from "../../components/settings-tab";
import Teamactivity from "../../components/teamactivity";
import Teamsecteam from "../../components/teamsecteam";
import Title from "../../components/title";
import Usermanagement from "../../components/usermanagement";

function MainComponent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("contents");
  const [displayName, setDisplayName] = useState("Loading...");
  const [teamCount, setTeamCount] = useState(0);
  const [newMessages, setNewMessages] = useState(0);
  const [currentChat, setCurrentChat] = useState(null);
  const [userEmail, setUserEmail] = useState("Loading...");
  const [status, setStatus] = useState("");
  const [organization, setOrganization] = useState("");
  const [dataroomId, setDataroomId] = useState(null);

  // Fetch user session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUserEmail(session.user.email);
        } else {
          console.error(
            "No active session found",
            error?.message || "No user session"
          );
          setUserEmail("No User Found");
        }
      } catch (error) {
        console.error("Error fetching session:", error.message);
        setUserEmail("Error fetching session");
      }
    };

    fetchSession();
  }, []);

  // Fetch dataroom details when query changes
  useEffect(() => {
    if (router.query.id) {
      setDataroomId(router.query.id);
      fetchDataroomDetails(router.query.id);
    }
  }, [router.query]);

  // Fetch dataroom details
  const fetchDataroomDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from("datarooms")
        .select("name, status, organization")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching dataroom details:", error.message);
        setDisplayName("Dataroom Not Found");
        setStatus("N/A");
        setOrganization("N/A");
      } else if (data) {
        setDisplayName(data.name || "Unnamed Dataroom");
        setStatus(data.status || "Live");
        setOrganization(data.organization || "");
      }
    } catch (err) {
      console.error("Unexpected error fetching dataroom details:", err.message);
    }
  };

  return (
    <div className=" team-view min-h-screen flex flex-col bg-gray-100 font-open-sans">
      {/* Header */}
      <HeaderLive email={userEmail} />

      <div className="bg-white shadow">
        <div className="px-4 sm:px-7 pt-4 sm:pt-6">
          <Title
            title={displayName}
            organization={organization}
            status={status}
          />
        </div>
        <hr className="border-gray-300 w-full" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col sm:flex-row flex-1">
        {/* Sidebar */}
        <div className="w-full sm:w-[240px] bg-gray-100 text-black flex flex-col border-r border-gray-300 sidebars">
          <Menu
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            teamCount={teamCount}
            activeUsers={[]} // Placeholder for active users
            contentCount={0} // Placeholder for content count
          />
        </div>

        {/* Main Section */}
        <div className="flex-1 bg-white p-4 sm:p-6">
          {activeTab === "settings" && (
            <SettingsTab
              dataroomName={displayName}
              setDataroomName={setDisplayName}
              displayStatus={status}
              setDisplayStatus={setStatus}
              organization={organization}
              setOrganization={setOrganization}
            />
          )}
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "users" && <Usermanagement />}
          {activeTab === "dashboard" && <Dashcompteam />}
          {activeTab === "activity" && <Teamactivity activities={[]} />}
          {activeTab === "contents" && dataroomId && (
            <Contentmanager items={[]} dataroomId={dataroomId} />
          )}
          {activeTab === "team" && <Teamsecteam />}
        </div>
      </div>

      {/* Footer */}
      {/* Footer */}
      <div className="team-view-footer">
        <Footer />
      </div>

    </div>
  );
}

export default MainComponent;
