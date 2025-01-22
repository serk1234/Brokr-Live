"use client";
import React from "react";

function Title({ title, organization, status }) {
  const getStatusColor = () => {
    switch (status) {
      case "Archived":
        return "bg-[#34D399] text-[#065F46]";
      case "Draft":
        return "bg-[#FDE68A] text-[#92400E]";
      case "Live":
        return "bg-[#A3E636] text-black";
      default:
        return "bg-[#E5E7EB] text-[#374151]";
    }
  };

  return (
    <div className="mb-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        {/* Title and Status */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Title: Truncate on mobile, show full on desktop */}
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-[#1F2937] font-open-sans truncate sm:whitespace-normal">
            {title}
          </h1>
          <div
            className={`px-4 py-1.5 rounded-full text-sm font-medium border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getStatusColor()}`}
          >
            {status}
          </div>
        </div>

        {/* Organization: Truncate on mobile, show full on desktop */}
        {organization && (
          <div className="text-lg text-[#6B7280] font-open-sans truncate sm:whitespace-normal sm:max-w-none">
            {organization}
          </div>
        )}
      </div>
    </div>
  );
}

export default Title;

