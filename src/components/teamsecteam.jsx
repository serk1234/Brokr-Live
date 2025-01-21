import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import ModernButton from "./modern-button";

import Popup from "./Popup";
function Teamsecteam({ dataroomName }) {
  const [showPopup, setShowPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    permission: "view",
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const [emails, setEmails] = useState([""]);
  const [currentDataroom, setCurrentDataroom] = useState(dataroomName || "");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // For success message popup
  const [successMessage, setSuccessMessage] = useState("");

  /*   useEffect(() => {
    const fetchInvitedUsers = async () => {
      setIsFetching(true);
      try {
        const { data, error } = await supabase
          .from("datarooms")
          .select("name, user_email, invited_by, created_at")
          .eq("name", currentDataroom)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching invited users:", err.message);
      } finally {
        setIsFetching(false);
      }
    };

    if (currentDataroom) {
      fetchInvitedUsers();
    }
  }, []); */

  useEffect(() => {
    /*  console.log(dataroomName, router.query.name, router.query);
    if (!dataroomName && router.query.name) {
      setCurrentDataroom(router.query.name.trim());
    } */
    const fetchInvitedUsers = async () => {
      setIsFetching(true);
      try {
        const { data, error } = await supabase
          .from("dataroom_teams")
          .select("*")
          .eq("dataroom_id", router.query.id)
          .order("created_at", { ascending: true }); /* await supabase
          .from("datarooms")
          .select("email, invited_by, invited_at")
          .eq("dataroom_id", router.query.id)
          .order("invited_at", { ascending: true }) */

        if (error) throw error;
        console.log(data);
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching invited users:", err.message);
      } finally {
        setIsFetching(false);
      }
    };

    /* if (router.query.id) {
      fetchInvitedUsers();
    } */
    fetchInvitedUsers();
  }, []);

  const handleAddEmailField = () => setEmails([...emails, ""]);

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const handleRemoveEmailField = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const inviterEmail = (await supabase.auth.getUser()).data.user.email;

    try {
      for (const email of emails) {
        if (!email.trim()) {
          setSuccessMessage("Error: Email field cannot be empty.");
          setShowSuccessPopup(true);
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setSuccessMessage(`Error: "${email}" is not a valid email address.`);
          setShowSuccessPopup(true);
          continue;
        }

        // Send Magic Link
        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard?id=${router.query.id}`,
          },
        });

        if (magicLinkError) {
          throw new Error(`Failed to send magic link to ${email}: ${magicLinkError.message}`);
        }

        // Insert into "dataroom_teams"
        const newUser = {
          dataroom_id: router.query.id,
          email,
          invited_by: inviterEmail,
          created_at: new Date(),
          invited_at: new Date(),
          permission: "view",
        };

        const { error: insertError } = await supabase.from("dataroom_teams").insert(newUser);

        if (insertError) {
          throw new Error(`Error inviting user "${email}": ${insertError.message}`);
        }

        // Update the local users state
        setUsers((prevUsers) => [
          ...prevUsers,
          { ...newUser, created_at: newUser.created_at.toISOString() }, // Ensure consistent date format
        ]);
      }

      setSuccessMessage("Invitations sent successfully!");
      setShowSuccessPopup(true);
      setEmails([""]); // Reset email fields
      setShowPopup(false); // Close the popup
    } catch (err) {
      console.error("Error sending invites:", err.message);
      setSuccessMessage(`Error: ${err.message}`);
      setShowSuccessPopup(true);
    } finally {
      setLoading(false);
    }
  };






  const handleRemove = async (team) => {
    setLoading(true); // Optional: Show a loading indicator
    try {
      const { error } = await supabase
        .from("dataroom_teams")
        .delete()
        .eq("id", team.id); // Use the ID to delete the team member

      if (error) {
        console.error("Error removing team member:", error.message);
        setSuccessMessage("Failed to remove the team member.");
        setShowSuccessPopup(true);
        return;
      }

      // Remove the user from the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== team.id));

      // Show success popup
      setSuccessMessage("Team member removed successfully!");
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setSuccessMessage("An error occurred while removing the team member.");
      setShowSuccessPopup(true);
    } finally {
      setLoading(false); // Hide the loading indicator
    }
  };


  const handleEditRole = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].permission =
      updatedUsers[index].permission === "full" ? "view" : "full";
    setUsers(updatedUsers);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-light hover:text-[#A3E636] transition-colors duration-300">Team</div>
          <div className="w-8 h-8 flex items-center justify-center bg-[#A3E636] rounded-full border border-black text-sm font-bold">
            {users.length}
          </div>
        </div>
        <ModernButton onClick={() => setShowPopup(true)} className="px-4 py-2 bg-[#A3E636]">
          <i className="fas fa-user-plus mr-2"></i>Add Team
        </ModernButton>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invite Team</h3>
              <button onClick={() => setShowPopup(false)}>
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>
            <div>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  {index === emails.length - 1 ? (
                    <button
                      onClick={handleAddEmailField}
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#A3E636] text-black p-2 rounded mt-4"
              >
                {loading ? "Sending..." : "Send Invites"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <Popup
          message={successMessage}
          onClose={() => setShowSuccessPopup(false)} // Close popup
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user, index) => (
          <div
            key={index}
            className="bg-gray-100 p-6 rounded-lg shadow-sm bg-[#f5f5f5] p-6 rounded-xl border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-gray-800 font-semibold">{user.email}</div>
              </div>
              <button
                className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"
                onClick={() => handleRemove(user)}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            <div>
              <div className="text-gray-600">
                Invited By: {user.invited_by || "N/A"}
              </div>
              <div className="text-gray-600">
                Created At: {new Date(user.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>



    </div>
  );
}

export default Teamsecteam;

