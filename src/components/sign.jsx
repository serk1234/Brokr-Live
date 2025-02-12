function MainComponent() {
    const [fields, setFields] = useState([
        { id: 1, type: "signature", x: 50, y: 550, value: "", completed: false },
        { id: 2, type: "date", x: 50, y: 480, value: "", completed: false },
    ]);
    const [selectedField, setSelectedField] = useState(null);
    const [signatureMode, setSignatureMode] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [showError, setShowError] = useState(false);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [typedSignature, setTypedSignature] = useState("");
    const [drawnSignature, setDrawnSignature] = useState(null);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsDrawing(true);
        setLastPos({ x, y });
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#95FF45";
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        setLastPos({ x, y });
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            setDrawnSignature(canvas.toDataURL());
        }
    };

    const handleAddSignature = () => {
        const signature =
            signatureMode === "draw" ? drawnSignature : typedSignature;
        if (!signature) return;

        const canvas = document.createElement("canvas");
        canvas.width = 250;
        canvas.height = 60;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (signatureMode === "draw") {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 250, 60);
                const finalSignature = canvas.toDataURL();
                updateFields(finalSignature);
            };
            img.src = drawnSignature;
        } else {
            ctx.font = '32px "Dancing Script", cursive';
            ctx.fillStyle = "#95FF45";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
            const finalSignature = canvas.toDataURL();
            updateFields(finalSignature);
        }
    };

    const updateFields = (signature) => {
        const currentDate = new Date().toLocaleDateString();
        setFields(
            fields.map((field) => {
                if (field.id === selectedField?.id) {
                    return { ...field, value: signature, completed: true };
                }
                if (field.type === "date") {
                    return { ...field, value: currentDate, completed: true };
                }
                return field;
            }),
        );
        setSelectedField(null);
        setDrawnSignature(null);
        setTypedSignature("");
    };

    const handleFieldClick = (field) => {
        if (isComplete) return;
        setSelectedField(field);
        if (field.type === "signature") {
            setSignatureMode("draw");
            setTypedSignature("");
            setDrawnSignature(null);
        }
        setShowError(false);
    };

    const handleComplete = () => {
        if (fields.every((field) => field.completed)) {
            setIsComplete(true);
            setShowError(false);
        } else {
            setShowError(true);
            const firstIncomplete = fields.find((field) => !field.completed);
            if (firstIncomplete) {
                setSelectedField(firstIncomplete);
                if (firstIncomplete.type === "signature") {
                    setSignatureMode("draw");
                }
            }
        }
    };

    const handleTypeSignature = (e) => {
        setTypedSignature(e.target.value);
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <Header currentPage="/sign" />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {!isComplete ? (
                        <>
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-bold">Sign Document</h1>
                                <div className="flex items-center gap-4">
                                    {showError && (
                                        <div className="text-[#FF9545] flex items-center">
                                            <i className="fas fa-exclamation-circle mr-2"></i>
                                            Please complete all required fields
                                        </div>
                                    )}
                                    <button
                                        onClick={handleComplete}
                                        className="bg-[#95FF45] text-black px-6 py-2 rounded-md hover:bg-[#7ed438]"
                                    >
                                        Complete Signing
                                    </button>
                                </div>
                            </div>

                            <div className="relative bg-white rounded-lg shadow-lg">
                                <img
                                    src="https://ucarecdn.com/40add64b-04d3-4b1a-b173-24dcea22f3d4/-/format/auto/"
                                    alt="Document preview showing a Delaware LLC formation certificate"
                                    className="w-full rounded-lg"
                                />

                                {fields.map((field) => (
                                    <div
                                        key={field.id}
                                        className={`absolute cursor-pointer transition-all duration-200 ${field.completed
                                                ? "bg-[#95FF4510] border-[#95FF45] shadow-lg"
                                                : "bg-[#FF954510] border-[#FF9545] shadow-lg hover:shadow-xl"
                                            } ${selectedField?.id === field.id ? "ring-2 ring-[#95FF45] transform scale-105" : ""}`}
                                        style={{
                                            left: field.x,
                                            top: field.y,
                                            width: "250px",
                                            height: "60px",
                                            border: "2px solid",
                                            backdropFilter: "blur(4px)",
                                            borderRadius: "8px",
                                            transition: "all 0.3s ease",
                                        }}
                                        onClick={() => handleFieldClick(field)}
                                    >
                                        {!field.completed && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex items-center gap-2 text-black font-medium">
                                                    {field.type === "signature" && (
                                                        <div className="flex items-center bg-[#FF954520] p-2 rounded-lg">
                                                            <i className="fas fa-signature text-[#FF9545] text-2xl"></i>
                                                            <div className="ml-2 bg-[#FF9545] text-white px-3 py-1 rounded-md font-bold">
                                                                SIGN HERE
                                                            </div>
                                                            <div className="ml-2 w-5 h-5 bg-[#FF9545] transform rotate-45 shadow-md"></div>
                                                        </div>
                                                    )}
                                                    {field.type === "date" && (
                                                        <div className="flex items-center bg-[#FF954520] p-2 rounded-lg">
                                                            <i className="fas fa-calendar text-[#FF9545] text-2xl"></i>
                                                            <div className="ml-2 bg-[#FF9545] text-white px-3 py-1 rounded-md font-bold">
                                                                DATE
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {field.completed && field.type === "signature" && (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <img
                                                    src={field.value}
                                                    alt="Signature"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                                <div className="absolute bottom-2 right-2 bg-[#95FF45] text-black text-xs px-3 py-1 rounded-md font-bold shadow-md">
                                                    ✓ Signed
                                                </div>
                                            </div>
                                        )}
                                        {field.completed && field.type === "date" && (
                                            <div className="p-4 text-black font-medium flex items-center justify-between">
                                                <span>{field.value}</span>
                                                <div className="bg-[#95FF45] text-black text-xs px-3 py-1 rounded-md font-bold shadow-md">
                                                    ✓ Date Added
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {selectedField && selectedField.type === "signature" && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-[#1a1a1a] p-6 rounded-lg w-[400px]">
                                        <div className="flex justify-between mb-4">
                                            <h3 className="text-xl font-bold">Add Your Signature</h3>
                                            <button
                                                onClick={() => setSelectedField(null)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex gap-4 mb-4">
                                                <button
                                                    onClick={() => setSignatureMode("draw")}
                                                    className={`flex-1 py-2 rounded ${signatureMode === "draw"
                                                            ? "bg-[#95FF45] text-black"
                                                            : "bg-gray-800"
                                                        }`}
                                                >
                                                    Draw
                                                </button>
                                                <button
                                                    onClick={() => setSignatureMode("type")}
                                                    className={`flex-1 py-2 rounded ${signatureMode === "type"
                                                            ? "bg-[#95FF45] text-black"
                                                            : "bg-gray-800"
                                                        }`}
                                                >
                                                    Type
                                                </button>
                                            </div>
                                            {signatureMode === "draw" ? (
                                                <div className="space-y-4">
                                                    <canvas
                                                        ref={canvasRef}
                                                        width={250}
                                                        height={60}
                                                        className="bg-white rounded"
                                                        onMouseDown={startDrawing}
                                                        onMouseMove={draw}
                                                        onMouseUp={stopDrawing}
                                                        onMouseOut={stopDrawing}
                                                    />
                                                    <button
                                                        onClick={handleAddSignature}
                                                        disabled={!drawnSignature}
                                                        className={`w-full py-2 rounded ${drawnSignature
                                                                ? "bg-[#95FF45] text-black hover:bg-[#7ed438]"
                                                                : "bg-gray-800 text-gray-400 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        Add Signature
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={typedSignature}
                                                        className="w-full bg-gray-800 rounded px-4 py-2"
                                                        placeholder="Type your signature"
                                                        onChange={handleTypeSignature}
                                                    />
                                                    <div className="bg-white rounded p-2 h-[60px] flex items-center justify-center">
                                                        <span className="font-dancing-script text-[#95FF45] text-2xl">
                                                            {typedSignature}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={handleAddSignature}
                                                        disabled={!typedSignature}
                                                        className={`w-full py-2 rounded ${typedSignature
                                                                ? "bg-[#95FF45] text-black hover:bg-[#7ed438]"
                                                                : "bg-gray-800 text-gray-400 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        Add Signature
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedField && selectedField.type === "text" && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-[#1a1a1a] p-6 rounded-lg w-[400px]">
                                        <div className="flex justify-between mb-4">
                                            <h3 className="text-xl font-bold">Add Text</h3>
                                            <button
                                                onClick={() => setSelectedField(null)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-800 rounded px-4 py-2"
                                            placeholder="Enter text"
                                            onChange={handleTextInput}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <i className="fas fa-check-circle text-[#95FF45] text-6xl mb-4"></i>
                            <h2 className="text-2xl font-bold mb-4">Document Signed!</h2>
                            <p className="text-gray-400 mb-8">
                                Your document has been successfully signed.
                            </p>
                            <a
                                href="/summary"
                                className="bg-[#95FF45] text-black px-6 py-2 rounded-md hover:bg-[#7ed438]"
                            >
                                View All Documents
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}