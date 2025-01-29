import React from "react";

const SubscribeAlert = ({ isOpen = false, onClose }) => {
    if (!isOpen) return null; // Ensure it doesn't render when undefined/null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#0A0A0A] rounded-xl w-full max-w-lg mx-4 p-8 relative">
                {/* Close (X) Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-300"
                >
                    <i className="fa-solid fa-times text-2xl"></i>
                </button>

                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <i className="fa-solid  text-[#A3E636]"></i>
                    Subscribe to Access.
                </h2>
                <p className="text-gray-400 mt-2">
                    Subscribe now to access the full suite of brokr functions.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {/* Subscribe Button */}
                    <button
                        onClick={() => window.location.href = "/profilesettings?showSubscription=true"}
                        className="p-6 rounded-lg bg-[#111111] border border-[#222222] hover:border-[#A3E636] transition-all duration-300 h-full"
                    >
                        <i className="fa-solid fa-bolt text-[#A3E636] text-2xl mb-2"></i>
                        <h3 className="text-xl font-bold text-white mb-2">Subscribe</h3>

                    </button>

                    {/* Schedule a Demo Button */}
                    <button
                        onClick={() => window.location.href = "https://app.onecal.io/b/bryan-figueroa/brokr-demo"}
                        className="p-6 rounded-lg bg-[#111111] border border-[#222222] hover:border-[#A3E636] transition-all duration-300 h-full"
                    >
                        <i className="fa-solid fa-calendar text-[#A3E636] text-2xl mb-2"></i>
                        <h3 className="text-xl font-bold text-white mb-2">Schedule a Demo</h3>

                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscribeAlert;
