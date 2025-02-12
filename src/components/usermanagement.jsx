"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import ModernButton from "./modern-button";
import Popup from "./Popup";
import SubscribeAlert from "./SubscribeAlert";

function Usermanagement() {

  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null); // 🔹 Store user email




  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUserEmail(data.user.email);
      } else {
        console.error("Error fetching user email:", error?.message);
      }
    };
    fetchUserEmail();
  }, []);
  const [activeTab, setActiveTab] = useState("active");
  const [activeUsers, setActiveUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  // Save the local time as a string

  const [loading, setLoading] = useState(false);
  const [inviteEmails, setInviteEmails] = useState([""]);

  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [confirmationPopup, setConfirmationPopup] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);


  const handleRemoveEmailField = (index) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const startChat = async (otherUserEmail) => {
    if (!userEmail) {
      console.error("Error: userEmail is null");
      return;
    }

    console.log("Starting chat with:", otherUserEmail);

    // 1️⃣ Fetch all chat IDs where the other user is a participant
    const { data: otherUserChats, error: otherUserError } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_email", otherUserEmail);

    if (otherUserError) {
      console.error("Error fetching other user's chats:", otherUserError.message);
      return;
    }

    const otherUserChatIds = otherUserChats.map(chat => chat.chat_id);

    // 2️⃣ Check if there's a common chat between the logged-in user and the other user
    const { data: existingChat, error: existingError } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_email", userEmail)
      .in("chat_id", otherUserChatIds);

    if (existingError) {
      console.error("Error checking existing chat:", existingError.message);
      return;
    }

    let chatId;
    if (existingChat.length > 0) {
      console.log("Chat already exists:", existingChat[0].chat_id);
      chatId = existingChat[0].chat_id;
    } else {
      // 3️⃣ Create a new chat
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert([{ type: "private" }])
        .select()
        .single();

      if (chatError) {
        console.error("Error creating chat:", chatError.message);
        return;
      }

      console.log("New chat created:", newChat);
      chatId = newChat.id;

      // 4️⃣ Add both users to the chat
      const { error: participantsError } = await supabase.from("chat_participants").insert([
        { chat_id: chatId, user_email: userEmail },
        { chat_id: chatId, user_email: otherUserEmail }
      ]);

      if (participantsError) {
        console.error("Error adding participants:", participantsError.message);
        return;
      }

      console.log("Chat started successfully!");
    }

    setActiveTab("inbox"); // ✅ Instead of navigating, switch the UI to Inbox
  };



  // Fetch all users from Supabase
  const fetchUsers = async (dataroomId) => {
    try {
      if (!dataroomId) {
        console.error("Dataroom ID is missing");
        return;
      }

      console.log("Fetching users for dataroom ID:", dataroomId); // Debug log
      const { data, error } = await supabase
        .from("invited_users")
        .select("*")
        .eq("dataroom_id", dataroomId); // Filter users by dataroom_id

      if (error) throw error;

      console.log("Fetched users:", data); // Debug log
      setInvitedUsers(data.filter((user) => user.status === "invited"));
      setActiveUsers(data.filter((user) => user.status === "active"));
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
    const { subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email) {
          const dataroomId = router.query.id; // Ensure dataroom ID is available
          if (!dataroomId) {
            console.error("Dataroom ID is missing while updating user status");
            return;
          }

          try {
            const { error } = await supabase
              .from("invited_users")
              .update({ status: "active" })
              .eq("email", session.user.email)
              .eq("dataroom_id", dataroomId); // Include dataroom ID in the query

            if (error) throw error;

            fetchUsers(dataroomId); // Refresh the user lists with the correct dataroom ID
          } catch (err) {
            console.error("Error updating user status:", err.message);
          }
        }
      }
    );

    // Safely unsubscribe only if subscription exists
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [router.query.id]);

  const handleInviteClick = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;

    var response = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_email", user.email)
      .single();

    console.log(response);

    if (!response.data) {
      setShowSubscribeModal(true); // Show the subscribe modal instead of alert
      return;
    }

    setShowInvitePopup(true);
  };

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

  const sendMagicLink = async (email, inviterEmail, dataroomId) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/userview?id=${dataroomId}`, // Append dataroomId
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
        dataroom_id: dataroomId, // Correct dataroom ID
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
    const inviterEmail = (await supabase.auth.getUser()).data.user.email;
    const dataroomId = router.query.id;

    if (!dataroomId) {
      setSuccessMessage("No valid dataroom ID found for this invitation.");
      setShowPopup(true);
      setLoading(false);
      return;
    }

    try {
      for (const email of inviteEmails) {
        if (email.trim()) {
          await sendMagicLink(email, inviterEmail, dataroomId);
          const success = await handleInvite(email, dataroomId, inviterEmail);
          if (!success) {
            console.error(`Failed to invite ${email}`);
          }
        }
      }

      setSuccessMessage("Invitations sent successfully!");
      setShowPopup(true); // Show the popup
      setInviteEmails([""]); // Reset emails
      fetchUsers(dataroomId); // Refresh user list
      handleCloseInvitePopup(); // Close popup
    } catch (err) {
      console.error("Error sending invites:", err.message);
      setSuccessMessage("An error occurred while sending invitations.");
      setShowPopup(true); // Show the popup
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("invited_users")
        .delete()
        .eq("email", userToRemove.email)
        .eq("dataroom_id", router.query.id);

      if (error) throw error;

      // Immediately remove user from UI
      setActiveUsers((prev) =>
        prev.filter((user) => user.email !== userToRemove.email)
      );
      setInvitedUsers((prev) =>
        prev.filter((user) => user.email !== userToRemove.email)
      );

      setConfirmationPopup(false);
      setUserToRemove(null);
    } catch (err) {
      console.error("Error removing user:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const confirmRemoveUser = (user) => {
    setUserToRemove(user);
    setConfirmationPopup(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-light hover:text-[#A3E636] transition-colors duration-300">
          Users
        </h1>
        <ModernButton
          text="Invite"
          icon="fa-user-plus"
          onClick={handleInviteClick}
          variant="primary"
        />
      </div>

      <SubscribeAlert
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />

      {showInvitePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invite Users</h3>
              <button onClick={() => setShowInvitePopup(false)}>
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        {["active", "invited"].map((tab) => (
          <ModernButton
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium ${activeTab === tab ? "bg-[#A3E636] text-black" : "bg-gray-200"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </ModernButton>
        ))}
      </div>

      <div>
        <div></div>

        {activeTab === "active" &&
          activeUsers.map((user) => {
            const storedProfilePic = localStorage.getItem(`profilePic-${user.email}`);

            return (
              <div
                key={user.email}
                className="bg-[#f5f5f5] p-4 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300 mb-4 flex flex-row items-center justify-between gap-4"
              >
                {/* Left Section: Profile Picture & Email */}
                <div className="flex items-center gap-3">
                  {/* Show profile picture only if it exists */}
                  {storedProfilePic && (
                    <img
                      src={storedProfilePic}
                      alt="User Profile"
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    />
                  )}

                  {/* User Email */}
                  <div className="font-medium">{user.email}</div>
                </div>

                {/* Right Section: Active Since & Remove Button */}
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 text-sm">
                    Active Since:{" "}
                    {`${new Date(user.invited_at).toLocaleDateString("en-US")} 
              ${new Date(user.invited_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      hour12: true,
                    })}`}
                  </div>

                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    onClick={() => confirmRemoveUser(user)}
                  >
                    <i className="fas fa-trash-alt text-lg"></i>
                  </button>
                </div>
              </div>
            );
          })}

        {activeTab === "invited" &&
          invitedUsers.map((user) => {
            const storedProfilePic = localStorage.getItem(`profilePic-${user.email}`);

            return (
              <div
                key={user.email}
                className="bg-[#f5f5f5] p-4 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300 mb-4 flex flex-row items-center justify-between gap-4"
              >
                {/* Left Section: Profile Picture & Email */}
                <div className="flex items-center gap-3">
                  {/* Show profile picture only if it exists */}
                  {storedProfilePic && (
                    <img
                      src={storedProfilePic}
                      alt="User Profile"
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    />
                  )}

                  {/* User Email */}
                  <div className="font-medium">{user.email}</div>
                </div>

                {/* Right Section: Invited At & Remove Button */}
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 text-sm">
                    Invited At:{" "}
                    {`${new Date(user.invited_at).toLocaleDateString("en-US")} 
              ${new Date(user.invited_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      hour12: true,
                    })}`}
                  </div>

                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                    onClick={() => confirmRemoveUser(user)}
                  >
                    <i className="fas fa-trash-alt text-lg"></i>
                  </button>
                </div>
              </div>
            );
          })}

        {confirmationPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-96 space-y-4">
              <h2 className="text-xl font-semibold">Confirm User Removal</h2>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove this user? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  onClick={() => setConfirmationPopup(false)} // Close the modal
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  onClick={handleRemoveUser} // Confirm the deletion
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

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
                  {index === inviteEmails.length - 1 ? (
                    <button
                      onClick={addEmailField}
                      className="bg-[#A3E636] text-black p-2 rounded"
                    >
                      +
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRemoveEmailField(index)}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={sendInvites}
                disabled={loading}
                className="w-full bg-[#A3E636] text-black p-2 rounded mt-4"
              >
                {loading ? "Sending..." : "Send Invites"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <Popup
          message={successMessage}
          onClose={() => setShowPopup(false)} // Close popup on click
        />
      )}
    </div>
  );
}

export default Usermanagement;
