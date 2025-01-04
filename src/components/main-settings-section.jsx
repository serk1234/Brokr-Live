"use client";
import React, { useState } from "react";
import StylizedButton from "./stylized-button";

function MainSettingsSection({
  displayName,
  setDisplayName,
  organization,
  setOrganization,
  displayStatus,
  setDisplayStatus,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: "Live", color: "#22C55E" },
    { value: "Archived", color: "#6B7280" },
    { value: "Draft", color: "#EAB308" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-4">
      {/* Name Input */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Name</div>
          <div className="text-sm text-gray-500">
            Set the display name for your dataroom
          </div>
        </div>
        <div className="w-[280px]">
          <input
            type="text"
            name="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Organization Input */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Organization</div>
          <div className="text-sm text-gray-500">
            This will be displayed to users
          </div>
        </div>
        <div className="w-[280px]">
          <input
            type="text"
            name="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-3 py-2 border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Status Dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Status</div>
          <div className="text-sm text-gray-500">
            Set the current status of your dataroom
          </div>
        </div>
        <div className="w-[280px] relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: statusOptions.find(
                    (opt) => opt.value === displayStatus
                  )?.color,
                }}
              />
              {displayStatus}
            </div>
            <svg
              className="w-4 h-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute w-full mt-1 bg-white border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDisplayStatus(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainSettingsSection;
