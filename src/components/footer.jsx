"use client";
import React, { useState } from "react";



function Footer({ title = "Create", logoSrc = "/logo.png" }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-white to-[#f8f9fa] rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto p-12 relative border border-gray-200 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <i className="fas fa-times text-xl" />
            </button>
            <div className="prose prose-lg max-w-none">
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                Privacy Policy
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                Effective Date: December 10, 2024
              </p>

              <div className="space-y-8">
                <p className="text-gray-600 leading-relaxed">
                  brokr Technologies Inc. ("Company," "we," "us," or "our")
                  values your privacy and is committed to protecting your
                  personal data. This Privacy Policy explains how we collect,
                  use, and disclose information about users of our dataroom
                  subscription services (the "Services").
                </p>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    1. Information We Collect
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We may collect the following types of information:
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle mt-1 text-black"></i>
                      <span>
                        <strong>Personal Information:</strong> Name, email
                        address, billing information, and other details
                        necessary to create and maintain your account.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle mt-1 text-black"></i>
                      <span>
                        <strong>Usage Data:</strong> Information about your
                        interactions with the Services, such as IP address,
                        browser type, and activity logs.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle mt-1 text-black"></i>
                      <span>
                        <strong>Files and Documents:</strong> Any files or
                        documents you upload to the datarooms are encrypted and
                        accessible only to you and authorized parties.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    2. How We Use Your Information
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-arrow-right text-black"></i>
                      <span>Provide and maintain the Services</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-arrow-right text-black"></i>
                      <span>Process payments and manage subscriptions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-arrow-right text-black"></i>
                      <span>Improve and optimize the Services</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-arrow-right text-black"></i>
                      <span>
                        Communicate with you about updates, promotions, or
                        service-related issues
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-arrow-right text-black"></i>
                      <span>
                        Ensure compliance with legal obligations and enforce our
                        Terms of Service
                      </span>
                    </li>
                  </ul>
                </div>

                <h2 className="text-4xl font-bold mt-16 mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  Terms of Service
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                  Effective Date: December 10, 2024
                </p>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    1. Agreement to Terms
                  </h3>
                  <p className="text-gray-600">
                    By accessing or using the Services provided by brokr
                    Technologies Inc. ("Company," "we," "us," or "our"), you
                    agree to these Terms of Service ("Terms"). If you do not
                    agree, you must not use the Services.
                  </p>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">2. Eligibility</h3>
                  <p className="text-gray-600">
                    You must be at least 18 years old and capable of entering
                    into legally binding agreements to use the Services.
                  </p>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    3. Account Registration
                  </h3>
                  <p className="text-gray-600">
                    You are responsible for maintaining the confidentiality of
                    your account credentials and for all activities under your
                    account.
                  </p>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    4. Subscription Services
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle mt-1 text-black"></i>
                      <span>
                        <strong>Fees:</strong> Subscription fees for the
                        Services are detailed on our website. All fees are
                        non-refundable.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle mt-1 text-black"></i>
                      <span>
                        <strong>Renewals:</strong> Subscriptions renew
                        automatically unless canceled prior to the renewal date.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle mt-1 text-black"></i>
                      <span>
                        <strong>Termination:</strong> We reserve the right to
                        suspend or terminate your account for violations of
                        these Terms or misuse of the Services.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    5. Prohibited Activities
                  </h3>
                  <p className="text-gray-600">You agree not to:</p>
                  <ul className="space-y-3 text-gray-600 mt-4">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-times text-red-500"></i>
                      <span>Use the Services for unlawful purposes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-times text-red-500"></i>
                      <span>Attempt to breach our security measures</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-times text-red-500"></i>
                      <span>
                        Misuse or distribute any data obtained through the
                        Services
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    6. Intellectual Property
                  </h3>
                  <p className="text-gray-600">
                    All content, trademarks, and technology used in the Services
                    are the property of brokr Technologies Inc. or its
                    licensors.
                  </p>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">
                    7. Limitation of Liability
                  </h3>
                  <p className="text-gray-600">
                    To the fullest extent permitted by law, brokr Technologies
                    Inc. is not liable for any indirect, incidental, or
                    consequential damages arising from your use of the Services.
                  </p>
                </div>

                <div className="bg-[#f8f9fa] p-8 rounded-xl border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">8. Governing Law</h3>
                  <p className="text-gray-600">
                    These Terms are governed by the laws of the State of
                    Delaware, without regard to conflict of law principles. Any
                    disputes shall be resolved exclusively in the state or
                    federal courts located in Delaware.
                  </p>
                </div>

                <div className="mt-12 p-8 bg-black text-white rounded-xl">
                  <h4 className="font-bold mb-4">Contact Information</h4>
                  <div className="space-y-2 text-gray-300">
                    <p>brokr Technologies Inc.</p>
                    <p>8 The Green, Ste R, Dover County, Kent DE 19901</p>
                    <p>Email: contact@hellobrokr.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => setShowModal(true)}
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

function FooterStory() {
  return (
    <div className="bg-white bg-[url('/grid.svg')]">
      <Footer />
    </div>
  );
}

export default Footer;