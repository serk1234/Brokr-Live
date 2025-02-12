function MainComponent() {
    const [expandedDocuments, setExpandedDocuments] = React.useState({});
    const documents = [
        {
            id: 1,
            name: "Sales Contract.pdf",
            date: "2025-03-15",
            signers: [
                { name: "John Doe", status: "signed", email: "john@example.com" },
                { name: "Jane Smith", status: "viewed", email: "jane@example.com" },
                { name: "Alex Johnson", status: "sent", email: "alex@example.com" },
            ],
        },
        {
            id: 2,
            name: "NDA Agreement.docx",
            date: "2025-03-14",
            signers: [
                { name: "Sarah Wilson", status: "signed", email: "sarah@example.com" },
                { name: "Mike Brown", status: "sent", email: "mike@example.com" },
            ],
        },
        {
            id: 3,
            name: "Investment Terms.pdf",
            date: "2025-03-13",
            signers: [
                { name: "Robert Chen", status: "signed", email: "robert@example.com" },
                { name: "Emily White", status: "viewed", email: "emily@example.com" },
                { name: "David Lee", status: "sent", email: "david@example.com" },
            ],
        },
        {
            id: 4,
            name: "Partnership Agreement.pdf",
            date: "2025-03-12",
            signers: [
                { name: "Lisa Johnson", status: "signed", email: "lisa@example.com" },
                { name: "Mark Davis", status: "signed", email: "mark@example.com" },
                { name: "Anna Kim", status: "signed", email: "anna@example.com" },
            ],
        },
        {
            id: 5,
            name: "Service Contract.docx",
            date: "2025-03-11",
            signers: [
                { name: "Tom Wilson", status: "viewed", email: "tom@example.com" },
                { name: "Sophie Brown", status: "sent", email: "sophie@example.com" },
            ],
        },
    ];
    const toggleDocument = (documentId) => {
        setExpandedDocuments((prev) => ({
            ...prev,
            [documentId]: !prev[documentId],
        }));
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "signed":
                return <i className="fas fa-check-circle text-[#95FF45]"></i>;
            case "viewed":
                return <i className="fas fa-eye text-[#FF9545]"></i>;
            case "sent":
                return <i className="fas fa-paper-plane text-gray-400"></i>;
            default:
                return null;
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case "signed":
                return "Signed";
            case "viewed":
                return "Viewed";
            case "sent":
                return "Sent";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <Header currentPage="/summary" />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold">Document Summary</h1>
                        <a
                            href="/"
                            className="bg-[#95FF45] text-black px-6 py-2 rounded-md hover:bg-[#7ed438] transition-colors duration-150"
                        >
                            New Document
                        </a>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-4">Current Documents</h2>
                        <div className="space-y-4">
                            {documents
                                .filter(
                                    (doc) =>
                                        !doc.signers.every((signer) => signer.status === "signed"),
                                )
                                .map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="bg-[#1a1a1a] rounded-lg overflow-hidden"
                                    >
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#262626]"
                                            onClick={() => toggleDocument(doc.id)}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <i className="fas fa-file-pdf text-[#95FF45] text-xl"></i>
                                                <div>
                                                    <h3 className="font-semibold">{doc.name}</h3>
                                                    <p className="text-sm text-gray-400">{doc.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex -space-x-2">
                                                    {doc.signers.slice(0, 3).map((signer, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center border-2 border-[#1a1a1a]"
                                                        >
                                                            {signer.name.charAt(0)}
                                                        </div>
                                                    ))}
                                                    {doc.signers.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center border-2 border-[#1a1a1a]">
                                                            +{doc.signers.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    className="px-4 py-1 text-sm bg-[#333333] hover:bg-[#404040] rounded-md flex items-center gap-2 min-w-[120px] justify-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Download logic would go here
                                                    }}
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Download
                                                </button>
                                                <i
                                                    className={`fas fa-chevron-down transform transition-transform ${expandedDocuments[doc.id] ? "rotate-180" : ""
                                                        }`}
                                                ></i>
                                            </div>
                                        </div>

                                        {expandedDocuments[doc.id] && (
                                            <div className="border-t border-gray-800">
                                                <div className="p-4">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="text-gray-400 text-sm">
                                                                <th className="text-left py-2">Name</th>
                                                                <th className="text-left py-2">Email</th>
                                                                <th className="text-left py-2">Status</th>
                                                                <th className="text-right py-2">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {doc.signers.map((signer, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-t border-gray-800"
                                                                >
                                                                    <td className="py-3">{signer.name}</td>
                                                                    <td className="py-3">{signer.email}</td>
                                                                    <td className="py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {getStatusIcon(signer.status)}
                                                                            <span className="text-sm">
                                                                                {getStatusText(signer.status)}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 text-right">
                                                                        {signer.status !== "signed" && (
                                                                            <button
                                                                                className="text-sm text-[#95FF45] hover:text-[#7ed438] flex items-center gap-1 ml-auto"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    // Resend logic would go here
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-redo-alt"></i>
                                                                                Resend
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Completed Documents</h2>
                        <div className="space-y-4">
                            {documents
                                .filter((doc) =>
                                    doc.signers.every((signer) => signer.status === "signed"),
                                )
                                .map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="bg-[#1f2937] rounded-lg overflow-hidden"
                                    >
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#2d3748]"
                                            onClick={() => toggleDocument(doc.id)}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <i className="fas fa-file-pdf text-[#95FF45] text-xl"></i>
                                                <div>
                                                    <h3 className="font-semibold">{doc.name}</h3>
                                                    <p className="text-sm text-gray-400">{doc.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex -space-x-2">
                                                    {doc.signers.slice(0, 3).map((signer, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center border-2 border-[#1f2937]"
                                                        >
                                                            {signer.name.charAt(0)}
                                                        </div>
                                                    ))}
                                                    {doc.signers.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-[#374151] flex items-center justify-center border-2 border-[#1f2937]">
                                                            +{doc.signers.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    className="px-4 py-1 text-sm bg-[#374151] hover:bg-[#4b5563] rounded-md flex items-center gap-2 min-w-[120px] justify-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Download logic would go here
                                                    }}
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Download
                                                </button>
                                                <i
                                                    className={`fas fa-chevron-down transform transition-transform ${expandedDocuments[doc.id] ? "rotate-180" : ""
                                                        }`}
                                                ></i>
                                            </div>
                                        </div>

                                        {expandedDocuments[doc.id] && (
                                            <div className="border-t border-gray-800">
                                                <div className="p-4">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="text-gray-400 text-sm">
                                                                <th className="text-left py-2">Name</th>
                                                                <th className="text-left py-2">Email</th>
                                                                <th className="text-left py-2">Status</th>
                                                                <th className="text-right py-2">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {doc.signers.map((signer, index) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-t border-gray-800"
                                                                >
                                                                    <td className="py-3">{signer.name}</td>
                                                                    <td className="py-3">{signer.email}</td>
                                                                    <td className="py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {getStatusIcon(signer.status)}
                                                                            <span className="text-sm">
                                                                                {getStatusText(signer.status)}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 text-right">
                                                                        {signer.status !== "signed" && (
                                                                            <button
                                                                                className="text-sm text-[#95FF45] hover:text-[#7ed438] flex items-center gap-1 ml-auto"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    // Resend logic would go here
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-redo-alt"></i>
                                                                                Resend
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
