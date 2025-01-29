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
  var defaultNDA = `<p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">NON-DISCLOSURE AGREEMENT (NDA)</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">This Non-Disclosure Agreement (&quot;Agreement&quot;) is entered into as of the date of execution (&quot;Effective Date&quot;) by and between:</span></p>
<ol>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">The Team:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;The party responsible for sharing Confidential Information via the dataroom (&quot;Team&quot;).</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">The Users:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;The party or parties receiving access to the Confidential Information (&quot;Users&quot;).</span></p>
    </li>
</ol>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">The parties agree as follows:</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">1. Purpose</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">The Team agrees to disclose, and the Users agree to receive, certain confidential and proprietary information (&quot;Confidential Information&quot;) solely for the purpose of evaluating a potential transaction, partnership, or any other business arrangement facilitated through the dataroom (the &quot;Purpose&quot;).</span></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">The brokr platform (&quot;Platform&quot;) serves solely as an intermediary and is not the owner of the contents shared in the dataroom. The owner or agent sharing the content is fully responsible for the accuracy, legality, and management of the contents and retains the right to amend this NDA as necessary.</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">2. Definition of Confidential Information</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">&quot;Confidential Information&quot; means any non-public, proprietary, or sensitive information disclosed directly or indirectly by the Team to the Users, whether in written, oral, electronic, or any other form. This includes, but is not limited to:</span></p>
<ul>
    <li style="list-style-type:disc;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Financial statements, business plans, and forecasts;</span></p>
    </li>
    <li style="list-style-type:disc;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Contracts, agreements, and legal documents;</span></p>
    </li>
    <li style="list-style-type:disc;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Intellectual property, including patents, trademarks, and trade secrets;</span></p>
    </li>
    <li style="list-style-type:disc;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Customer and supplier information;</span></p>
    </li>
    <li style="list-style-type:disc;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Any information uploaded to the dataroom.</span></p>
    </li>
</ul>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">Confidential Information does not include information that:</span></p>
<ol>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Is or becomes publicly available through no breach of this Agreement;</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Was already known to the Users without restriction before disclosure by the Team;</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Is independently developed by the Users without use of or reference to the Team&rsquo;s Confidential Information; or</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Is lawfully obtained from a third party without restriction on disclosure.</span></p>
    </li>
</ol>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">3. Obligations of Confidentiality</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">The Users agree to:</span></p>
<ol>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Maintain the confidentiality of the Confidential Information using the same degree of care as they use to protect their own confidential information, but not less than a reasonable standard of care;</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Use the Confidential Information solely for the Purpose;</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Restrict disclosure of the Confidential Information to their employees, agents, or representatives who need to know the information for the Purpose and who are bound by confidentiality obligations no less restrictive than those in this Agreement;</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Not disclose the Confidential Information to any third party without the prior written consent of the Team;</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Promptly notify the Team if they become aware of any unauthorized use or disclosure of the Confidential Information.</span></p>
    </li>
</ol>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">4. Return or Destruction of Confidential Information</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">Upon the Team&rsquo;s written request, the Users shall promptly:</span></p>
<ol>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Return all Confidential Information, including any copies thereof, to the Team; or</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><span style="font-size:11pt;font-family:Arial,sans-serif;">Destroy all Confidential Information and provide written certification of such destruction to the Team.</span></p>
    </li>
</ol>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">5. Term</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">This Agreement shall remain in effect for a period of five (5) years from the Effective Date or until the Confidential Information ceases to qualify as confidential under this Agreement, whichever occurs first.</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">6. Exclusions</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">Nothing in this Agreement prohibits the Users from disclosing Confidential Information as required by law, regulation, or court order, provided the Users give prompt notice to the Team (to the extent legally permissible) to enable the Team to seek a protective order or other remedy.</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">7. No License</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">No rights or licenses, express or implied, are granted to the Users under any patents, trademarks, copyrights, or other intellectual property of the Team by this Agreement.</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">8. No Obligation</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">This Agreement does not obligate either party to proceed with any transaction or business relationship. Confidential Information is provided &ldquo;AS IS&rdquo; without any warranties, express or implied.</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">9. Remedies</span></strong></p>
<p><span style="font-size:11pt;font-family:Arial,sans-serif;">The Users acknowledge that any unauthorized disclosure or use of Confidential Information may cause irreparable harm to the Team, for which monetary damages may be inadequate. The Team shall be entitled to seek injunctive relief and other equitable remedies in addition to any other rights or remedies available under law.</span></p>
<p><strong><span style="font-size:13pt;font-family:Arial,sans-serif;">10. Miscellaneous</span></strong></p>
<ol>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">Entire Agreement:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;This Agreement constitutes the entire understanding between the parties regarding its subject matter and supersedes all prior agreements and understandings.</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">Amendments:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;This Agreement may be amended only in writing signed by both parties or as updated by the owner or agent sharing the content via the Platform.</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">Governing Law:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">Severability:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</span></p>
    </li>
    <li style="list-style-type:decimal;font-size:11pt;font-family:Arial,sans-serif;">
        <p><strong><span style="font-size:11pt;font-family:Arial,sans-serif;">Assignment:</span></strong><span style="font-size:11pt;font-family:Arial,sans-serif;">&nbsp;This Agreement may not be assigned by either party without the prior written consent of the other party.</span></p>
    </li>
</ol>
<p><br></p>
<p><br></p>`;

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
              {ndaTemplate === "Default NDA Template" ? "" : ndaTemplate}
            </pre>
            {ndaTemplate === "Default NDA Template" && (
              <div dangerouslySetInnerHTML={{ __html: defaultNDA }}></div>
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
