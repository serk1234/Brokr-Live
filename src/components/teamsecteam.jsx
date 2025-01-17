import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";

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
  const [currentDataroom, setCurrentDataroom] = useState(dataroomName || "");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inviterEmail = (await supabase.auth.getUser()).data.user.email;
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email: newUser.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard?id=${router.query.id}`,
        },
      });

      if (magicLinkError) throw magicLinkError;

      const { error: insertError } = await supabase
        .from("dataroom_teams")
        .insert([
          {
            dataroom_id: router.query.id,
            email: newUser.email,
            invited_by: inviterEmail,
            created_at: new Date(),
            invited_at: new Date(),
            permission: newUser.permission,
          },
        ]);

      if (insertError) throw insertError;

      setUsers((prevUsers) => [
        ...prevUsers,
        {
          // name: newUser.name,
          email: newUser.email,
          invited_by: inviterEmail,
          created_at: new Date().toISOString(),
          permission: newUser.permission,
        },
      ]);

      alert("Invite sent successfully!");
      setShowPopup(false);
    } catch (err) {
      console.error("Error sending invite:", err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setNewUser({ name: "", email: "", permission: "view", isAdmin: false });
    }
  };

  const handleRemove = async (team, index) => {
    var result = await supabase
      .from("dataroom_teams")
      .delete()
      .eq("id", team.id);

    if (!users[index].isAdmin) {
      setUsers(users.filter((_, i) => i !== index));
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
          <div className="text-xl font-semibold">Team</div>
          <div className="w-8 h-8 flex items-center justify-center bg-[#A3E636] rounded-full border border-black text-sm font-bold">
            {users.length}
          </div>
        </div>
        <button
          onClick={() => setShowPopup(true)}
          className="px-4 py-2 bg-[#A3E636] rounded border border-black"
        >
          <i className="fas fa-user-plus mr-2"></i>Add Team Member
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#A3E636] rounded"
              >
                {loading ? "Sending Invite..." : "Add Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-black"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-gray-600">{user.email}</div>
              </div>
              <button
                className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded"
                onClick={() => handleRemove(user, index)}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            <div>
              <div className="text-gray-600"></div>
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
