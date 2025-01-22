"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import Footer from "../../components/footer";
import HeaderLive from "../../components/header-live";
import NewComponent from "../../components/new-component";

function MainComponent() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const [showStripe, setShowStripe] = useState(false);
  const [storageUsed] = useState(35);
  const [storageLimit] = useState(50);
  const [autoUpgrade, setAutoUpgrade] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [newOrg, setNewOrg] = useState("XYZ Inc.");
  const [email, setEmail] = useState("");

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

  useEffect(() => {
    const handleRedirectToPortal = async () => {
      if (!customerId) {
        alert("Please enter a valid Customer ID.");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/create-customer-portal-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            returnUrl: "https://brokr.app", // Replace with your return URL
          }),
        });

        const { url, error } = await response.json();

        if (error) {
          console.error("Error:", error);
          alert("Could not redirect to the customer portal.");
          setLoading(false);
          return;
        }

        // Redirect to the Stripe billing portal
        window.location.href = url;
      } catch (err) {
        console.error("Unexpected error:", err.message);
        alert("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      setEmail(user.email || "");
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header */}
      <div className="relative z-50">
        <HeaderLive email={email || "Loading..."} name={newName || ""} />
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
