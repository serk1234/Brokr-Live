"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { supabase } from "../../../src/app/supabaseClient";
import "../../app/globals.css";
import Footer from "../../components/footer";
import HeaderLive from "../../components/header-live";
import Title from "../../components/title";
import Viewer from "../../components/viewer";
import Onboarding from "../onboarding";

function UserView() {
  const [userEmail, setUserEmail] = useState("");
  const [dataroom, setDataroom] = useState({
    name: "Loading...",
    status: "Loading...",
    organization: "Loading...",
    nda_status: "first",
  });
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [showNDA, setShowNDA] = useState(null);
  const router = useRouter();
  const customStyles = {
    content: {
      top: "0", // Align to the top of the viewport
      left: "0", // Align to the left of the viewport
      right: "0", // Stretch to the right
      bottom: "0", // Stretch to the bottom
      padding: 0, // Remove internal spacing
      margin: 0, // Remove external spacing
      border: "none", // Optional: remove border for a cleaner look
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: semi-transparent overlay
    },
  };

  // Prevent looping state
  const [hasCheckedNDA, setHasCheckedNDA] = useState(false);

  useEffect(() => {
    const fetchUserSessionAndData = async () => {
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

          const dataroomId = router.query.id;
          if (!dataroomId) {
            console.error("No dataroom ID in URL");
            alert("No dataroom ID provided. Please contact support.");
            return;
          }

          const { data: dataroomData, error: dataroomError } = await supabase
            .from("datarooms")
            .select("id, name, status, organization, files_locked, nda_status")
            .eq("id", dataroomId)
            .single();

          if (dataroomError) {
            console.error("Error fetching dataroom:", dataroomError.message);
            alert("Error fetching dataroom. Please try again later.");
            return;
          }

          if (dataroomData) {
            console.log(dataroomData);
            setDataroom(dataroomData);
            setIsLocked(dataroomData.files_locked);

            // Check if NDA needs to be signed
            if (
              !hasCheckedNDA &&
              (dataroomData.nda_status === "first" ||
                dataroomData.nda_status === "every")
            ) {
              console.log("checking nda", dataroomData.id, session.user.email);
              const { data: ndaSignatures, error: ndaError } = await supabase
                .from("nda_signatures")
                .select("*")
                .eq("dataroom_id", dataroomData.id)
                .eq("user_email", session.user.email);

              if (ndaError) {
                console.error(
                  "Error checking NDA signatures:",
                  ndaError.message
                );
                return;
              }
              console.log("ndaSignatures", ndaSignatures);

              if (
                dataroomData.nda_status === "every" ||
                (dataroomData.nda_status === "first" &&
                  (!ndaSignatures || ndaSignatures.length === 0))
              ) {
                setHasCheckedNDA(true); // Avoid multiple redirects
                //router.push(`/onboarding?dataroomId=${dataroomId}`);
                console.log("show nda dialog");
                setShowNDA(true);
                return;
              }
            }

            const { data: fileData, error: fileError } = await supabase
              .from("file_uploads")
              .select(
                "name, new_name, uploaded_by, upload_at, locked, file_path"
              )
              .eq("dataroom_id", dataroomId);

            if (fileError) {
              console.error("Error fetching files:", fileError.message);
            } else {
              setFiles(fileData || []);
            }
          } else {
            console.error("No dataroom data found.");
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err.message);
        alert("Unexpected error. Please refresh the page.");
      }
    };

    if (router.query.id && !hasCheckedNDA) {
      fetchUserSessionAndData();
    }
  }, [router.query.id, hasCheckedNDA]);

  const handleFileClick = async (file) => {
    if (file.locked) {
      alert("This file is locked and cannot be accessed.");
      return;
    }

    setSelectedFile(file);
    setLoadingContent(true);

    try {
      const { data, error } = await supabase.storage
        .from("file_uploads")
        // .getPublicUrl(`files/${file.name}`);
        .getPublicUrl(file.file_path);

      if (error) {
        console.error("Error fetching file URL:", error.message);
        setFileURL("");
      } else {
        setFileURL(data.publicUrl);
      }
    } catch (err) {
      console.error("Unexpected error fetching file URL:", err.message);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDownload = async () => {
    if (selectedFile) {
      try {
        const { data, error } = await supabase.storage
          .from("file_uploads")
          .download(selectedFile.file_path);

        if (error) {
          console.error("Error downloading file:", error.message);
          return;
        }
        supabase.from("file_downloads").insert({
          dataroom_id: router.query.id,
          file_id: selectedFile.id,
        });
        const blob = new Blob([data], {
          type: data.type || "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = selectedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Unexpected error during file download:", err.message);
      }
    } else {
      console.error("No file selected or file URL is missing.");
    }
  };

  const getDisplayName = (file) => file.new_name || file.name;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderLive email={userEmail} />

      <div className="bg-white shadow">
        <div className="px-4 sm:px-7 pt-4 sm:pt-6">
          <Title
            title={dataroom.name || "No Name"}
            organization={dataroom.organization || ""}
            status={dataroom.status || "Live"}
          />
        </div>
        <hr className="border-gray-300 w-full" />
      </div>

      {showNDA && (
        <Modal
          isOpen={showNDA}
          onAfterOpen={() => { }}
          onRequestClose={() => { }}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <Onboarding
            roomId={router.query.id}
            onClosed={() => {
              setShowNDA(false);
            }}
          />
        </Modal>
      )}

      <div className="flex flex-1">
        <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
          <h2 className="text-lg font-medium mb-4">Contents</h2>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className={`flex items-center p-2 rounded-lg cursor-pointer ${file.locked ? "bg-red-100" : "hover:bg-green-50"
                  }`}
                onClick={() => handleFileClick(file)}
              >
                <i
                  className={`fas ${file.locked ? "fa-lock" : "fa-file"
                    } text-gray-500 mr-2`}
                ></i>
                <span className="flex-1 truncate">{getDisplayName(file)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white p-6">
          {selectedFile ? (
            <Viewer
              selectedDocument={{
                name: getDisplayName(selectedFile),
                src: fileURL,
                uploadedBy: selectedFile.uploaded_by,
                uploadAt: selectedFile.upload_at,
              }}
              zoom={zoom}
              setZoom={setZoom}
              handleDownload={handleDownload()}
            />
          ) : (
            <p className="text-gray-600">Select a file to view its details</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default UserView;
