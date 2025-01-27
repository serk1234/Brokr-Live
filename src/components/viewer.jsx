"use client";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function Viewer({ selectedDocument, zoom, setZoom, handleDownload }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header for document details and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4 sm:gap-6">
        {/* File Information */}
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-lg font-semibold truncate">
            {selectedDocument.name}
          </h2>
          <p className="text-sm text-gray-600">
            Uploaded by {selectedDocument.uploadedBy || "Unknown"} on{" "}
            {new Date(selectedDocument.uploadAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Zoom Controls and Download */}
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
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
            <span className="truncate">Download</span>
          </button>
        </div>
      </div>
      {/* Content Viewer */}
      <div className="pdf-container flex-grow bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
        {selectedDocument.src ? (
          selectedDocument.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={selectedDocument.src}
              alt={selectedDocument.name || "File Preview"}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center",
              }}
            />
          ) : true || selectedDocument.name.indexOf(".pdf") < 0 ? (
            <iframe
              src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${selectedDocument.src}#page=2&toolbar=0&navpanes=0`}
              title="File Viewer"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            ></iframe>
          ) : (
            /*  <object
              className="w-full h-full"
              data={selectedDocument.src + "#toolbar=0"}
              type={"application/pdf"}
              width="100%"
              height="100%"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            ></object> */
            <PdfViewwer url={selectedDocument.src} />
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
<style jsx>{`
  @media (max-width: 640px) {
    .flex-wrap {
      flex-direction: column;
    }
    .truncate {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .flex-1 {
      width: 100%;
    }
    .min-w-[200px] {
      min-width: unset;
    }
  }
`}</style>;
