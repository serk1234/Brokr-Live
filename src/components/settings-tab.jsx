"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import MainSettingsSection from "./main-settings-section";
import PrivacyPolicyModal from "./privacypolicy";
import SecondarySettingsSection from "./secondary-settings-section";
import ModernButton from "./modern-button";
import Popup from "./Popup";

function SettingsTab({
  dataroomName,
  setDataroomName,
  displayStatus,
  setDisplayStatus,
}) {
  const [localStatus, setLocalStatus] = useState(displayStatus || "");
  const [loading, setLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [toggleStates, setToggleStates] = useState([
    true,
    true,
    false,
    false,
    false,
    false,
  ]);
  const [newName, setNewName] = useState(dataroomName || "");
  const [organizationName, setOrganizationName] = useState(""); // Organization name state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataroomId, setDataroomId] = useState(null); // Modal state
  const [filesLocked, setFilesLocked] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null); // Lock status
  const router = useRouter();

  // Fetch the dataroom details
  // Popup message


  useEffect(() => {
    const fetchDataroomDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("datarooms")
          .select("id, status, organization, files_locked")
          .eq("name", dataroomName)
          .single();

        if (error) {

          console.error("Error fetching dataroom details:", error.message);
        } else if (data) {
          setLocalStatus(data.status || "Live");
          setDataroomId(data.id);
          setDisplayStatus(data.status || "Live");
          setOrganizationName(data.organization || ""); // Pre-fill organization name
          setFilesLocked(data.files_locked || false); // Set the initial lock status
        }
      } catch (err) {
        setPopupMessage("Unexpected error fetching dataroom details.");
        console.error("Unexpected error fetching dataroom details:", err.message);
      }
    };

    if (dataroomName) {
      fetchDataroomDetails();
    } else {
      setPopupMessage("No dataroom name provided.");
    }
  }, [dataroomName, setDisplayStatus]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!dataroomName || !localStatus) {
        setPopupMessage("Please ensure all fields are filled before saving.");
        return;
      }

      const { error } = await supabase
        .from("datarooms")
        .update({
          status: localStatus,
          name: dataroomName,
          organization: organizationName,
          files_locked: filesLocked, // Save the updated lock status
        })
        .eq("name", dataroomName);

      if (error) throw error;

      setDisplayStatus(localStatus);
      setDataroomName(dataroomName);
      setPopupMessage("Settings updated successfully!");
    } catch (err) {
      setPopupMessage("Error saving changes.");
      console.error("Error saving changes:", err.message);
    } finally {
      setLoading(false);
    }
  };


  // Handle toggling lock status (local state only)
  const handleToggleLockStatus = () => {
    setFilesLocked(!filesLocked); // Only update local state
  };

  // Handle dataroom deletion
  const handleDelete = async () => {
    try {
      if (!dataroomName) {
        alert("No dataroom name provided for deletion.");
        return;
      }

      setLoading(true);

      // Delete related records in other tables (if needed)
      const { error: fileError } = await supabase
        .from("file_uploads")
        .delete()
        .eq("dataroom_id", dataroomId);

      if (fileError) {
        alert("Error deleting associated files. Please try again.");
        console.error("Error deleting related records:", fileError.message);
        return;
      }

      // Delete the dataroom itself
      const { error } = await supabase
        .from("datarooms")
        .delete()
        .eq("name", dataroomName);

      if (error) throw error;

      alert("Dataroom deleted successfully!");
      setShowDeleteModal(false);
      router.push("/dashboard"); // Redirect to the dashboard
    } catch (err) {
      console.error("Error deleting dataroom:", err.message);
      alert("Error deleting dataroom. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 space-y-6">
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-3xl font-light hover:text-[#A3E636] transition-colors duration-300">
          Settings
        </h1>
        <ModernButton
          onClick={handleSave}
          className="px-4 py-2 bg-[#A3E636] shadow-lg flex items-center gap-2 hover:bg-[#93d626] transition-colors"
          disabled={loading}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-save"></i>
          )}
          <span>{loading ? "Saving..." : "Save"}</span>
        </ModernButton>
      </div>

      <div className="space-y-6">
        {/* Main Settings Section */}
        <MainSettingsSection
          displayName={newName}
          setDisplayName={setNewName}
          organization={organizationName}
          setOrganization={setOrganizationName}
          displayStatus={localStatus}
          setDisplayStatus={setLocalStatus}
        />

        {/* Secondary Settings Section */}
        <SecondarySettingsSection
          dataroomId={dataroomId}
          options={[
            {
              title: "Allow Uploads",
              description: "Users can upload documents",
            },
            {
              title: "Allow Invitations",
              description: "Invite users to the dataroom",
            },
            {
              title: "Two-Factor Authentication",
              description: "Enhance security for your dataroom",
            },
          ]}
          onToggle={(index) =>
            setToggleStates((prev) => {
              const newStates = [...prev];
              newStates[index] = !newStates[index];
              return newStates;
            })
          }
          toggleStates={toggleStates}
        />

        {/* Lock All Files Section */}
        <div className="bg-[#f5f5f5] p-6 rounded-2xl border border-[#ddd] shadow-md space-y-6 hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <div className="font-medium mb-2">
                {filesLocked ? "Unlock All Files" : "Lock All Files"}
              </div>
              <div className="text-sm text-gray-700">
                {filesLocked
                  ? "Unlock all files in this dataroom and restore access."
                  : "Lock all files in this dataroom and restrict access."}
              </div>
            </div>
            <ModernButton
              onClick={handleToggleLockStatus}
              className={`w-full sm:w-auto px-4 py-2 ${filesLocked ? "bg-green-500" : "bg-amber-400"
                } rounded hover:${filesLocked ? "bg-green-600" : "bg-amber-500"
                } transition`}
              disabled={loading}
            >
              <i className={`fas ${filesLocked ? "fa-unlock" : "fa-lock"}`}></i>{" "}
              {filesLocked ? "Unlock All" : "Lock All"}
            </ModernButton>
          </div>
        </div>

        {/* Delete Dataroom Section */}
        <div className="bg-[#f5f5f5] p-6 rounded-2xl border border-[#ddd] shadow-md space-y-6 hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <div className="font-medium mb-2">Delete Dataroom</div>
              <div className="text-sm text-gray-700">
                Permanently delete this dataroom and its contents.
              </div>
            </div>
            <ModernButton
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="fas fa-trash"></i> Delete
            </ModernButton>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-black shadow-md mt-6 sm:hidden">
        <div className="text-center text-gray-500 text-sm sm:hidden">
          © 2024 brokr Technologies Inc. All rights reserved.
          <br />
          <button
            onClick={() => setShowPrivacyModal(true)} // Show modal on click
            className="text-blue-500 hover:underline sm:hidden" // Hide on desktop, show on mobile
          >
            Privacy & Terms
          </button>
        </div>

        {/* Render the modal */}
        <PrivacyPolicyModal
          show={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)} // Close modal on click
        />
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 space-y-4">
            <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this dataroom? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsTab;
