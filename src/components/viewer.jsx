function Viewer({ selectedDocument, zoom, setZoom, handleDownload }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header for document details and actions */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{selectedDocument.name}</h2>
          <p className="text-sm text-gray-600">
            Uploaded by {selectedDocument.uploadedBy || "Unknown"} on{" "}
            {new Date(selectedDocument.uploadAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="text-sm text-gray-600">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
          >
            <i className="fas fa-download"></i>
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
        {selectedDocument.src ? (
          selectedDocument.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={selectedDocument.src}
              alt={selectedDocument.name || "File Preview"}
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center",
              }}
            />
          ) : (
            <iframe
              src={`${selectedDocument.src}#toolbar=0`}
              title="File Viewer"
              className="w-full h-full border-none"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            ></iframe>
          )
        ) : (
          <div className="text-center text-gray-500">
            <i className="fas fa-file-alt text-4xl mb-4"></i>
            <p>No document selected</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Viewer;
