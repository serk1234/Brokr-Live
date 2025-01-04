"use client";
import React, { useState } from "react";
import NewComponent from "../../components/new-component";
import StylizedButton from "../../components/stylized-button";
import HeaderLive from "../../components/header-live";
import "../../app/globals.css"; 
import Footer from "../../components/footer";

function MainComponent() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newOrg, setNewOrg] = useState(organization);
  const [showStripe, setShowStripe] = useState(false);
  const [storageUsed] = useState(35);
  const [storageLimit] = useState(50);
  const [autoUpgrade, setAutoUpgrade] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSubmit = () => {
    setName(newName);
    setOrganization(newOrg);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleChange = (setter, value) => {
    setter(value);
    setHasChanges(true);
  };

  const handleAutoUpgrade = () => {
    setAutoUpgrade(!autoUpgrade);
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative z-50">
        <HeaderLive email={email || "Loading..."} />
      </div>

      {/* Main Content */}
      
        <NewComponent
          name={name}
          organization={organization}
          email={email}
          newName={newName}
          setNewName={setNewName}
          newOrg={newOrg}
          setNewOrg={setNewOrg}
          handleSubmit={handleSubmit}
          hasChanges={hasChanges}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleChange={handleChange}
          setShowStripe={setShowStripe}
          showStripe={showStripe}
          planName="Basic Plan"
          planDetails="All features included • 50GB Storage"
          planCost="$1,000/mo"
          autoUpgrade={autoUpgrade}
          handleAutoUpgrade={handleAutoUpgrade}
          storageUsed={storageUsed}
          storageLimit={storageLimit}
        />
   

      {/* Footer */}
      <Footer title="Create" logoSrc="/logo.png" />
    </div>
  );
}

export default MainComponent;
