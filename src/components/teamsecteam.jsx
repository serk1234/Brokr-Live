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
  const [emails, setEmails] = useState([""]);
  const [currentDataroom, setCurrentDataroom] = useState(dataroomName || "");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCreatorAndUsers = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Error fetching authenticated user:", authError.message);
          return;
        }

        // Set the creator's email
        setCreatorEmail(user.email);

        // Fetch all users in the dataroom
        const { data, error } = await supabase
          .from("dataroom_teams")
          .select("*")
          .eq("dataroom_id", router.query.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Prioritize creator by placing their entry first
        const sortedUsers = [
          ...data.filter((u) => u.email === user.email),
          ...data.filter((u) => u.email !== user.email),
        ];

        setUsers(sortedUsers || []);
      } catch (err) {
        console.error("Error fetching dataroom users:", err.message);
      } finally {
        setIsFetching(false);
      }
    };

    if (router.query.id) {
      fetchCreatorAndUsers();
    }
  }, [router.query.id]);

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

        const { error: magicLinkError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard?id=${router.query.id}`,
          },
        });

        if (magicLinkError) {
          throw new Error(`Failed to send magic link to ${email}: ${magicLinkError.message}`);
        }

        const inviterEmail = creatorEmail;

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

        setUsers((prevUsers) => [
          ...prevUsers,
          { ...newUser, created_at: newUser.created_at.toISOString() },
        ]);
      }

      setSuccessMessage("Invitations sent successfully!");
      setShowSuccessPopup(true);
      setEmails([""]);
      setShowPopup(false);
    } catch (err) {
      console.error("Error sending invites:", err.message);
      setSuccessMessage(`Error: ${err.message}`);
      setShowSuccessPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (team) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("dataroom_teams")
        .delete()
        .eq("id", team.id);

      if (error) {
        console.error("Error removing team member:", error.message);
        setSuccessMessage("Failed to remove the team member.");
        setShowSuccessPopup(true);
        return;
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== team.id));

      setSuccessMessage("Team member removed successfully!");
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Unexpected error:", err.message);
      setSuccessMessage("An error occurred while removing the team member.");
      setShowSuccessPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-light hover:text-[#A3E636] transition-colors duration-300">Team</div>
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
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-sm transition-all duration-200 ${user.email === creatorEmail
              ? "bg-black text-white hover:border-[#A3E636]" // Admin box style with hover
              : "bg-gray-100 border border-[#ddd] hover:border-[#A3E636]" // Regular box style with hover
              }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{user.email}</div>
                {user.email === creatorEmail && (
                  <div className="text-sm">Admin</div>
                )}
              </div>
              {user.email !== creatorEmail && (
                <button
                  className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full"
                  onClick={() => handleRemove(user)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              )}
            </div>
            <div>
              {user.email !== creatorEmail && ( // Hide "Invited By" for Admin
                <div className="text-gray-600">Invited By: {user.invited_by || "N/A"}</div>
              )}
              <div
                className={`${user.email === creatorEmail ? "text-white" : "text-gray-600"
                  }`}
              >
                Created At: {`${new Date(user.created_at).toLocaleDateString("en-US")} ${new Date(user.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })}`}

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Teamsecteam;

