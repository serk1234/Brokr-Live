"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../src/app/supabaseClient";
import ModernButton from "./modern-button";
import { useRouter } from "next/router";


function Usermanagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [activeUsers, setActiveUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmails, setInviteEmails] = useState([""]);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const router = useRouter();


  // Fetch all users from Supabase
  const fetchUsers = async (dataroomId) => {
    try {
      if (!dataroomId) {
        console.error("Dataroom ID is missing");
        return;
      }

      const { data, error } = await supabase
        .from("invited_users")
        .select("*")
        .eq("dataroom_id", dataroomId); // Filter users by dataroom_id

      if (error) throw error;

      setInvitedUsers(data.filter((user) => user.status === "invited"));
      setActiveUsers(data.filter((user) => user.status === "active"));
      setArchivedUsers(data.filter((user) => user.status === "archived"));
    } catch (err) {
      console.error("Error fetching users:", err.message);
    }
  };


  useEffect(() => {
    const dataroomId = router.query.id; // Get dataroom ID from router or props
    if (dataroomId) {
      fetchUsers(dataroomId); // Fetch users for the current dataroom
    }
  }, [router.query.id]);


  // Watch for session changes and update the status to "active"
  useEffect(() => {
    const { subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        try {
          const { error } = await supabase
            .from("invited_users")
            .update({ status: "active" })
            .eq("email", session.user.email);
          if (error) throw error;

          fetchUsers(); // Refresh the user lists
        } catch (err) {
          console.error("Error updating user status:", err.message);
        }
      }
    });

    // Safely unsubscribe only if subscription exists
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleInviteClick = () => setShowInvitePopup(true);

  const handleCloseInvitePopup = () => {
    setShowInvitePopup(false);
    setInviteEmails([""]);
  };

  const updateEmail = (index, value) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const addEmailField = () => setInviteEmails([...inviteEmails, ""]);

  const sendMagicLink = async (email, inviterEmail) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/userview`, // Redirect to the appropriate page
        },
      });
      if (error) throw error;

      console.log(`Magic link sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send magic link to ${email}:`, err.message);
    }
  };

  const fetchDataroomId = async (dataroomName) => {
    const { data, error } = await supabase
      .from("datarooms")
      .select("id")
      .eq("name", dataroomName)
      .maybeSingle(); // Ensure only one result

    if (error) {
      console.error("Error fetching dataroom:", error.message);
      return null;
    }

    return data?.id || null; // Return the UUID only
  };

  const handleInvite = async (inviteeEmail, dataroomId, inviterEmail) => {
    if (!dataroomId) {
      console.error("Dataroom ID is not defined");
      return false;
    }

    try {
      const payload = {
        email: inviteeEmail,
        dataroom_id: dataroomId, // Ensure this is the correct dataroom ID
        status: "invited",
        invited_at: new Date().toISOString(),
        invited_by: inviterEmail,
      };

      console.log("Payload to insert:", payload);

      const { error } = await supabase.from("invited_users").insert(payload);

      if (error) {
        console.error("Error inviting user:", error.message);
        return false;
      }

      console.log(`User ${inviteeEmail} invited to dataroom ID ${dataroomId}`);
      return true;
    } catch (err) {
      console.error("Unexpected error during invite:", err);
      return false;
    }
  };


  const sendInvites = async () => {
    setLoading(true);
    const inviterEmail = (await supabase.auth.getUser()).data.user.email; // Get inviter's email
    const dataroomId = router.query.id; // Dynamically get the dataroom ID from the router

    if (!dataroomId) {
      alert("No valid dataroom ID found for this invitation.");
      setLoading(false);
      return;
    }

    try {
      for (const email of inviteEmails) {
        if (email.trim()) {
          // Send Magic Link
          await sendMagicLink(email, inviterEmail);

          // Add the user to the dataroom via handleInvite
          const success = await handleInvite(email, dataroomId, inviterEmail);
          if (!success) {
            console.error(`Failed to invite ${email}`);
          }
        }
      }

      alert("Invitations sent successfully!");
      setInviteEmails([""]); // Reset emails
      fetchUsers(); // Refresh user list
      handleCloseInvitePopup(); // Close popup
    } catch (err) {
      console.error("Error sending invites:", err.message);
      alert("An error occurred while sending invitations.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <ModernButton
          text="Invite"
          icon="fa-user-plus"
          onClick={handleInviteClick}
          variant="primary"
        />
      </div>

      <div className="flex gap-4 mb-6">
        {["active", "invited", "archived"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium ${activeTab === tab ? "bg-[#A3E636] text-white" : "bg-gray-200"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "active" &&
          activeUsers.map((user) => (
            <div
              key={user.email}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div>
                <div className="font-medium">{user.name || ""}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(user.invited_at).toLocaleString()}
              </div>
            </div>
          ))}
        {activeTab === "invited" &&
          invitedUsers.map((user) => (
            <div
              key={user.email}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div>
                <div className="font-medium">{user.name || ""}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <div className="text-sm text-gray-500">
                Invited by: {user.invited_by || ""}
                <br />
                {new Date(user.invited_at).toLocaleString()}
              </div>
            </div>
          ))}
        {activeTab === "archived" &&
          archivedUsers.map((user) => (
            <div
              key={user.email}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm"
            >
              <div>
                <div className="font-medium">{user.name || ""}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(user.invited_at).toLocaleString()}
              </div>
            </div>
          ))}
      </div>

      {showInvitePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invite Users</h3>
              <button onClick={handleCloseInvitePopup}>
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>
            <div>
              {inviteEmails.map((email, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  {index === inviteEmails.length - 1 && (
                    <button
                      onClick={addEmailField}
                      className="bg-[#A3E636] text-white p-2 rounded"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={sendInvites}
                disabled={loading}
                className="w-full bg-[#A3E636] text-white p-2 rounded mt-4"
              >
                {loading ? "Sending..." : "Send Invites"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usermanagement;
