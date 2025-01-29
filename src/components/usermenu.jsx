"use client";
import React from "react";

function Usermenu({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = React.useState(true);

  const tabs = [
    {
      name: "content",
      icon: "fas fa-file-lines",
      label: "Content",
      badge: null,
    },
  ];

  const documents = [
    { id: 1, name: "Document 1", icon: "fas fa-file" },
    { id: 2, name: "Document 2", icon: "fas fa-file" },
    { id: 3, name: "Document 3", icon: "fas fa-file" },
  ];

  return (
    <div className="p-2">
      <div className="mb-8">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.name}>
              <div
                className={`group flex items-center justify-between cursor-pointer hover:bg-gray-100 p-2 rounded ${
                  activeTab === tab.name ? "bg-gray-100" : ""
                }`}
                onClick={() => {
                  setActiveTab(tab.name);
                  setIsOpen(!isOpen);
                }}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-black group-hover:text-white">
                    <i className={tab.icon}></i>
                  </div>
                  <span className="ml-2">{tab.label}</span>
                </div>
                <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
              </div>
              {isOpen && (
                <ul className="ml-10 mt-2 space-y-2">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <i className={`${doc.icon} mr-2`}></i>
                      <span>{doc.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UsermenuStory() {
  const [activeTab, setActiveTab] = React.useState("content");

  return (
    <div>
      <Usermenu activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default Usermenu;
