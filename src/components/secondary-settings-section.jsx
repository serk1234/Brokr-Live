"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../src/app/supabaseClient";
import ModernButton from "./modern-button";

function SecondarySettingsSection({ dataroomId }) {
  const [ndaText, setNdaText] = useState(""); // Store NDA template content
  const [ndaOption, setNdaOption] = useState("first"); // Default to "First Access"
  const [isOpen, setIsOpen] = useState(false); // Dropdown open state
  const [loading, setLoading] = useState(false); // Loading state for dropdown
  const [showNdaModal, setShowNdaModal] = useState(false); // Modal open state

  const ndaOptions = {
    never: "Never",
    first: "First Access",
    // every: "Every Access",//every access for later 
  };

  useEffect(() => {
    const fetchNdaDetails = async () => {
      if (!dataroomId) return;

      try {
        const { data, error } = await supabase
          .from("datarooms")
          .select("nda_status, nda_template")
          .eq("id", dataroomId)
          .single();

        if (error) {
          console.error("Error fetching NDA details:", error.message);
        } else {
          setNdaOption(data?.nda_status || "first");
          setNdaText(data?.nda_template || "Default NDA Template");
        }
      } catch (err) {
        console.error("Unexpected error fetching NDA details:", err.message);
      }
    };

    fetchNdaDetails();
  }, [dataroomId]);

  const handleNdaStatusChange = async (newStatus) => {
    if (!dataroomId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("datarooms")
        .update({ nda_status: newStatus })
        .eq("id", dataroomId);

      if (error) {
        console.error("Error updating NDA status:", error.message);
        alert("Failed to update NDA status. Please try again.");
      } else {
        setNdaOption(newStatus);
      }
    } catch (err) {
      console.error("Unexpected error updating NDA status:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNdaTemplate = async () => {
    if (!dataroomId) return;

    try {
      const { error } = await supabase
        .from("datarooms")
        .update({ nda_template: ndaText })
        .eq("id", dataroomId);

      if (error) {
        console.error("Error saving NDA template:", error.message);
        alert("Failed to save changes. Please try again.");
      } else {
        alert("NDA template updated successfully!");
        setShowNdaModal(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
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
          >
            {ndaOptions[ndaOption]}
            <i
              className={`fas fa-chevron-down ml-2 ${isOpen ? "rotate-180" : ""
                }`}
            ></i>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-auto bg-white border border-black rounded shadow z-10">
              {Object.entries(ndaOptions).map(([value, label]) => (
                <div
                  key={value}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${ndaOption === value ? "bg-[#A3E636]" : ""
                    }`}
                  onClick={() => {
                    setNdaOption(value);
                    setIsOpen(false);
                  }}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="bg-gray-300 p-4 rounded-lg w-11/12 max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Edit NDA</h3>
            <textarea
              value={ndaText}
              onChange={(e) => setNdaText(e.target.value)}
              className="w-full h-40 p-3 border border-black rounded font-mono text-sm"
            />
            <div className="flex justify-end space-x-3 mt-3">
              <ModernButton
                onClick={() => setShowNdaModal(false)}
                className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Cancel
              </ModernButton>
              <ModernButton
                onClick={handleSaveNdaTemplate}
                className="px-3 py-1.5 bg-[#A3E636] rounded border border-black shadow-lg flex items-center gap-2 hover:bg-[#93d626] transition-color"
              >
                Save
              </ModernButton>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

export default SecondarySettingsSection;
