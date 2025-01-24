import React, { useState } from "react";
import PrivacyPolicyModal from "./privacypolicy"; // Import the modal component

function Footer({ title = "Create", logoSrc = "/logo.png" }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Render the Privacy Policy Modal */}
      <PrivacyPolicyModal show={showModal} onClose={() => setShowModal(false)} />

      <footer className="bg-gradient-to-r from-[#111111] to-[#222222] py-4 px-6 border-t border-[#333333]">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <a
            href="/"
            className="font-opensans font-semibold text-white text-lg hover:text-gray-200 transition-colors"
          >
            brokr
          </a>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#888888]">
              © 2024 brokr Technologies Inc. All rights reserved.
            </span>
            <button
              onClick={() => setShowModal(true)} // Show the modal on click
              className="text-[#888888] hover:text-white transition-colors"
            >
              Privacy & Terms
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
