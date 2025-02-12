"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../../src/app/supabaseClient"; // Import Supabase instance
import MainComponent from "../../components/signheader";
import "../../app/globals.css";

function Setup() {
    const [documentUrl, setDocumentUrl] = useState(null);
    const [fields, setFields] = useState([]);
    const [signers, setSigners] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [draggedTool, setDraggedTool] = useState(null);
    const router = useRouter();

    const tools = [
        { id: "signature", name: "Signature", icon: "fa-signature" },
        { id: "text", name: "Text", icon: "fa-font" },
        { id: "name", name: "Name", icon: "fa-user" },
        { id: "date", name: "Date (Auto-filled)", icon: "fa-calendar" },
        { id: "address", name: "Address", icon: "fa-home" },
    ];

    // ✅ Fetch Document from URL or Database
    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const url = urlParams.get("documentUrl");
            if (url) {
                setDocumentUrl(url);
            }
        }
    }, []);

    useEffect(() => {
        const fetchFields = async () => {
            if (!documentUrl) return;

            console.log("Fetching fields for document:", documentUrl);

            // ✅ Get document ID first
            const { data: documentData, error: documentError } = await supabase
                .from("documents")
                .select("id")
                .eq("document_url", documentUrl)
                .single();

            if (documentError || !documentData) {
                console.error("❌ Failed to get document ID:", documentError);
                return;
            }

            const documentId = documentData.id;

            // ✅ Fetch fields using document ID
            const { data, error } = await supabase
                .from("document_fields")
                .select("*")
                .eq("document_id", documentId);

            if (error) {
                console.error("❌ Error fetching fields:", error);
            } else {
                console.log("✅ Fields fetched:", data);

                setFields(
                    data.map((field) => ({
                        id: field.id,
                        tool: { id: field.tool_id, name: field.tool_name },
                        x: field.x,
                        y: field.y,
                        assignedTo: field.assigned_to,
                    }))
                );
            }
        };

        fetchFields();
    }, [documentUrl]);




    useEffect(() => {
        const fetchLatestDocument = async () => {
            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("❌ Error fetching document:", error);
            } else if (data) {
                setDocumentUrl(data.document_url);
            }
        };

        if (!documentUrl) {
            fetchLatestDocument();
        }
    }, [documentUrl]);

    // ✅ Fetch Signers from Supabase
    useEffect(() => {
        const fetchSigners = async () => {
            const { data, error } = await supabase.from("signers").select("*");
            if (error) {
                console.error("❌ Error fetching signers:", error.message);
            } else {
                setSigners(data);
            }
        };
        fetchSigners();
    }, []);

    // ✅ Drag Start (Set the Tool Being Dragged)
    const handleDragStart = (tool) => {
        setDraggedTool(tool);
    };

    // ✅ Drop Event (Place the Field on the Document)
    const handleDrop = async (e) => {
        e.preventDefault();
        if (!draggedTool) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newField = {
            id: Date.now(), // Temporary frontend ID
            tool: draggedTool,
            x,
            y,
            assignedTo: null,
        };

        setFields([...fields, newField]);

        // ✅ Get document ID from URL (or fetch from `documents` table)
        const { data: documentData, error: documentError } = await supabase
            .from("documents")
            .select("id")
            .eq("document_url", documentUrl)
            .single();

        if (documentError || !documentData) {
            console.error("❌ Failed to get document ID:", documentError);
            return;
        }

        const documentId = documentData.id;

        // ✅ Insert field into `document_fields`
        try {
            const { error } = await supabase.from("document_fields").insert([
                {
                    document_id: documentId,
                    tool_id: draggedTool.id,
                    tool_name: draggedTool.name,
                    x,
                    y,
                    assigned_to: null,
                },
            ]);

            if (error) console.error("❌ Error saving field:", error);
            else console.log("✅ Field saved successfully");
        } catch (err) {
            console.error("❌ Database error:", err.message);
        }

        setDraggedTool(null);
    };


    // ✅ Allow Dragging Over the Document
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // ✅ Assign a Signer to a Field
    const handleAssignSigner = async (fieldId, signerEmail, signerName) => {
        const updatedFields = fields.map((field) =>
            field.id === fieldId
                ? { ...field, assignedTo: signerEmail, assignedName: signerName }
                : field
        );

        setFields(updatedFields);

        // ✅ Update database
        try {
            const { error } = await supabase
                .from("document_fields")
                .update({ assigned_to: signerEmail })
                .eq("id", fieldId);

            if (error) {
                console.error("❌ Error updating signer assignment:", error);
            }
        } catch (err) {
            console.error("❌ Database error:", err.message);
        }
    };



    // ✅ Save Setup to Supabase
    const handleSaveSetup = async () => {
        try {
            console.log("📝 Saving document setup...");
            const { data, error } = await supabase.from("document_fields").insert(fields);
            if (error) {
                console.error("❌ Error saving setup:", error.message);
                return;
            }
            console.log("✅ Setup saved successfully:", data);
        } catch (err) {
            console.error("❌ Failed to save document setup:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <MainComponent currentPage="/setup" />
            <main className="container mx-auto px-4 py-12">
                <div className="flex gap-6">
                    {/* Left Sidebar - Tools */}
                    <div className="w-64">
                        <div className="bg-gray-900 p-4 rounded-lg mb-4">
                            <h2 className="text-xl font-bold mb-4">Fields</h2>
                            <div className="space-y-2">
                                {tools.map((tool) => (
                                    <div
                                        key={tool.id}
                                        draggable
                                        onDragStart={() => handleDragStart(tool)}
                                        className="flex items-center gap-3 p-3 bg-gray-800 rounded-md cursor-move hover:bg-gray-700"
                                    >
                                        <i className={`fas ${tool.icon} text-[#95FF45]`}></i>
                                        <span>{tool.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleSaveSetup}
                            className="w-full bg-[#95FF45] text-black px-6 py-3 rounded-md hover:bg-[#7ed438] transition-colors duration-150 flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-paper-plane"></i>
                            Save & Send
                        </button>
                    </div>

                    {/* Document Display Area */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-6">Document Settings</h1>

                        <div
                            className="relative w-full h-[800px] bg-gray-900 rounded-lg shadow-lg overflow-hidden"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            {documentUrl ? (
                                <iframe
                                    src={documentUrl}
                                    className="w-full h-full rounded-lg pointer-events-none"
                                    onError={() => console.error("❌ Failed to load document:", documentUrl)}
                                ></iframe>
                            ) : (
                                <p className="text-center text-gray-400 mt-20">No document uploaded yet.</p>
                            )}

                            {/* Render draggable fields */}
                            {fields.map((field) => (
                                <div
                                    key={field.id}
                                    className="absolute flex flex-col items-center justify-center w-32 cursor-pointer"
                                    style={{
                                        left: `${field.x}px`,
                                        top: `${field.y}px`,
                                        transform: "translate(-50%, -50%)",
                                        position: "absolute",
                                        zIndex: 10, // Ensure it appears above the document
                                    }}
                                    onClick={() => setSelectedField(field.id)}
                                >
                                    {field.assignedTo && (
                                        <div className="text-black text-sm mb-1">
                                            <i className="fas fa-check-circle mr-1" style={{ color: "#95FF45" }}></i>
                                            <span>{field.assignedTo}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center h-12 w-full rounded bg-[#95FF4533] border-2 border-[#95FF45]">
                                        <i className={`fas ${field.tool.icon}`} style={{ color: "#95FF45" }}></i>
                                        <span className="ml-2 text-black">{field.tool.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Setup;
