"use client";
import React from "react";


function MainComponent({ currentPage = "/" }) {


    const navItems = [
        { path: "/", label: "Home", link: "/home" },
        { path: "/setup", label: "Setup", link: "/setup" },
        { path: "/summary", label: "Summary", link: "/summary" },
        { path: "/sign", label: "Sign", link: "/sign" },
    ];

    return (
        <header className="bg-[#121212] border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <a href="/home" className="flex items-center gap-2">
                        <i className="fas fa-file-signature text-[#95FF45] text-2xl"></i>
                        <span className="text-white text-xl font-bold">brokr.sign</span>
                    </a>
                    <nav>
                        <ul className="flex items-center gap-6">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <a
                                        href={item.link}
                                        className={`text-sm ${currentPage === item.path
                                            ? "text-[#95FF45]"
                                            : "text-gray-400 hover:text-white"
                                            } transition-colors duration-150`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

function StoryComponent() {
    return (
        <div className="bg-[#000000]">
            <MainComponent currentPage="/" />
        </div>
    );
}

export default MainComponent;