function MainComponent() {
    const [selectedTool, setSelectedTool] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [fields, setFields] = useState([]);
    const [signers, setSigners] = useState([
        { id: 1, name: "John Doe", color: "#95FF45" },
        { id: 2, name: "Jane Smith", color: "#FF9545" },
    ]);
    const [selectedField, setSelectedField] = useState(null);
    const [draggedField, setDraggedField] = useState(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const tools = [
        { id: "signature", name: "Signature", icon: "fa-signature" },
        { id: "text", name: "Text", icon: "fa-font" },
        { id: "name", name: "Name", icon: "fa-user" },
        { id: "date", name: "Date (Auto-filled)", icon: "fa-calendar" },
        { id: "address", name: "Address", icon: "fa-home" },
    ];
    const handleDragStart = (tool) => {
        setSelectedTool(tool);
        setDragging(true);
    };
    const handleFieldDragStart = (e, fieldId) => {
        e.stopPropagation();
        setDraggedField(fieldId);
        setIsDragging(true);
        const field = fields.find((f) => f.id === fieldId);
        if (field) {
            setDragPosition({ x: field.x, y: field.y });
        }
    };
    const handleFieldDragEnd = () => {
        setDraggedField(null);
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (selectedTool) {
            const newField = {
                id: Date.now(),
                tool: selectedTool,
                x,
                y,
                assignedTo: null,
                assignedName: null,
                assignedColor: null,
                isAutoFilled: selectedTool.id === "date",
            };
            setFields([...fields, newField]);
            setSelectedField(newField.id);
        } else if (draggedField) {
            setFields(
                fields.map((field) =>
                    field.id === draggedField ? { ...field, x, y } : field,
                ),
            );
        }
        setDragging(false);
        setSelectedTool(null);
        setDraggedField(null);
        setIsDragging(false);
    };
    const handleFieldClick = (fieldId) => {
        setSelectedField(selectedField === fieldId ? null : fieldId);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        if (draggedField) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setDragPosition({ x, y });

            setFields(
                fields.map((field) =>
                    field.id === draggedField ? { ...field, x, y } : field,
                ),
            );
        }
    };
    const handleAssignSigner = (fieldId, signerId, signerName, signerColor) => {
        setFields(
            fields.map((field) =>
                field.id === fieldId
                    ? {
                        ...field,
                        assignedTo: signerId,
                        assignedName: signerName,
                        assignedColor: signerColor,
                    }
                    : field,
            ),
        );
        setSelectedField(null);
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <Header currentPage="/setup" />
            <main className="container mx-auto px-4 py-12">
                <div className="flex gap-6">
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
                        <a
                            href="/summary"
                            className="w-full bg-[#95FF45] text-black px-6 py-3 rounded-md hover:bg-[#7ed438] transition-colors duration-150 flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-paper-plane"></i>
                            Send Document
                        </a>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Document Settings</h1>
                        </div>
                        <div
                            className="relative"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <img
                                alt="https://ucarecdn.com/40add64b-04d3-4b1a-b173-24dcea22f3d4/-/format/auto/"
                                src="https://ucarecdn.com/40add64b-04d3-4b1a-b173-24dcea22f3d4/-/format/auto/"
                                className="w-full rounded-lg shadow-lg"
                            />

                            {fields.map((field) => (
                                <div
                                    key={field.id}
                                    draggable
                                    onDragStart={(e) => handleFieldDragStart(e, field.id)}
                                    onDragEnd={handleFieldDragEnd}
                                    className={`absolute flex flex-col items-center justify-center w-32 transition-transform duration-75 ease-linear ${isDragging && draggedField === field.id ? "z-50 opacity-90" : ""}`}
                                    style={{
                                        left: field.x,
                                        top: field.y,
                                        transform:
                                            isDragging && draggedField === field.id
                                                ? "scale(1.05)"
                                                : "scale(1)",
                                    }}
                                    onClick={() => handleFieldClick(field.id)}
                                >
                                    {field.assignedName && (
                                        <div className="flex items-center text-black text-sm mb-1">
                                            <i
                                                className="fas fa-check-circle mr-1"
                                                style={{ color: field.assignedColor }}
                                            ></i>
                                            <span>{field.assignedName}</span>
                                        </div>
                                    )}
                                    <div
                                        className="flex items-center justify-center h-12 w-full rounded cursor-move transition-all duration-200 ease-in-out"
                                        style={{
                                            backgroundColor: field.assignedColor
                                                ? `${field.assignedColor}33`
                                                : "#95FF4533",
                                            borderColor: field.assignedColor || "#95FF45",
                                            borderWidth: "2px",
                                            borderStyle: "solid",
                                        }}
                                    >
                                        <i
                                            className={`fas ${field.tool.icon}`}
                                            style={{ color: field.assignedColor || "#95FF45" }}
                                        ></i>
                                        <span className="ml-2 text-black">
                                            {field.tool.name}
                                            {field.isAutoFilled && (
                                                <span className="text-xs ml-1 opacity-70">
                                                    (Auto-filled)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {(selectedField === field.id ||
                                        (!field.assignedTo &&
                                            field.id === fields[fields.length - 1]?.id)) && (
                                            <div className="absolute top-full mt-2 bg-white text-black rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100 w-48">
                                                {signers.map((signer) => (
                                                    <div
                                                        key={signer.id}
                                                        className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                        onClick={() =>
                                                            handleAssignSigner(
                                                                field.id,
                                                                signer.id,
                                                                signer.name,
                                                                signer.color,
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: signer.color }}
                                                        ></div>
                                                        <span>{signer.name}</span>
                                                        {field.assignedTo === signer.id && (
                                                            <i
                                                                className="fas fa-check ml-auto"
                                                                style={{ color: signer.color }}
                                                            ></i>
                                                        )}
                                                    </div>
                                                ))}
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


