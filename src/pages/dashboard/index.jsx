"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import Footer from "../../components/footer";
import HeaderLive from "../../components/header-live";
import StylizedButton from "../../components/stylized-button";

function MainComponent() {
  const [userDatarooms, setUserDatarooms] = useState([]);
  const [invitedDatarooms, setInvitedDatarooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDataroomName, setNewDataroomName] = useState("");
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Fetch authenticated user email
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        fetchUserDatarooms(user.email);
        fetchInvitedDatarooms(user.email);
      } else if (error) {
        console.error("Error fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  // Fetch user's own datarooms
  const fetchUserDatarooms = async (email) => {
    const { data, error } = await supabase
      .from("datarooms")
      .select("id, name, organization, status")
      .eq("user_email", email);

    if (error) {
      console.error("Error fetching datarooms:", error.message);
    } else {
      setUserDatarooms(data);
    }
  };

  // Fetch datarooms where the user is invited
  const fetchInvitedDatarooms = async (email) => {
    const { data, error } = await supabase
      .from("invited_users")
      .select("datarooms(id, name, organization, status)")
      .eq("email", email);

    if (error) {
      console.error("Error fetching invited datarooms:", error.message);
    } else {
      const transformedData = data.map((entry) => entry.datarooms);
      setInvitedDatarooms(transformedData);
    }
  };

  // Handle creating a new dataroom
  const handleCreateDataroom = async () => {
    if (newDataroomName.trim()) {
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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("datarooms").insert([
        {
          name: newDataroomName.trim(),
          organization: newOrganizationName.trim() || null,
          user_email: user.email,
          nda_template: defaultNDA,
        },
      ]);

      if (error) {
        console.error("Error inserting dataroom:", error.message);
      } else {
        fetchUserDatarooms(user.email); // Refresh the dataroom list
        setNewDataroomName("");
        setNewOrganizationName("");
        setShowModal(false);
      }
    }
  };

  const handleRedirect = (id, isInvited = false) => {
    if (isInvited) {
      router.push({
        pathname: "/userview",
        query: { id },
      });
    } else {
      router.push({
        pathname: "/TeamView",
        query: { id },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      <div className="relative z-50">
        <HeaderLive email={userEmail || "Loading..."} />
      </div>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Team Section */}
          <div className="bg-black rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Team</h2>
              <StylizedButton
                text={<i className="fas fa-plus"></i>}
                className="px-3 py-2 bg-[#A3E636] text-black text-sm rounded"
                onClick={() => setShowModal(true)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userDatarooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-[#121212] border border-gray-200 hover:bg-black/80 transition rounded-xl p-4 flex justify-between items-center"
                >
                  <div className="w-3/4">
                    <h3
                      className="text-white font-semibold truncate"
                      style={{ maxWidth: "100%" }}
                    >
                      {room.name}
                    </h3>
                    {room.organization && (
                      <p
                        className="text-sm text-gray-400 truncate"
                        style={{ maxWidth: "100%" }}
                      >
                        {room.organization}
                      </p>
                    )}
                  </div>
                  <StylizedButton
                    text={<i className="fas fa-arrow-right"></i>}
                    className="ml-4 px-3 py-2 bg-[#A3E636] text-black text-sm rounded shadow-lg"
                    onClick={() => handleRedirect(room.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Users Section */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invitedDatarooms.length > 0 ? (
                invitedDatarooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-gray-100 border border-gray-200 hover:bg-gray-200 transition rounded-xl p-4 flex justify-between items-center"
                  >
                    <div className="w-3/4">
                      <h3
                        className="text-gray-800 font-semibold truncate"
                        style={{ maxWidth: "100%" }}
                      >
                        {room.name}
                      </h3>
                      {room.organization && (
                        <p
                          className="text-sm text-gray-600 truncate"
                          style={{ maxWidth: "100%" }}
                        >
                          {room.organization}
                        </p>
                      )}
                    </div>
                    <StylizedButton
                      text={<i className="fas fa-arrow-right"></i>}
                      className="ml-4 px-3 py-2 bg-[#A3E636] text-black text-sm rounded shadow-lg"
                      onClick={() => handleRedirect(room.id, true)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">"No data available"</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-black rounded-xl p-6 shadow-md border border-[#A3E636] w-11/12 max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">New Dataroom</h2>
              <StylizedButton
                text={<i className="fas fa-times"></i>}
                onClick={() => setShowModal(false)}
              />
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newDataroomName}
                onChange={(e) => setNewDataroomName(e.target.value)}
                placeholder="Enter dataroom name"
                className="w-full px-4 py-2 bg-[#121212] text-white border border-[#A3E636] rounded-lg focus:ring-2 focus:ring-[#A3E636]"
              />

              <StylizedButton text="Create" onClick={handleCreateDataroom} />
            </div>
          </div>
        </div>
      )}

      <Footer title="Create" logoSrc="/logo.png" />
    </div>
  );
}

export default MainComponent;
