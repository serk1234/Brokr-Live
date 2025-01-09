"use client";

import React, { useState } from "react";
import StylizedButton from "./stylized-button";

function MainSettingsSection({
  displayName,
  setDisplayName,
  organization,
  setOrganization,
}) {
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
    </div>
  );
}

export default MainSettingsSection;

