"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../src/app/supabaseClient";
import StylizedButton from "../../components/stylized-button";
import Footer from "../../components/footer";
import "../../app/globals.css";

function Onboarding({ roomId, onClosed }) {
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [dataroomId, setDataroomId] = useState(null);
  const [ndaTemplate, setNdaTemplate] = useState("Loading NDA template...");
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndParams = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user.email) {
          setUserEmail("No User Found");
          return;
        }

        setUserEmail(session.user.email);

        const dataroomIdFromQuery = roomId;
        if (!dataroomIdFromQuery) {
          alert("No dataroom ID provided. Please contact support.");
          return;
        }

        setDataroomId(dataroomIdFromQuery);

        const { data, error } = await supabase
          .from("datarooms")
          .select("*")
          .eq("id", dataroomIdFromQuery)
          .single();

        if (error) {
          setNdaTemplate("Default NDA template.");
        } else {
          setNdaTemplate(data?.nda_template || "Default NDA template.");
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
      }
    };

    if (roomId) fetchSessionAndParams();
  }, [roomId]);

  const handleSignClick = async () => {
    if (!userEmail || !dataroomId) {
      alert("Email or Dataroom ID is missing.");
      return;
    }

    try {
      const { data: existingSignature } = await supabase
        .from("nda_signatures")
        .select("id, last_accessed_at")
        .eq("user_email", userEmail)
        .eq("dataroom_id", dataroomId)
        .single();

      if (existingSignature) {
        await supabase
          .from("nda_signatures")
          .update({ last_accessed_at: new Date().toISOString() })
          .eq("id", existingSignature.id);

        onClosed();
        return;
      }

      await supabase.from("nda_signatures").insert([
        {
          user_email: userEmail,
          dataroom_id: dataroomId,
          signed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        },
      ]);

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

      <div className="max-w-4xl mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl font-semibold text-center mb-8">
          Non-Disclosure Agreement
        </h1>

        <div className="bg-[#1A1A1A] rounded-lg border border-[#333] p-6 md:p-8">
          <div className="overflow-y-auto max-h-[50vh] mb-8 scrollbar-thin scrollbar-thumb-[#8BC34A] scrollbar-track-[#1A1A1A] scrollbar-w-[2px] pr-4">
            <h2 className="text-[#A3E636] text-2xl font-semibold mb-4">
              NON-DISCLOSURE AGREEMENT
            </h2>
            <p className="text-gray-400 mb-4">(For Dataroom Access)</p>
            <p className="mb-4">
              This Non-Disclosure Agreement is entered into as
              of {new Date().toLocaleDateString()} by and between:
            </p>
            <div className="mb-4">
              <p>1. Disclosing Party: BROKR </p>
              <p>2. Receiving Party: {userEmail || "Loading..."}</p>
            </div>
            <pre className="text-gray-300 whitespace-pre-wrap">{ndaTemplate}</pre>
          </div>
        </div>

        <div className="border-t border-[#333] pt-6">
          <div className="mb-4">
            <h3 className="text-[#A3E636] text-xl font-semibold mb-2">
              By clicking "Sign Agreement," you agree to the terms above.
            </h3>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
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
                <div className="flex items-center gap-2">
                  <i className="fas fa-signature"></i>Sign Agreement
                </div>
              }
              onClick={handleSignClick}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Onboarding;
