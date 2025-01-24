"use client";

function MainSettingsSection({
  displayName,
  setDisplayName,
  organization,
  setOrganization,
}) {
  return (
    <div className="bg-[#f5f5f5] p-6 rounded-2xl border border-[#ddd] shadow-md space-y-6 hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
      {/* Name Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="sm:w-auto w-full">
          <div className="font-medium mb-2">Name</div>
          <div className="text-sm text-gray-700">
            Set the display name for your dataroom
          </div>
        </div>
        <div className="w-full sm:w-[280px]">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="sm:w-auto w-full">
          <div className="font-medium mb-2">Organization</div>
          <div className="text-sm text-gray-700">
            This will be displayed to users
          </div>
        </div>
        <div className="w-full sm:w-[280px]">
          <input
            type="text"
            name="organization"
            value={organization} // Show organization in the input box
            onChange={(e) => setOrganization(e.target.value)} // Update the organization state
            className="w-full px-3 py-2 border border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>
    </div>
  );
}

export default MainSettingsSection;
