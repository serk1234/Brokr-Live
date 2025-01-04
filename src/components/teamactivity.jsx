"use client";
import React from "react";



function Teamactivity({ activities }) {
  const renderDetails = (activity) => {
    if (activity.type === "download") {
      return (
        <>
          downloaded <span className="text-gray-500">{activity.details}</span>
        </>
      );
    }
    if (activity.type === "time") {
      return (
        <>
          spent {activity.minutes} minutes viewing{" "}
          <span className="text-gray-500">{activity.details}</span>
        </>
      );
    }
    return activity.details;
  };

  return (
    <div className="p-6">
      <div className="text-xl font-semibold mb-6 font-open-sans">Activity</div>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white p-3 rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-[#A3E636]">
                {activity.type === "nda" && (
                  <i className="fas fa-file-signature"></i>
                )}
                {activity.type === "download" && (
                  <i className="fas fa-download"></i>
                )}
                {activity.type === "invite" && (
                  <i className="fas fa-user-plus"></i>
                )}
                {activity.type === "time" && <i className="fas fa-clock"></i>}
                {activity.type === "notes" && (
                  <i className="fas fa-sticky-note"></i>
                )}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="font-semibold font-open-sans">
                  {activity.user}{" "}
                  <span className="text-gray-500 font-normal">
                    {activity.email}
                  </span>{" "}
                  {renderDetails(activity)}
                </span>
                <span className="text-sm text-gray-500">5m ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamactivityStory() {
  const exampleActivities = [
    {
      id: 1,
      type: "nda",
      user: "John Doe",
      email: "john@example.com",
      details: "signed NDA",
    },
    {
      id: 2,
      type: "download",
      user: "Jane Smith",
      email: "jane@example.com",
      details: "Project Proposal.pdf",
    },
    {
      id: 3,
      type: "notes",
      user: "Alice Johnson",
      email: "alice@example.com",
      details: "made 3 notes",
    },
    {
      id: 4,
      type: "invite",
      user: "Bob Brown",
      email: "bob@example.com",
      details: "sent an invite",
    },
    {
      id: 5,
      type: "time",
      user: "Carol White",
      email: "carol@example.com",
      minutes: "25",
      details: "Project Proposal.pdf",
    },
  ];

  return (
    <div>
      <Teamactivity activities={exampleActivities} />
    </div>
  );
}

export default Teamactivity;