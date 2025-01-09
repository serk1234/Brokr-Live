"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import MainSettingsSection from "./main-settings-section";
import SecondarySettingsSection from "./secondary-settings-section";
import PrivacyPolicyModal from "./privacypolicy";
import { useRouter } from "next/router";


function SettingsTab({ dataroomName, setDataroomName, displayStatus, setDisplayStatus }) {
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
  const [filesLocked, setFilesLocked] = useState(false); // Lock status
  const router = useRouter();

  // Fetch the dataroom details
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
          setOrganizationName(data.organization || "");
          setFilesLocked(data.files_locked || false); // Initialize lock state
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };

    // Ensure `dataroomName` is valid before fetching
    if (dataroomName) {
      fetchDataroomDetails();
    } else {
      console.error("No dataroom name provided");
    }
  }, [dataroomName, setDisplayStatus]);

  // Handle saving changes
  const handleSave = async () => {
    setLoading(true);
    try {
      if (!newName || !localStatus) {
        alert("Please ensure all fields are filled before saving.");
        return;
      }

      const { error } = await supabase
        .from("datarooms")
        .update({ status: localStatus, name: newName, organization: organizationName })
        .eq("name", dataroomName);

      if (error) throw error;

      // Update global and local states
      setDisplayStatus(localStatus);
      setDataroomName(newName);

      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Error saving changes:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling lock status
  const handleToggleLockStatus = async () => {
    setLoading(true);
    try {
      const newLockStatus = !filesLocked;
      const { error } = await supabase
        .from("datarooms")
        .update({ files_locked: newLockStatus })
        .eq("name", dataroomName);

      if (error) throw error;

      setFilesLocked(newLockStatus);
      alert(`Files have been ${newLockStatus ? "locked" : "unlocked"} successfully!`);
    } catch (err) {
      console.error("Error toggling lock status:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle dataroom deletion
  const handleDelete = async () => {
    try {
      if (!dataroomName) {
        alert("No dataroom name provided for deletion.");
        return;
      }

      const { error } = await supabase.from("datarooms").delete().eq("name", dataroomName);
      if (error) throw error;

      alert("Dataroom deleted successfully!");
      setShowDeleteModal(false);
      router.push("/dashboard"); // Redirect to the dashboard
    } catch (err) {
      console.error("Error deleting dataroom:", err.message);
    }
  };

  return (
    <div className="w-full bg-transparent rounded-2xl border border-black p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#A3E636] rounded border border-black shadow-lg flex items-center gap-2 hover:bg-[#93d626] transition-colors"
          disabled={loading}
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-save"></i>
          )}
          <span>{loading ? "Saving..." : "Save Changes"}</span>
        </button>
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
        <SecondarySettingsSection dataroomId={dataroomId}
          options={[
            { title: "Allow Uploads", description: "Users can upload documents" },
            { title: "Allow Invitations", description: "Invite users to the dataroom" },
            { title: "Two-Factor Authentication", description: "Enhance security for your dataroom" },
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

        {/* Archive and Delete Section */}
        <div className="bg-white p-6 rounded-lg border border-black shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{filesLocked ? "Unlock All Files" : "Lock All Files"}</div>
              <div className="text-sm text-gray-500">
                {filesLocked
                  ? "Unlock all files in this dataroom and restore access."
                  : "Lock all files in this dataroom and restrict access."}
              </div>
            </div>
            <button
              onClick={handleToggleLockStatus}
              className={`px-4 py-2 ${filesLocked ? "bg-green-500" : "bg-amber-400"
                } rounded border border-black hover:${filesLocked ? "bg-green-600" : "bg-amber-500"
                } transition`}
              disabled={loading}
            >
              <i className={`fas ${filesLocked ? "fa-unlock" : "fa-lock"}`}></i>{" "}
              {filesLocked ? "Unlock All" : "Lock All"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Delete Dataroom</div>
              <div className="text-sm text-gray-500">
                Permanently delete this dataroom and its contents
              </div>
            </div>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded border border-black hover:bg-red-600 transition"
              onClick={() => setShowDeleteModal(true)} // Show the modal
            >
              <i className="fas fa-trash"></i> Delete
            </button>
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
              Are you sure you want to delete this dataroom? This action cannot be undone.
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
