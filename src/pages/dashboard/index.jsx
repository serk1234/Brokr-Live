"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import HeaderLive from "../../components/header-live";
import StylizedButton from "../../components/stylized-button";
import Footer from "../../components/footer";
import "../../app/globals.css";
import { useRouter } from "next/router";

function MainComponent() {
  const [userDatarooms, setUserDatarooms] = useState([]);
  const [invitedDatarooms, setInvitedDatarooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDataroomName, setNewDataroomName] = useState("");
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Fetch authenticated user email
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        fetchUserDatarooms(user.email);
        fetchInvitedDatarooms(user.email);
      } else if (error) {
        console.error("Error fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  // Fetch user's own datarooms
  const fetchUserDatarooms = async (email) => {
    const { data, error } = await supabase
      .from("datarooms")
      .select("id, name, organization, status")
      .eq("user_email", email);

    if (error) {
      console.error("Error fetching datarooms:", error.message);
    } else {
      setUserDatarooms(data);
    }
  };

  // Fetch datarooms where the user is invited
  const fetchInvitedDatarooms = async (email) => {
    const { data, error } = await supabase
      .from("invited_users")
      .select("datarooms(id, name, organization, status)")
      .eq("email", email);

    if (error) {
      console.error("Error fetching invited datarooms:", error.message);
    } else {
      const transformedData = data.map((entry) => entry.datarooms);
      setInvitedDatarooms(transformedData);
    }
  };

  // Handle creating a new dataroom
  const handleCreateDataroom = async () => {
    if (newDataroomName.trim()) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("datarooms").insert([
        {
          name: newDataroomName.trim(),
          organization: newOrganizationName.trim() || null,
          user_email: user.email,
        },
      ]);

      if (error) {
        console.error("Error inserting dataroom:", error.message);
      } else {
        fetchUserDatarooms(user.email); // Refresh the dataroom list
        setNewDataroomName("");
        setNewOrganizationName("");
        setShowModal(false);
      }
    }
  };

  const handleRedirect = (id, isInvited = false) => {
    if (isInvited) {
      router.push({
        pathname: "/userview",
        query: { id },
      });
    } else {
      router.push({
        pathname: "/TeamView",
        query: { id },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative z-50">
        <HeaderLive email={userEmail || "Loading..."} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Team Section */}
          <div className="bg-black rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Team</h2>
              <StylizedButton
                text={<i className="fas fa-plus"></i>}
                className="px-3 py-2 bg-[#A3E636] text-black text-sm rounded"
                onClick={() => setShowModal(true)}
              />
            </div>

            {/* Datarooms */}
            <div className="grid grid-cols-2 gap-4">
              {userDatarooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-[#121212] border border-gray-200 hover:bg-black/80 transition rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-white font-semibold">{room.name}</h3>
                    {room.organization && (
                      <p className="text-sm text-gray-400">{room.organization}</p>
                    )}
                  </div>
                  <StylizedButton
                    text={<i className="fas fa-arrow-right"></i>}
                    className="ml-4 px-3 py-2 bg-[#A3E636] text-black text-sm rounded shadow-lg"
                    onClick={() => handleRedirect(room.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">User</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {invitedDatarooms.length > 0 ? (
                invitedDatarooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-gray-100 border border-gray-200 hover:bg-gray-200 transition rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-gray-800 font-semibold">{room.name}</h3>
                      {room.organization && (
                        <p className="text-sm text-gray-600">{room.organization}</p>
                      )}
                    </div>
                    <StylizedButton
                      text={<i className="fas fa-arrow-right"></i>}
                      className="ml-4 px-3 py-2 bg-[#A3E636] text-black text-sm rounded shadow-lg"
                      onClick={() => handleRedirect(room.id, true)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">"No data available"</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-black rounded-xl p-6 shadow-md border border-[#A3E636] max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Dataroom</h2>
              <StylizedButton
                text={<i className="fas fa-times"></i>}
                onClick={() => setShowModal(false)}
              />
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newDataroomName}
                onChange={(e) => setNewDataroomName(e.target.value)}
                placeholder="Enter dataroom name"
                className="w-full px-4 py-2 bg-[#121212] text-white border border-[#A3E636] rounded-lg focus:ring-2 focus:ring-[#A3E636]"
              />

              <StylizedButton text="Create" onClick={handleCreateDataroom} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer title="Create" logoSrc="/logo.png" />
    </div>
  );
}

export default MainComponent;
