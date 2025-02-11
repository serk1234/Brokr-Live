"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import ModernButton from "./modern-button";
import Popup from "./Popup";

function SecondarySettingsSection({ dataroomId }) {
  const [ndaText, setNdaText] = useState(""); // Store NDA template content
  const [ndaOption, setNdaOption] = useState("first"); // Default to "First Access"
  const [isOpen, setIsOpen] = useState(false); // Dropdown open state
  const [loading, setLoading] = useState(false); // Loading state
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [popupMessage, setPopupMessage] = useState(""); // Modal open state

  const ndaOptions = {
    never: "Never",
    first: "First Access",
  };

  // Fetch NDA details on component load
  useEffect(() => {
    const fetchNdaDetails = async () => {
      if (!dataroomId) {
        console.warn("No dataroomId provided.");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("datarooms")
          .select("nda_status, nda_template")
          .eq("id", dataroomId)
          .single();

        if (error) {
          console.error("Error fetching NDA details:", error.message);
        } else {
          setNdaOption(data?.nda_status || "first"); // Set the fetched NDA status
          setNdaText(data?.nda_template || "Default NDA Template"); // Set the fetched NDA template
        }
      } catch (err) {
        console.error("Unexpected error fetching NDA details:", err.message);
      }
    };

    fetchNdaDetails();
  }, [dataroomId]);

  // Handle dropdown selection change (update database immediately)
  const handleNdaStatusChange = async (newStatus) => {
    setNdaOption(newStatus); // Update local state
    setIsOpen(false); // Close the dropdown

    if (!dataroomId) {
      console.warn("Cannot update NDA status without dataroomId.");
      return;
    }

    try {
      const { error } = await supabase
        .from("datarooms")
        .update({ nda_status: newStatus }) // Save the updated NDA status to the database
        .eq("id", dataroomId);

      if (error) {
        console.error("Error updating NDA status:", error.message);
        setPopupMessage("Failed to update NDA status. Please try again."); // Show error message
      } else {
        setPopupMessage("NDA status updated successfully!"); // Show success message
      }
    } catch (err) {
      console.error("Unexpected error updating NDA status:", err.message);
      setPopupMessage("Unexpected error. Please try again.");
    }
  };

  // Save the NDA template when "Save" is clicked
  const handleSaveNdaTemplate = async () => {
    if (!dataroomId) {
      console.warn("Cannot save NDA template without dataroomId.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("datarooms")
        .update({ nda_template: ndaText }) // Save the updated NDA template
        .eq("id", dataroomId);

      const { data: ndaSignatures, error: ndaError } = await supabase
        .from("nda_signatures")
        .delete()
        .eq("dataroom_id", dataroomId);

      if (error) {
        console.error("Error saving NDA template:", error.message);
        setPopupMessage("Failed to save changes. Please try again."); // Show error message
      } else {
        setPopupMessage("Template updated successfully!"); // Show success message
        setShowNdaModal(false); // Close the modal
      }
    } catch (err) {
      console.error("Unexpected error saving NDA template:", err.message);
      setPopupMessage("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] p-6 rounded-2xl border border-[#ddd] shadow-md space-y-6 hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
      {/* NDA Status Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="font-medium mb-2">Require NDA</h3>
          <p className="text-sm text-gray-700">
            Users must sign an NDA before accessing content
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-black rounded shadow cursor-pointer focus:outline-none"
            style={{ minWidth: "150px" }} // Ensure consistent width
          >
            {ndaOptions[ndaOption]}
            <i
              className={`fas fa-chevron-down ml-2 ${isOpen ? "rotate-180" : ""
                }`}
            ></i>
          </button>
          {isOpen && (
            <div
              className="absolute right-0 mt-2 bg-white border border-black rounded shadow z-10"
              style={{ minWidth: "150px" }} // Match the width of the dropdown button
            >
              {Object.entries(ndaOptions).map(([value, label]) => (
                <div
                  key={value}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${ndaOption === value ? "bg-[#A3E636]" : ""
                    }`}
                  onClick={() => handleNdaStatusChange(value)} // Update local state and database
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom NDA Template Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="font-medium mb-2">Custom NDA</h3>
          <p className="text-sm text-gray-700">
            Modify the NDA for this dataroom
          </p>
        </div>
        <div>
          <ModernButton
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 border border-black rounded shadow"
            onClick={() => setShowNdaModal(true)}
          >
            Edit
          </ModernButton>
        </div>
      </div>

      {/* Custom NDA Template Modal */}
      {showNdaModal && (
        <>
          {/* Prevent background scrolling */}
          <style>{`body { overflow: hidden; }`}</style>

          {/* Centered Floating Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Box */}
            <div className="bg-white w-[90vw] max-w-4xl h-[80vh] p-6 rounded-lg shadow-lg flex flex-col border border-gray-300">
              {/* Modal Header with X Close Button */}
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-semibold">Edit NDA</h3>
                <button
                  onClick={() => {
                    setShowNdaModal(false);
                    document.body.style.overflow = "auto"; // Restore background scroll
                  }}
                  className="text-gray-500 hover:text-gray-800 transition"
                >
                  {/* SVG "X" Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable NDA Content */}
              <textarea
                value={ndaText}
                onChange={(e) => setNdaText(e.target.value)}
                className="w-full flex-1 mt-3 p-4 border border-gray-300 rounded font-mono text-sm resize-none overflow-auto"
                style={{ height: "calc(100% - 90px)" }} // Adjust height dynamically
              />

              {/* Modal Footer */}
              <div className="flex justify-end border-t pt-3">
                <ModernButton
                  onClick={handleSaveNdaTemplate}
                  className="px-4 py-2 bg-[#A3E636] rounded border border-black shadow-lg hover:bg-[#93d626] transition-color"
                >
                  Save
                </ModernButton>
              </div>
            </div>
          </div>
        </>
      )}






      {popupMessage && (
        <Popup
          message={popupMessage}
          onClose={() => setPopupMessage("")} // Clear the message to hide the popup
        />
      )}
    </div>
  );
}

export default SecondarySettingsSection;
