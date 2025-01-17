"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useRouter } from "next/navigation";
import Popup from "../components/Popup"; // Adjust the path based on your file structure

function MainComponent() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [popupMessage, setPopupMessage] = useState(null);
  const router = useRouter(); // For redirecting the user

  // Listen for auth state changes and redirect to dashboard
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          console.log("User signed in:", session.user);
          router.push("/dashboard"); // Redirect to the dashboard
        }
      }
    );

    // Clean up the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Email Login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setPopupMessage("Check your email for the magic link!");
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxYTFhMWEiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTAgMGg2MHY2MEgwVjB6IiBzdHJva2U9IiMyNTI1MjUiIHN0cm9rZS13aWR0aD0iLjUiLz48L2c+PC9zdmc+')] flex items-center justify-center px-4">
      <div className="bg-white w-full md:w-[450px] p-10 rounded-lg border border-[#A3E636] shadow-[2px_2px_0px_0px_#A3E636]">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="font-bold text-3xl mb-8">brokr.</div>
        </div>

        {/* Input and Buttons Section */}
        <div className="space-y-6">
          {/* Email Input */}
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-black rounded text-center"
            placeholder="Enter your email"
            disabled={loading}
          />

          {/* Continue with Email Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`btn btn-email ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Loading..." : "Continue with Email"}
          </button>
        </div>
      </div>

      {/* Popup */}
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}
    </div>
  );
}

export default MainComponent;
