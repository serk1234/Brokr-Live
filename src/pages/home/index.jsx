"use client"

import { useState } from "react";
import "../../app/globals.css";
import MainComponent from "../../components/signheader";
import { supabase } from "../../../src/app/supabaseClient";

// Ensure this hook is correctly imported


function Home() {

    const [file, setFile] = useState(null);
    const [documentUrl, setDocumentUrl] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState("upload");
    const [signers, setSigners] = useState([{ name: "", email: "" }]);
    const [fileName, setFileName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showSigners, setShowSigners] = useState(true);



    const handleFileUpload = async (file) => {
        setFile(file);
        setFileName(file.name);

        // Generate a unique filename using timestamp
        const uniqueFileName = `${Date.now()}-${file.name}`;

        // Upload file with a unique name
        const { data, error } = await supabase.storage
            .from("file_uploads")
            .upload(`documents/${uniqueFileName}`, file, { upsert: false }); // ❌ No overwrite

        if (error) {
            setError("File upload failed");
            console.error("Upload error:", error);
            return;
        }

        // ✅ Correct way to get public URL
        const { data: urlData } = supabase.storage.from("file_uploads").getPublicUrl(`documents/${uniqueFileName}`);
        const publicURL = urlData.publicUrl;

        console.log("Uploaded file URL:", publicURL); // ✅ Debugging

        // ✅ Save document in Supabase database
        const { data: docData, error: docError } = await supabase
            .from("documents")
            .insert([{ file_name: uniqueFileName, document_url: publicURL, status: "pending" }])
            .select();

        if (docError) {
            console.error("Failed to save document info:", docError);
        } else {
            console.log("Saved document to database:", docData);
        }

        setDocumentUrl(publicURL);
    };


    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (
            file &&
            (file.type === "application/pdf" ||
                file.type === "application/msword" ||
                file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        ) {
            await handleFileUpload(file);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleInputChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleFileUpload(file);
        }
    };
    const handleFileNameChange = async (newName) => {
        setFileName(newName);
        setIsEditingName(false);

        try {
            await fetch("/api/db/brokr.sign-test", {
                method: "POST",
                body: JSON.stringify({
                    query: "UPDATE `documents` SET file_name = ? WHERE document_url = ?",
                    values: [newName, documentUrl],
                }),
            });
        } catch (err) {
            setError("Failed to update file name");
        }
    };
    const handleRemoveFile = () => {
        setFile(null);
        setDocumentUrl(null);
        setFileName("");
    };
    const handleSignerChange = (index, field, value) => {
        const newSigners = [...signers];
        newSigners[index][field] = value;
        setSigners(newSigners);
    };
    const addSigner = () => {
        setSigners([...signers, { name: "", email: "" }]);
        setShowSigners(true);
    };
    const removeSigner = (index) => {
        setSigners(signers.filter((_, i) => i !== index));
    };
    const isValidSigners = () => {
        return signers.every(
            (signer) =>
                signer.name.trim() !== "" &&
                signer.email.trim() !== "" &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.email),
        );
    };
    const handleJustMe = () => {
        setSigners([]);
        setShowSigners(false);
    };
    const generateRandomUser = () => {
        const names = ["John Smith", "Jane Doe", "Alex Johnson", "Sarah Wilson"];
        const domains = ["example.com", "test.com", "demo.com", "mail.com"];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        const email = `${randomName.toLowerCase().replace(" ", ".")}@${randomDomain}`;
        return { name: randomName, email };
    };
    const handleAddMe = () => {
        const randomUser = generateRandomUser();
        setSigners([...signers, randomUser]);
        setShowSigners(true);
    };

    const handleContinue = async () => {
        if (!documentUrl) return;

        // ✅ Insert document into Supabase
        const { data: docData, error: docError } = await supabase
            .from("documents")
            .insert([{ file_name: fileName, document_url: documentUrl, status: "pending" }])
            .select();

        if (docError || !docData?.length) {
            setError("Failed to save document information");
            return;
        }

        const documentId = docData[0].id; // ✅ Get document ID

        // ✅ Redirect to setup page with the document ID
        window.location.href = `/setup?docId=${documentId}`;
    };



    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <MainComponent currentPage="/home" />
            <main className="container mx-auto px-4 py-12">
                {step === "upload" && (
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8 text-center">brokr.sign</h1>
                        <div
                            className={`border-2 border-dashed ${isDragging ? "border-[#95FF45]" : "border-gray-600"} rounded-lg p-12 mb-8`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {!file ? (
                                <>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleInputChange}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    <label
                                        htmlFor="fileInput"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <i className="fas fa-cloud-upload-alt text-4xl mb-4 text-[#95FF45]"></i>
                                        <span className="text-lg mb-2">
                                            Drag and drop your file here
                                        </span>
                                        <span className="text-sm text-gray-400">or</span>
                                        <span className="mt-2 bg-[#95FF45] text-black px-4 py-2 rounded-md hover:bg-[#7ed438]">
                                            Browse Files
                                        </span>
                                    </label>
                                    <p className="text-sm text-gray-400 mt-4 text-center">
                                        Supported formats: PDF, DOC, DOCX
                                    </p>
                                </>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-check-circle text-[#95FF45] text-xl"></i>
                                        {isEditingName ? (
                                            <input
                                                type="text"
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                                onBlur={() => handleFileNameChange(fileName)}
                                                onKeyPress={(e) =>
                                                    e.key === "Enter" && handleFileNameChange(fileName)
                                                }
                                                className="bg-transparent border-b border-gray-600 focus:border-[#95FF45] outline-none px-2 py-1"
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className="cursor-pointer hover:text-[#95FF45]"
                                                onClick={() => setIsEditingName(true)}
                                            >
                                                {fileName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <label
                                            htmlFor="fileInput"
                                            className="text-gray-400 hover:text-white cursor-pointer"
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                        </label>
                                        <button
                                            onClick={handleRemoveFile}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {file && (
                            <div className="bg-gray-900 p-8 rounded-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-lg font-semibold">Add Signers</h4>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleJustMe}
                                            className="text-gray-400 hover:text-white px-4 py-2 rounded-md border border-gray-600"
                                        >
                                            Just Me
                                        </button>
                                        <button
                                            onClick={handleAddMe}
                                            className="text-gray-400 hover:text-white px-4 py-2 rounded-md border border-gray-600"
                                        >
                                            Add Me
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {showSigners &&
                                        signers.map((signer, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-[1fr,1fr,auto] gap-4"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    value={signer.name}
                                                    onChange={(e) =>
                                                        handleSignerChange(index, "name", e.target.value)
                                                    }
                                                    className="bg-gray-800 rounded px-3 py-2"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={signer.email}
                                                    onChange={(e) =>
                                                        handleSignerChange(index, "email", e.target.value)
                                                    }
                                                    className="bg-gray-800 rounded px-3 py-2"
                                                />
                                                {index > 0 && (
                                                    <button
                                                        onClick={() => removeSigner(index)}
                                                        className="text-gray-400 hover:text-white px-2"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    {showSigners && (
                                        <button
                                            onClick={addSigner}
                                            className="flex items-center gap-2 text-[#95FF45] hover:text-[#7ed438]"
                                        >
                                            <i className="fas fa-plus"></i>
                                            Add Another Signer
                                        </button>
                                    )}
                                    <div className="flex justify-end mt-4">
                                        <a
                                            href="/setup"
                                            onClick={handleContinue}
                                            className={`bg-[#95FF45] text-black px-6 py-2 rounded-md hover:bg-[#7ed438] ${!isValidSigners() ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            Continue
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === "sign" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-900 rounded-lg p-8">
                            <h2 className="text-2xl font-bold mb-6">Sign Document</h2>
                            <div className="bg-gray-800 rounded-lg p-4 mb-6 h-[600px] flex items-center justify-center">
                                {documentUrl && (
                                    <iframe src={documentUrl} className="w-full h-full" />
                                )}
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setStep("upload")}
                                    className="bg-gray-700 px-6 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setStep("complete")}
                                    className="bg-[#95FF45] text-black px-6 py-2 rounded-md hover:bg-[#7ed438]"
                                >
                                    Sign & Complete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === "complete" && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-gray-900 rounded-lg p-8">
                            <i className="fas fa-check-circle text-[#95FF45] text-6xl mb-4"></i>
                            <h2 className="text-2xl font-bold mb-4">Document Signed!</h2>
                            <p className="mb-6">
                                Your document has been successfully signed and processed.
                            </p>
                            <button
                                onClick={() => setStep("upload")}
                                className="bg-[#95FF45] text-black px-6 py-2 rounded-md hover:bg-[#7ed438]"
                            >
                                Sign Another Document
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;
