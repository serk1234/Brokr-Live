"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import Footer from "../../components/footer";
import StylizedButton from "../../components/stylized-button";

function Onboarding({ roomId, onClosed }) {
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [dataroomId, setDataroomId] = useState(null); // Store dataroom ID
  const [ndaTemplate, setNdaTemplate] = useState("Loading NDA template..."); // Store NDA template
  const router = useRouter();

  useEffect(() => {
    console.log("nda_query", roomId);
    const fetchSessionAndParams = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching session:", sessionError.message);
          setUserEmail("No User Found");
          return;
        }

        if (session?.user?.email) {
          setUserEmail(session.user.email);
        } else {
          console.error("User session not found");
          return;
        }

        const dataroomIdFromQuery = roomId; // router.query.dataroomId;
        if (!dataroomIdFromQuery) {
          console.error("No dataroom ID in query params.");
          alert("No dataroom ID provided. Please contact support.");
          return;
        }

        setDataroomId(dataroomIdFromQuery);

        const navigationEntries =
          window.performance.getEntriesByType("navigation");
        console.log(navigationEntries);

        /*  if (
          navigationEntries.length > 0 &&
          navigationEntries[0].type === "reload"
        ) {
          console.log("Page was reloaded");
          // router.push(`/userview?id=${dataroomId}`);

          return;
        } */
        // Fetch the NDA template from the database
        const { data, error } = await supabase
          .from("datarooms")
          //.select("nda_template")
          .select("*")
          .eq("id", dataroomIdFromQuery)
          .single();
        console.log("nda_template", data, error);
        if (error) {
          console.error("Error fetching NDA template:", error.message);
          setNdaTemplate("Default NDA template");
        } else {
          console.log(data);
          setNdaTemplate(data?.nda_template || "Default NDA template");
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };

    if (roomId /* || router.query.dataroomId */) {
      fetchSessionAndParams();
    }
  }, [
    //router.query.dataroomId
    roomId,
  ]);

  const handleSignClick = async () => {
    if (!userEmail || !dataroomId) {
      alert("Email or Dataroom ID is missing.");
      return;
    }

    try {
      // Check if a record exists and when it was last accessed
      const { data: existingSignature, error: checkError } = await supabase
        .from("nda_signatures")
        .select("id, last_accessed_at")
        .eq("user_email", userEmail)
        .eq("dataroom_id", dataroomId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking NDA signatures:", checkError.message);
        alert(
          "An error occurred while verifying your NDA status. Please try again."
        );
        return;
      }

      if (existingSignature) {
        console.log("exising");
        // Update `last_accessed_at` and redirect

        await supabase
          .from("nda_signatures")
          .update({ last_accessed_at: new Date().toISOString() })
          .eq("id", existingSignature.id);

        onClosed();
        //  router.push(`/userview?id=${dataroomId}`);
        return;
      }

      console.log("new");

      // Insert a new NDA signature
      const { error: insertError } = await supabase
        .from("nda_signatures")
        .insert([
          {
            user_email: userEmail,
            dataroom_id: dataroomId,
            signed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error("Error saving NDA signature:", insertError.message);
        alert("An error occurred while signing the NDA. Please try again.");
        return;
      }

      // Redirect to the User View of the Dataroom
      // router.push(`/userview?id=${dataroomId}`);
      onClosed();
    } catch (err) {
      console.error("Unexpected error:", err.message);
      alert("Unexpected error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-opensans flex flex-col">
      <div className="bg-black p-4 mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-white text-2xl font-semibold">brokr</span>
          <button className="bg-black text-white px-4 py-2 rounded border border-[#A3E636] shadow-[2px_2px_0px_0px_#A3E636] hover:bg-[#1A1A1A]">
            Onboarding
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full">
        <h1 className="text-4xl font-semibold text-center mb-8">
          Non-Disclosure Agreement
        </h1>

        {/* NDA Content Section */}
        <div className="bg-[#1A1A1A] rounded-lg border border-[#333] p-6 sm:p-8">
          <div className="overflow-y-auto max-h-[400px] mb-8 scrollbar-thin scrollbar-thumb-[#8BC34A] scrollbar-track-[#1A1A1A] scrollbar-w-[2px] pr-4">
            <h2 className="text-[#A3E636] text-2xl font-semibold mb-4">
              NON-DISCLOSURE AGREEMENT
            </h2>
            <p className="text-gray-400 mb-4">(For Dataroom Access)</p>
            <p className="mb-4">
              This Non-Disclosure Agreement is entered into as of{" "}
              {new Date().toLocaleDateString()} by and between:
            </p>
            <div className="mb-4">
              <p>1. Disclosing Party: BROKR </p>
              <p>2. Receiving Party: {userEmail || "Loading..."}</p>
            </div>
            <pre className="text-gray-300 whitespace-pre-wrap">
              {ndaTemplate === "Loading NDA template..."
                ? "Loading NDA template..."
                : ""}
            </pre>
            {ndaTemplate !== "Loading NDA template..." && (
              <div dangerouslySetInnerHTML={{ __html: ndaTemplate }}></div>
            )}
          </div>
        </div>

        {/* Sign Agreement Section */}
        <div className="border-t border-[#333] pt-8">
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 rounded-full bg-[#A3E636] flex items-center justify-center mr-2">
              <i className="fas fa-check text-black text-xs"></i>
            </div>
            <span className="text-[#A3E636]">{userEmail}</span>
          </div>
          <div className="mb-8">
            <h3 className="text-[#A3E636] text-xl font-semibold mb-2">
              By clicking "Sign Agreement," you agree to the terms above.
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              name="fullName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your full name to sign"
              className="flex-1 bg-black border border-[#333] rounded px-4 py-2 text-white"
            />
            <StylizedButton
              text={
                <div className="flex items-center gap-2 justify-center">
                  <i className="fas fa-signature"></i>Sign Agreement
                </div>
              }
              onClick={handleSignClick}
              className="w-full sm:w-auto bg-black border border-[#333] rounded px-4 py-2 text-white text-center"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Onboarding;
