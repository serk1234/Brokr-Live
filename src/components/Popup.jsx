import React from "react";

const Popup = ({ message, onClose }) => {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
            >
                <p>{message}</p>
                <button
                    onClick={onClose}
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        backgroundColor: "#A3E636",
                        color: "black",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Popup;
