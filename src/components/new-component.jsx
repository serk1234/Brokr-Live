"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import SubscribeView from "../pages/subscription/index";
import ModernButton from "./modern-button";
import Popup from "./Popup";

function NewComponent({ email }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [usagePercent, seUsagePercent] = useState(0);
  const [showPricingTable, setShowPricingTable] = useState(false);
  const [memoryData, setMemoryData] = useState({
    totalMemory: 50,
    usedMemory: 0,
  });

  const handleCloseSubscribe = () => setshowSubscribeTable(false);
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false); // State to manage popup visibility
  const [popupMessage, setPopupMessage] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [showSubscribeTable, setshowSubscribeTable] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  // State for organization picture
  const [orgPic, setOrgPic] = useState(null);

  // Load saved organization picture from localStorage
  useEffect(() => {
    const storedOrgPic = localStorage.getItem(`orgPic-${email}`);
    if (storedOrgPic) {
      setOrgPic(storedOrgPic);
    }
  }, [email]);

  // Handle Organization Picture Upload
  const handleOrgImageUpload = (event) => {
    let file = event.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setOrgPic(imageUrl);
    localStorage.setItem(`orgPic-${email}`, imageUrl);
    setTimeout(() => {
      setShowOrgPopup(false);
    }, 300);
  };

  // Handle Remove Organization Picture
  const handleRemoveOrgPic = () => {
    setOrgPic(null);
    localStorage.removeItem(`orgPic-${email}`);
    setTimeout(() => {
      setShowOrgPopup(false);
    }, 300);
  };

  // State for organization picture popup
  const [showOrgPopup, setShowOrgPopup] = useState(false);



  // Load saved profile picture from localStorage
  useEffect(() => {
    const storedPic = localStorage.getItem(`profilePic-${email}`);
    if (storedPic) {
      setProfilePic(storedPic);
      ; // Update header image
    }
  }, [email,]);

  // Handle Image Upload
  const handleImageUpload = (event) => {
    let file = event.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfilePic(imageUrl);
    localStorage.setItem(`profilePic-${email}`, imageUrl);

    // Ensure UI updates before closing the popup
    setTimeout(() => {
      setShowPhotoPopup(false);
    }, 100);
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    localStorage.removeItem(`profilePic-${email}`);

    // Ensure UI updates before closing the popup
    setTimeout(() => {
      setShowPhotoPopup(false);
    }, 100);
  };


  // Function to trigger the general popup
  const triggerPopup = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleRedirectToPortal = async () => {
    if (!customerId) {
      alert("Please enter a valid Customer ID.");
      return;
    }

    try {
      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          returnUrl: "https://brokr.app/profilesettings", // Replace with your return URL
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        console.error("Error:", error);
        alert("Could not redirect to the customer portal.");
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
  useEffect(() => {
    console.log(
      "pricing-table-id",
      process.env.PRICING_TABLE,
      "publishable-key",
      process.env.STRIPE_PK_KEY
    );
    // Fetch the latest profile data on component mount
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from("profile_updates")
          .select("new_name, new_organization")
          .eq("user_email", email)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile data:", error.message);
        } else if (data) {
          setNewName(data.new_name || "");
          setNewOrg(data.new_organization || "");
        } else {
          setNewName("");
          setNewOrg("");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err.message);
      }
    };

    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_email", email)
          .single();

        if (data) {
          setIsSubscribed(true);

          const user_stripe = await supabase
            .from("user_stripe")
            .select("*")
            .eq("email", email)
            .single();
          if (user_stripe.data) {
            setCustomerId(user_stripe.data.customer_id);
          }
        } else if (error) {
          console.log("No active subscription found:", error.message);
        }
      } catch (err) {
        console.error("Error fetching subscription status:", err.message);
      }
    };

    const getUSage = async () => {
      var response = await supabase
        .from("file_uploads")
        .select("file_size_mb")
        .eq("uploaded_by", email);
      console.log("file_uploads", response);
      var total = 0;
      for (var data of response.data) {
        console.log(data);
        total += data.file_size_mb ?? 0;
      }
      console.log("file_uploads", total);
      setMemoryData({
        totalMemory: 50,
        usedMemory: total / 1024,
      });
    };
    fetchProfileData();
    fetchSubscriptionStatus();
    getUSage();
  }, [email]);

  const handleEditSubmit = async () => {
    try {
      if (!newName.trim() || !newOrg.trim()) {
        alert("Name and Organization cannot be empty.");
        return;
      }

      const { error } = await supabase.from("profile_updates").insert({
        user_email: email,
        new_name: newName,
        new_organization: newOrg,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving profile update:", error.message);
        return;
      }

      // Show popup instead of alert
      setPopupMessage("Profile updated successfully!");
      setShowPopup(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Error during profile update:", err.message);
    }
  };

  const handleSubscribe = () => {
    setshowSubscribeTable(true);
    // setShowPricingTable(true);
    // router.push("/subscription"); // Update to match your folder structure
  };

  const handleManageSubscription = () => {
    // Redirect to Stripe Customer Portal for managing subscription
    // window.location.href =
    // "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144";
    /*   window.location.href = "https://billing.stripe.com/p/login/7sI5mU7e46wE7MQ144"; */
    handleRedirectToPortal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <div className=" bg-[#f5f5f5] rounded-xl p-6 shadow-lg relative mb-6 border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-medium">Profile</h2>
            <ModernButton
              text={isEditing ? "X" : "Edit"}
              onClick={() => setIsEditing(!isEditing)}
            />
          </div>

          {/* Profile Picture Section */}
          <div className="flex gap-4 items-center mb-6">
            <i className="fas fa-camera text-xl text-gray-400"></i>
            <div className="flex flex-col">
              <p className="text-sm text-gray-500">Profile Picture</p>

              {/* Profile Image & Change Photo Button */}
              <div
                className="cursor-pointer flex items-center gap-4 mt-2"
                onClick={() => setShowPhotoPopup(true)} // Opens profile photo popup
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-14 h-14 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-300 bg-gray-200">
                    <i className="fas fa-user text-gray-500 text-xl"></i>
                  </div>
                )}
                <ModernButton text="Change Photo" />
              </div>
            </div>
          </div>


          {/* Instagram-Style Change Photo Popup */}
          {showPhotoPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl shadow-lg w-80 text-center p-5">
                <h3 className="text-lg font-semibold mb-4">Change Profile Photo</h3>

                {/* Upload Photo */}
                <label className="block text-blue-500 text-sm py-3 hover:bg-gray-100 cursor-pointer border-b">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  Upload Photo
                </label>

                {/* Remove Photo */}
                {profilePic && (
                  <button
                    className="block text-red-500 text-sm py-3 hover:bg-gray-100 border-b w-full"
                    onClick={handleRemoveProfilePic}
                  >
                    Remove Current Photo
                  </button>
                )}

                {/* Cancel Button */}
                <button
                  className="block text-gray-600 text-sm py-3 hover:bg-gray-100 w-full"
                  onClick={() => setShowPhotoPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Organization Picture Section */}
          <div className="flex gap-4 items-center mb-6">
            <i className="fas fa-building text-xl text-gray-400"></i>
            <div className="flex flex-col">
              <p className="text-sm text-gray-500">Organization Picture</p>

              {/* Organization Image & Change Button */}
              <div
                className="cursor-pointer flex items-center gap-4 mt-2"
                onClick={() => setShowOrgPopup(true)} // Opens organization popup
              >
                {orgPic ? (
                  <img
                    src={orgPic}
                    alt="Organization"
                    className="w-14 h-14 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-300 bg-gray-200">
                    <i className="fas fa-people-group text-gray-500 text-xl"></i>
                  </div>
                )}
                <ModernButton text="Change Organization Photo" />
              </div>
            </div>
          </div>

          {/* Organization Picture Popup */}
          {showOrgPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl shadow-lg w-80 text-center p-5">
                <h3 className="text-lg font-semibold mb-4">Change Organization Picture</h3>

                {/* Upload Organization Photo */}
                <label className="block text-blue-500 text-sm py-3 hover:bg-gray-100 cursor-pointer border-b">
                  <input type="file" accept="image/*" className="hidden" onChange={handleOrgImageUpload} />
                  Upload Photo
                </label>

                {/* Remove Organization Photo */}
                {orgPic && (
                  <button
                    className="block text-red-500 text-sm py-3 hover:bg-gray-100 border-b w-full"
                    onClick={handleRemoveOrgPic}
                  >
                    Remove Current Photo
                  </button>
                )}

                {/* Cancel Button */}
                <button
                  className="block text-gray-600 text-sm py-3 hover:bg-gray-100 w-full"
                  onClick={() => setShowOrgPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}





          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter new name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="border p-2 rounded w-full"
                  placeholder="Enter new organization"
                />
              </div>
              <ModernButton text="Save" onClick={handleEditSubmit} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <i className="fas fa-user text-xl text-gray-400"></i>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-medium">{newName}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <i className="fas fa-building text-xl text-gray-400"></i>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="text-lg font-medium">{newOrg}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <i className="fas fa-envelope text-xl text-gray-400"></i>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium">{email}</p>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Subscription Section */}
        <>

          <div className="bg-[#f5f5f5] rounded-xl p-6 shadow-lg relative mb-6 border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-medium">Subscription</h2>
              <button
                onClick={isSubscribed ? handleManageSubscription : handleSubscribe}
                className="bg-[#A3E636] text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
              >
                {isSubscribed ? "Manage" : "Subscribe"}
              </button>
            </div>

            {isSubscribed && (
              <div>
                {/* Storage & Used in a Single Row with Correct Spacing */}
                <div className="flex justify-between items-center mb-3">
                  {/* Storage */}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <i className="fa-solid fa-microchip text-lg text-gray-500"></i>
                    <p className="text-base font-sm text-gray-600">Storage</p>
                    <p className="text-lg font-semibold text-black ml-1">{memoryData.totalMemory} GB</p> {/* Closer spacing */}
                  </div>

                  {/* Used */}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <i className="fa-solid fa-database text-lg text-gray-500"></i>
                    <p className="text-base font-sm text-gray-600">Used</p>
                    <p className="text-lg font-semibold text-black ml-1">
                      {memoryData.usedMemory.toFixed(1)} GB
                      <span className="text-gray-500 text-base"> ({((memoryData.usedMemory / memoryData.totalMemory) * 100).toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>

                {/* Green Progress Bar */}
                {/* Green Progress Bar - Fixed Rounded Fill */}
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 bg-[#A3E636] transition-all duration-300"
                    style={{
                      width: `${Math.min((memoryData.usedMemory / memoryData.totalMemory) * 100, 100)}%`,
                      borderRadius: "9999px", // Ensures full round edges
                    }}
                  ></div>
                </div>

              </div>
            )}
          </div>

          {/* Subscription Popup */}
          {/* Subscription Popup */}
          {/* Subscription Popup */}
          {!isSubscribed && showSubscribeTable && (
            <div className="subscribe-popup fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-black w-full max-w-3xl p-6 rounded-xl shadow-xl border border-[#A3E636] relative h-auto">
                <div className="relative">
                  <SubscribeView />
                  <button
                    onClick={handleCloseSubscribe}
                    className="absolute top-4 right-4 text-white bg-red-500 px-3 py-1 rounded-full hover:bg-red-600 transition"
                  >
                    X
                  </button>
                </div>
              </div>
            </div>
          )}
        </>

        {/* Support Section */}
        <div className=" bg-[#f5f5f5] rounded-xl p-6 shadow-lg relative  border border-[#ddd] hover:border-[#A3E636] hover:bg-[#eee] transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-medium">Support</h2>
            <ModernButton
              text="Chat"
              onClick={() => {
                window.location.href =
                  "mailto:contact@hellobrokr.com?bcc=serkan@hellobrokr.com&subject=brokr%20Support";
              }}
            />
          </div>
        </div>
      </div>

      {showPopup && (
        <Popup message={popupMessage} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default NewComponent;
