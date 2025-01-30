"use client";

import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import SubscribeAlert from "./SubscribeAlert";

function ModernButton({ text, icon, onClick, variant = "primary" }) {
  const baseClasses =
    "px-4 py-2.5 rounded-xl font-medium inline-flex items-center gap-2 transition-all duration-200";
  const variants = {
    primary:
      "bg-[#A3E636] hover:bg-[#93d626] text-black shadow-[0_2px_8px_rgba(163,230,54,0.25)] hover:shadow-[0_4px_12px_rgba(163,230,54,0.35)]",
    secondary: "bg-black/5 hover:bg-black/10 text-black",
    danger: "bg-red-50 hover:bg-red-100 text-red-600",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      <i className={`fas ${icon} text-lg`}></i>
      <span>{text}</span>
    </button>
  );
}

function UploadModal({ onClose, onUpload, dataroomId }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("files__", file);

      setFile(e.dataTransfer.files[0]);
      console.log("files__", e.dataTransfer.files);
      console.log("files__", file);
      var filesList = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        filesList.push(e.dataTransfer.files[i]);
      }
      setFiles(filesList);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      var filesList = [];
      for (let i = 0; i < e.target.files.length; i++) {
        filesList.push(e.target.files[i]);
      }
      setFiles(filesList);
      console.log("files__", file);
    }
  };

  const sanitizeFileName = (fileName) => {
    // Replace all non-alphanumeric characters, spaces, and special symbols with underscores
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace unsupported characters with "_"
      .replace(/_+/g, "_") // Replace multiple underscores with a single underscore
      .trim(); // Remove any leading/trailing underscores
  };

  const handleSubmit = async () => {
    for (var i = 0; i < files.length; i++) {
      setFile(files[i]);
      console.log("setting_files=>", files[i], file);
      await uploadFile(files[i]);
      setFile(null);
    }
    onClose();
  };
  async function uploadFile(paramFile) {
    if (paramFile) {
      try {
        const sanitizedFileName = sanitizeFileName(paramFile.name);
        console.log(sanitizeFileName);
        const date = new Date();

        const timestamp = `${date.getFullYear()}-${date.getMonth() + 1
          }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

        var fileName = timestamp + "_" + sanitizedFileName;

        var filePath = `files/${dataroomId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("file_uploads")
          // .upload(`files/${sanitizedFileName}`, file);
          .upload(filePath, paramFile);

        if (uploadError) throw uploadError;

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        const { error: insertError } = await supabase
          .from("file_uploads")
          .insert([
            {
              name: sanitizedFileName,
              file_path: filePath,
              uploaded_by: user.email,
              upload_at: new Date().toISOString(),
              dataroom_id: dataroomId,
              file_size_mb: paramFile.size / (1024 * 1024),
            },
          ]);

        if (insertError) throw insertError;

        onUpload({
          name: sanitizedFileName,
          uploaded_by: user.email,
          file_path: filePath,

          upload_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error uploading file:", err.message);
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="content-box p-6">
        {/* Your content here */}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Upload File</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center ${dragActive ? "border-[#A3E636] bg-[#A3E636]/5" : "border-black/10"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            multiple
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
          />

          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#A3E636]/10 rounded-2xl flex items-center justify-center mx-auto">
              <i className="fas fa-cloud-upload-alt text-[#A3E636] text-2xl"></i>
            </div>

            {file ? (
              <div>
                {files?.map((e) => (
                  <li>
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{e.name}</p>
                      <p className="text-sm text-black/40">
                        {(e.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </li>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-black/40">
                  or click to browse from your computer
                </p>
              </div>
            )}

            <button
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 hover:bg-black/10 transition-colors"
            >
              Choose File
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-black/5 hover:bg-black/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${file
              ? "bg-[#A3E636] hover:bg-[#93d626] text-black"
              : "bg-black/5 text-black/40 cursor-not-allowed"
              }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

function Contentmanager({ items = [], dataroomId }) {
  const [files, setFiles] = useState(items);
  const [expandedRow, setExpandedRow] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [editingName, setEditingName] = useState(null);
  const [newName, setNewName] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToRemove, setFileToRemove] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);



  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!dataroomId) {
        console.error("Dataroom ID is missing");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("file_uploads")
          .select("name, file_path, uploaded_by, upload_at, locked, id")
          .eq("dataroom_id", dataroomId)
          .eq("deleted", false);
        if (error) {
          console.error("Error fetching files:", error.message);
        } else {
          setFiles(
            (data || []).map((file) => ({
              ...file,
              upload_at: file.upload_at
                ? new Date(file.upload_at).toISOString()
                : null,
            }))
          );
        }
      } catch (err) {
        console.error("Unexpected error fetching files:", err.message);
      }
    };

    fetchFiles();
  }, [dataroomId]);

  const handleFileView = async (file) => {
    const displayName = getDisplayName(file); // Use new_name if available
    setSelectedFile({
      ...file,
      name: displayName, // Updated to use the display name
      uploadedBy: file.uploaded_by,
      uploadDate: file.upload_at,
    });
    setLoadingContent(true);

    try {
      console.log(file);
      const { data, error } = await supabase.storage
        .from("file_uploads")
        // .getPublicUrl(`files/${dataroomId}/${displayName}`);
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

  const formatDate = (date) => {
    if (!date) return "N/A"; // Handle null dates
    try {
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return formattedDate === "Invalid Date" ? "N/A" : formattedDate; // Fallback for invalid dates
    } catch {
      return "N/A"; // Catch formatting errors
    }
  };

  const handleNameChange = async (file) => {
    try {
      // Update the new_name field in Supabase with the edited name
      const { error } = await supabase
        .from("file_uploads")
        .update({ new_name: newName }) // Update only the new_name field
        .eq("name", file.name) // Match the original name
        .eq("dataroom_id", dataroomId); // Ensure it's for the correct dataroom

      if (error) throw error;

      // Update the local state with the new_name field
      const updatedFiles = files.map((f) =>
        f.name === file.name ? { ...f, new_name: newName } : f
      );
      setFiles(updatedFiles);

      // Update selectedFile if it matches the renamed file
      if (selectedFile?.name === file.name) {
        setSelectedFile((prevSelectedFile) => ({
          ...prevSelectedFile,
          new_name: newName,
        }));
      }

      console.log(`Updated file name to: ${newName}`);
      setEditingName(null); // Exit editing mode
    } catch (err) {
      console.error("Error updating file name:", err.message);
    }
  };

  // Function to get the display name (new_name or fallback to name)
  const getDisplayName = (file) => file.new_name || file.name;

  const toggleLock = async (file) => {
    console.log("toggleLock", file);
    try {
      // lockUploadFiles(dataroomId);

      const { data, error } = await supabase
        .from("file_uploads")
        .update({ locked: !file.locked }) // Toggle visibility
        //  .eq("name", file.name)
        .eq("id", file.id);

      if (error) throw error;

      /*       var index = files.findIndex((e) => e.id == file.id);
      console.log("index", index);

      console.log(files);
      files[index].locked = !file.locked;
      console.log(files); */
      setFiles(
        files.map((e) => {
          if (e.id == file.id) {
            e.locked = !file.locked;
          }
          return e;
        })
      );

      // Update local state
      // setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));

      console.log(`${file.id} ${file.name} visibility updated.`);
    } catch (err) {
      console.error("Error toggling file lock:", err.message);
    }
  };

  const lockUploadFiles = async (id) => {
    // Update visibility for all files in the database
    const { error } = await supabase
      .from("file_uploads")
      .update({ locked: !isLocked }) // Set visibility to false
      .eq("dataroom_id", dataroomId);
    if (error) throw error;
  };
  const toggleLockAll = async () => {
    lockUploadFiles(dataroomId);
    try {
      const { error1 } = await supabase
        .from("datarooms")
        .update({ files_locked: !isLocked }) // Toggle visibility
        //  .eq("name", file.name)
        .eq("id", dataroomId);

      if (error1) throw error1;
      setFiles(
        files.map((e) => {
          e.locked = !isLocked;
          return e;
        })
      );
      setIsLocked(!isLocked);

      // Update local state
      // setFiles([]);
      console.log("All files locked and removed from user view.");
    } catch (err) {
      console.error("Error locking all files:", err.message);
    }
  };

  const downloadFile = async (fileName, filePath, id) => {
    try {
      // Fetch the file from Supabase storage
      const { data, error } = await supabase.storage
        .from("file_uploads")
        // .download(`files/${fileName}`);
        .download(filePath);
      if (error) throw error;

      await supabase.from("file_downloads").insert({
        dataroom_id: dataroomId,
        file_id: id,
      });

      // Convert ReadableStream to Blob
      const blob = new Blob([data], {
        type: data.type || "application/octet-stream",
      });

      // Create a download URL and trigger the download
      const url = URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Revoke the created object URL
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err.message);
    }
  };

  const downloadAllFiles = async () => {
    const zip = new JSZip();

    try {
      // Fetch each file from Supabase and add to the ZIP
      for (const file of files) {
        const { data, error } = await supabase.storage
          .from("file_uploads")
          // .download(`files/${file.name}`);
          .download(file.file_path);
        if (!error) {
          // Add file content to ZIP
          const blob = new Blob([data], {
            type: data.type || "application/octet-stream",
          });
          zip.file(file.name, blob);
        } else {
          console.log(`Failed to download ${file.name}: ${error.message}`);
          // throw new Error(`Failed to download ${file.name}: ${error.message}`);
        }
        await supabase.from("file_downloads").insert({
          dataroom_id: dataroomId,
          file_id: file.id,
        });
      }

      // Generate the ZIP and trigger the download
      zip.generateAsync({ type: "blob" }).then((content) => {
        const element = document.createElement("a");
        element.href = URL.createObjectURL(content);
        element.download = "files.zip";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      });
    } catch (err) {
      console.error("Error downloading all files:", err.message);
    }
  };

  const handleUpload = (newFile) => {
    console.log("uploaded file", newFile);
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  const handleRemove = async (fileToRemove) => {
    console.log("handleRemove=>", fileToRemove);
    try {
      // Remove the file from the Supabase storage bucket
      // const { error: storageError } = await supabase.storage
      //   .from("file_uploads")
      //   .remove([fileToRemove.file_path]);
      // .remove([`files/${fileToRemove.name}`]);

      /*   if (storageError) {
        console.error(
          "Error removing file from storage:",
          storageError.message
        );
        return;
      } */

      // Remove the file metadata from the Supabase database
      const { error: dbError } = await supabase
        .from("file_uploads")
        .update({ deleted: true })
        .eq("id", fileToRemove.id);
      /*. eq("name", fileToRemove.name)
        .eq("dataroom_id", dataroomId); */

      if (dbError) {
        console.error(
          "Error removing file metadata from database:",
          dbError.message
        );
        return;
      }

      // Remove the file from the local state
      setFiles((prevFiles) =>
        prevFiles.filter((file) => file.id !== fileToRemove.id)
      );
      console.log("File successfully removed:", fileToRemove.id);
    } catch (err) {
      console.error("Unexpected error removing file:", err.message);
    }

    if (!fileToRemove) return;

    try {
      // Supabase storage and database logic
      console.log("Removing file:", fileToRemove.id); // Debugging log
      setFiles((prevFiles) =>
        prevFiles.filter((file) => file.id !== fileToRemove.id)
      );
    } catch (err) {
      console.error("Unexpected error removing file:", err.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const gridTemplateColumns =
    "minmax(300px, 2fr) minmax(150px, 1fr) minmax(100px, 0.7fr) minmax(160px, 1fr)";

  function ConfirmModal({ onClose, onConfirm }) {
    console.log("ConfirmModal rendered"); // Debugging log
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h2 className="text-lg font-semibold mb-4">
            Are you sure you want to remove the file "{fileToRemove?.name}"?
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={onConfirm}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleRow = (id, e) => {
    console.log(id);
    e.stopPropagation();
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="w-full bg-transparent rounded-2xl  p-6 ]">
      {selectedFile ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-black/10">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center bg-[#A3E636]/10 rounded-xl">
                  <i className="fas fa-file text-[#A3E636]"></i>
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{selectedFile.name}</h2>
                  <p className="text-sm text-black/40">
                    Uploaded by {selectedFile.uploadedBy} on{" "}
                    {formatDate(selectedFile.uploadDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFileURL(""); // Clear the file URL when closing
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="flex gap-6 mb-6">
                <div className="flex-1 flex items-center justify-between p-4 bg-black/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
                      <i className="fas fa-lock text-sm"></i>
                    </span>
                    <div>
                      <p className="text-sm text-black/40">Status</p>
                      <p className="font-semibold">
                        {selectedFile.locked ? "Locked" : "Unlocked"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-between p-4 bg-black/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
                      <i className="fas fa-calendar text-sm"></i>
                    </span>
                    <div>
                      <p className="text-sm text-black/40">Last Modified</p>
                      <p className="font-semibold">
                        {formatDate(selectedFile.uploadDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-black/5 rounded-xl p-6 flex justify-center items-center">
                {fileURL ? (
                  selectedFile?.name?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={fileURL}
                      alt={selectedFile?.name || "File Preview"}
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                  ) : (
                    <div className="w-full h-full border-none rounded-lg">
                      <iframe
                        src={fileURL}
                        title="File Viewer"
                        className="w-full h-full border-none rounded-lg"
                        style={{ minHeight: "500px" }}
                      />
                      {/*     <object
                        style={{ minHeight: "250px" }}
                        data={fileURL}
                        type={
                          "application/" + selectedFile.name.split(".").pop()
                        }
                        width="100%"
                        height="100%"
                      ></object> */}
                    </div>
                  )
                ) : (
                  <div className="aspect-[16/9] bg-white rounded-lg flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-black/20"></i>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-black/10">
              <ModernButton
                text="Remove"
                icon="fa-trash"
                onClick={() => {
                  console.log("Opening confirmation modal"); // Debugging log
                  setFileToRemove(selectedFile);
                  setShowConfirmModal(true); // Set the file to remove
                  // Open the confirmation modal
                }}
                variant="danger"
              />

              <ModernButton
                text="Download"
                icon="fa-download"
                onClick={() =>
                  downloadFile(
                    selectedFile.name,
                    selectedFile.file_path,
                    selectedFile.id
                  )
                }
                variant="secondary"
              />

              {showConfirmModal && (
                <ConfirmModal
                  onClose={() => setShowConfirmModal(false)}
                  onConfirm={() => {
                    handleRemove(fileToRemove); // Remove the file
                    setSelectedFile(null); // Clear selected file
                    setShowConfirmModal(false); // Close the modal
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        // Existing code for the default view

        <div>
          {/*  <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Contents</h1>
            <div className="flex gap-3">
              <ModernButton
                text="Upload"
                icon="fa-cloud-upload-alt"
                onClick={() => setShowUploadModal(true)}
                variant="primary"
              />
              <ModernButton
                text="Download All"
                icon="fa-download"
                onClick={downloadAllFiles}
                variant="secondary"
              />

              {isLocked && (
                <ModernButton
                  text="Unlock All"
                  icon="fa-lock-open"
                  onClick={toggleLockAll}
                  variant="danger"
                />
              )}
              {!isLocked && (
                <ModernButton
                  text="Lock All"
                  icon="fa-lock"
                  onClick={toggleLockAll}
                  variant="danger"
                />
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns, gap: "1.5rem" }}
            className="py-3 px-4 border-b border-black/10"
          >
            <div className="text-black/40 text-sm font-medium">Name</div>
            <div className="text-black/40 text-sm font-medium">Uploaded By</div>
            <div className="text-black/40 text-sm font-medium">Uploaded</div>
            <div className="text-right text-black/40 text-sm font-medium">
              Actions
            </div>
          </div>

          {files.map((file, index) => (
            <div
              key={index}
              style={{ display: "grid", gridTemplateColumns, gap: "1.5rem" }}
              className={`items-center py-4 px-4 hover:bg-black/5 transition-colors ${
                file.locked ? "bg-amber-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-10 h-10 flex items-center justify-center bg-[#A3E636]/10 rounded-xl">
                  <i className="fas fa-file text-[#A3E636]"></i>
                </span>
                <div className="flex items-center justify-between w-full min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {editingName === file ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-black/10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#A3E636]"
                        autoFocus
                        onBlur={() => handleNameChange(file)} // Save changes on blur
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleNameChange(file); // Save changes on Enter
                          if (e.key === "Escape") setEditingName(null); // Cancel on Escape
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {getDisplayName(file)}
                        </span>
                        <button
                          onClick={() => {
                            setNewName(file.new_name || file.name); // Load current name into edit mode
                            setEditingName(file);
                          }}
                          className="shrink-0 w-8 h-8 flex items-center justify-center text-sm hover:bg-black/10 rounded-full transition-all group"
                        >
                          <i className="fas fa-pencil-alt "></i>
                        </button>
                      </div>
                    )}
                    {file.locked && (
                      <i className="shrink-0 fas fa-lock text-black/40 text-sm ml-2"></i>
                    )}
                  </div>
                </div>
              </div>

              <div className="truncate text-black/60 text-sm">
                {file.uploaded_by}
              </div>
              <div className="text-black/60 text-sm">
                {formatDate(file.upload_at)}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleFileView(file)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  onClick={() =>
                    downloadFile(file.name, file.file_path, file.id)
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                >
                  <i className="fas fa-download"></i>
                </button>
                <button
                  onClick={() => toggleLock(file)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                >
                  {file.locked ? (
                    <i className="fas fa-lock"></i>
                  ) : (
                    <i className="fas fa-lock-open"></i>
                  )}
                </button>
                <button
                  onClick={() => {
                    console.log("Opening confirmation modal for:", file.name); // Debugging log
                    setFileToRemove(file); // Set the file to be removed
                    setShowConfirmModal(true); // Show confirmation modal
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))} */}
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-3xl font-light hover:text-[#A3E636] transition-colors duration-300">
              Contents
            </h1>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <ModernButton
                text={window.innerWidth > 768 ? "Upload" : ""}
                icon="fa-cloud-upload-alt"
                onClick={async () => {
                  const {
                    data: { user },
                    error: userError,
                  } = await supabase.auth.getUser();
                  if (userError) throw userError;

                  var response = await supabase
                    .from("subscriptions")
                    .select("id")
                    .eq("user_email", user.email)
                    .single();

                  if (!response.data) {
                    setShowSubscribeModal(true); // Show the subscribe alert
                    return;
                  }

                  setShowUploadModal(true);
                }}
                variant="primary"
                className="w-10 md:w-auto"
              />
            </div>
            <SubscribeAlert isOpen={showSubscribeModal} onClose={() => setShowSubscribeModal(false)} />
          </div>

          {/* Table Header - Hidden on mobile */}
          {/*   <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_auto] gap-6 py-3 px-4 border-b border-black/10">
            <div className="text-black/40 text-sm font-medium">Name</div>
            <div className="text-black/40 text-sm font-medium">Uploaded By</div>
            <div className="text-black/40 text-sm font-medium">Uploaded</div>
            <div className="text-right text-black/40 text-sm font-medium">
              Actions
            </div>
          </div> */}

          <div
            className={`hidden md:grid md:grid-cols-[2fr_1fr_1fr_auto] gap-6 py-3 px-4 border-b border-black/10 grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto] gap-2 md:gap-6 
    items-center py-3 px-3 md:px-4 hover:bg-black/5 transition-colors`}
          >
            {/* File Name and Icon Section */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0 col-span-2 md:col-span-1">
              {/* <span className="shrink-0 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center bg-[#A3E636]/10 rounded-xl">
                <i className="fas fa-file text-[#A3E636]"></i>
              </span> */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">Name</div>
                {/* Mobile-only metadata */}
                <div className="flex md:hidden text-xs text-black/40 mt-1">
                  <span>Uploaded By</span>
                  <span className="mx-2">•</span>
                  <span>Uploaded</span>
                </div>
              </div>
            </div>

            {/* Desktop-only columns */}
            <div className="hidden md:block truncate text-black/60 text-sm">
              Uploaded By
            </div>
            <div className="hidden md:block text-black/60 text-sm">
              Uploaded
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-1 md:gap-2">
              <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors">
                <div className="ml-6 hidden md:block text-black/60 text-sm">
                  Actions
                </div>
                {/* <i className="fas fa-eye text-sm md:text-base"></i> */}
              </div>
              <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"></div>
              <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"></div>
              <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"></div>
            </div>
          </div>
          {/* {<ContentMobileView></ContentMobileView>} */}
          {/*Mobile View file */}
          <div className="block md:hidden w-full p-4 font-roboto">
            <div className="bg-white rounded-lg shadow">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="border-b last:border-b-0 relative"
                >
                  {expandedRow === file.id ? (
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <button
                        onClick={() => handleFileView(file)}
                        className="flex items-center justify-center text-gray-600 hover:text-blue-600 flex-1"
                      >
                        <i className="fas fa-eye text-lg"></i>
                        <span className="ml-2 text-sm">View</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadFile(file.name, file.file_path, file.id)
                        }
                        className="flex items-center justify-center text-gray-600 hover:text-green-600 flex-1"
                      >
                        <i className="fas fa-download text-lg"></i>
                        <span className="ml-2 text-sm">Download</span>
                      </button>
                      <button
                        onClick={() => toggleLock(file)}
                        className="flex items-center justify-center text-gray-600 hover:text-yellow-600 flex-1"
                      >
                        <i
                          className={`fas fa-${file.locked ? "lock" : "lock-open"
                            } text-sm md:text-base`}
                        ></i>
                        <span className="ml-2 text-sm">
                          {file.locked ? "Unlock" : "Lock"}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setFileToRemove(file);
                          setShowConfirmModal(true);
                        }}
                        className="flex items-center justify-center text-gray-600 hover:text-red-600 flex-1"
                      >
                        <i className="fas fa-trash text-lg"></i>
                        <span className="ml-2 text-sm">Delete</span>
                      </button>
                      <button
                        className="flex items-center justify-center text-gray-600 hover:text-gray-800 ml-4"
                        onClick={(e) => toggleRow(file.id, e)}
                      >
                        <i className="fas fa-ellipsis-h text-lg"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center p-4 hover:bg-gray-50">
                      <i className="{⁠ fas ${doc.icon} text-gray-500 text-xl w-8 ⁠}"></i>
                      <div className="flex-1 min-w-0 px-4">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getDisplayName(file)}
                        </p>
                      </div>
                      <div className="hidden md:block px-4">
                        <p className="text-sm text-gray-500">
                          {file.uploaded_by}
                        </p>
                      </div>
                      <div className="hidden md:block px-4 w-32">
                        <p className="text-sm text-gray-500">
                          {file.uploaded_at}
                        </p>
                      </div>
                      <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={(e) => toggleRow(file.id, e)}
                      >
                        <i className="fas fa-ellipsis-v text-gray-400"></i>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File List */}

          <div className="hidden md:block">
            {files.map((file, index) => (
              <div
                key={index}
                className={`grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto] gap-2 md:gap-6 
    items-center py-3 px-3 md:px-4 hover:bg-black/5 transition-colors ${file.locked ? "bg-amber-50" : ""
                  }`}
              >
                {/* File Name and Icon Section */}
                <div className="flex items-center gap-2 md:gap-3 min-w-0 col-span-2 md:col-span-1">
                  <span className="shrink-0 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center bg-[#A3E636]/10 rounded-xl">
                    <i className="fas fa-file text-[#A3E636]"></i>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {editingName === file ? (
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-2 md:px-3 py-1 md:py-1.5 border border-black/10 rounded-lg text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#A3E636]"
                          autoFocus
                          onBlur={() => handleNameChange(file)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleNameChange(file);
                            if (e.key === "Escape") setEditingName(null);
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate font-medium text-sm md:text-base">
                            {getDisplayName(file)}
                          </span>
                          <button
                            onClick={() => {
                              setNewName(file.new_name || file.name);
                              setEditingName(file);
                            }}
                            className="shrink-0 w-8 h-8 flex items-center justify-center text-sm hover:bg-black/10 rounded-full transition-all"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          {file.locked && (
                            <i className="shrink-0 fas fa-lock text-black/40 text-sm"></i>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Mobile-only metadata */}
                    <div className="flex md:hidden text-xs text-black/40 mt-1">
                      <span>{file.uploaded_by}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(file.upload_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop-only columns */}
                <div className="hidden md:block truncate text-black/60 text-sm">
                  {file.uploaded_by}
                </div>
                <div className="hidden md:block text-black/60 text-sm">
                  {formatDate(file.upload_at)}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1 md:gap-2">
                  <button
                    onClick={() => handleFileView(file)}
                    className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <i className="fas fa-eye text-sm md:text-base"></i>
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(file.name, file.file_path, file.id)
                    }
                    className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <i className="fas fa-download text-sm md:text-base"></i>
                  </button>
                  <button
                    onClick={() => toggleLock(file)}
                    className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                  >
                    <i
                      className={`fas fa-${file.locked ? "lock" : "lock-open"
                        } text-sm md:text-base`}
                    ></i>
                  </button>
                  <button
                    onClick={() => {
                      setFileToRemove(file);
                      setShowConfirmModal(true);
                    }}
                    className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash text-sm md:text-base"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h1></h1>
          <h1></h1>
          <h1></h1>
        </div>
      )}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          dataroomId={dataroomId}
        />
      )}
      {showConfirmModal && (
        <ConfirmModal
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            handleRemove(fileToRemove); // Remove the selected file
            setShowConfirmModal(false); // Close the modal
          }}
        />
      )}
    </div>
  );
}

function ContentmanagerStory() {
  const mockFiles = [
    {
      name: "Q4 Financial Statements",
      uploadedBy: "Tom Cruise",
      uploadDate: "2024-01-15",
      locked: false,
    },
    {
      name: "Marketing Strategy 2024.docx",
      uploadedBy: "Emma Wilson",
      uploadDate: "2024-01-20",
      locked: true,
    },
    {
      name: "Project Timeline.xlsx",
      uploadedBy: "Mike Johnson",
      uploadDate: "2024-01-25",
      locked: false,
    },
  ];

  return (
    <div className="p-8 bg-white">
      <Contentmanager items={mockFiles} />
    </div>
  );
}

function ContentMobileView({ files: [] }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const files = [
    {
      id: 1,
      name: "Project Proposal.pdf",
      icon: "fa-file-pdf",
      uploader: "John Smith",
      date: "2025-01-15",
    },
    {
      id: 2,
      name: "Meeting Notes.docx",
      icon: "fa-file-word",
      uploader: "Sarah Johnson",
      date: "2025-01-14",
    },
    {
      id: 3,
      name: "Budget Report.xlsx",
      icon: "fa-file-excel",
      uploader: "Mike Brown",
      date: "2025-01-13",
    },
  ];

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="block md:hidden w-full p-4 font-roboto">
      <div className="bg-white rounded-lg shadow">
        {files.map((doc) => (
          <div key={doc.id} className="border-b last:border-b-0 relative">
            {expandedRow === doc.id ? (
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  className="flex items-center justify-center text-gray-600 hover:text-gray-800 ml-4"
                  onClick={(e) => toggleRow(doc.id, e)}
                >
                  <i className="fas fa-ellipsis-v text-gray-600 text-2xl font-bold"></i>
                </button>
              </div>
            ) : (
              <div className="flex items-center p-4 hover:bg-gray-50">
                <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg mr-4">
                  <i className="fas fa-file text-gray-500"></i>
                </span>
                <div className="flex-1 min-w-0 px-4">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                </div>
                <div className="hidden md:block px-4">
                  <p className="text-sm text-gray-500">{doc.uploader}</p>
                </div>
                <div className="hidden md:block px-4 w-32">
                  <p className="text-sm text-gray-500">{doc.date}</p>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={(e) => toggleRow(doc.id, e)}
                >
                  <i className="fas fa-ellipsis-v text-gray-600 text-2xl font-bold"></i>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default Contentmanager;
