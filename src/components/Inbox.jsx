"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";

function Inbox({ userEmail, dataroomId }) {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            if (!dataroomId) return;
            const { data, error } = await supabase
                .from("invited_users")
                .select("email")
                .eq("status", "active")
                .eq("dataroom_id", dataroomId);
            if (!error) setActiveUsers(data);
        };
        fetchActiveUsers();
    }, [dataroomId]);

    useEffect(() => {
        const fetchChats = async () => {
            if (!userEmail) return;
            const { data, error } = await supabase
                .from("chat_participants")
                .select("chat_id, user_email")
                .neq("user_email", userEmail);
            if (error) return console.error("Error fetching chats:", error);
            setChats(data);
        };
        fetchChats();
    }, [userEmail]);

    useEffect(() => {
        if (!selectedChat) return;
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("chat_id", selectedChat.id)
                .order("created_at", { ascending: true });
            if (!error) setMessages(data);
        };
        fetchMessages();
    }, [selectedChat]);

    const startChat = async (otherUserEmail) => {
        setShowUserList(false);
        setSelectedChat({ id: Date.now(), name: otherUserEmail });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        setMessages([...messages, { sender_email: userEmail, content: newMessage }]);
        setNewMessage("");
    };

    return (
        <div className="flex h-full border shadow-lg rounded-lg">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-100 p-4 border-r">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Messages</h2>
                    <div className="flex items-center gap-2">
                        <button
                            className="bg-[#A3E636] text-black px-3 py-1 rounded-md text-sm"
                            onClick={() => setShowUserList(true)}
                        >
                            Start Chat
                        </button>
                        <i
                            className="fas fa-message-plus text-blue-600 cursor-pointer text-2xl"
                            onClick={() => setShowUserList(true)}
                        ></i>
                    </div>
                </div>
                {chats.map((chat, index) => (
                    <div
                        key={index}
                        className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 rounded-lg"
                        onClick={() => setSelectedChat(chat)}
                    >
                        <div>
                            <p className="font-semibold">{chat.user_email}</p>
                            <p className="text-gray-500 text-sm">Last message...</p>
                        </div>
                        <span className="text-gray-400 text-xs">2h</span>
                    </div>
                ))}
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col p-4">
                {selectedChat ? (
                    <>
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">{selectedChat.name}</h2>
                        <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg">
                            {messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 p-2 rounded ${msg.sender_email === userEmail ? "bg-green-200 text-right" : "bg-gray-300 text-left"}`}
                                    >
                                        <strong>{msg.sender_email}</strong>
                                        <p>{msg.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No messages yet.</p>
                            )}
                        </div>
                        <div className="mt-4 flex">
                            <input
                                type="text"
                                className="border p-2 flex-1 rounded-l"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button className="bg-green-500 text-white px-4 rounded-r" onClick={sendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">Select a chat to start messaging</p>
                )}
            </div>

            {/* User List Modal */}
            {showUserList && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
                        <h3 className="text-lg font-semibold mb-3">Start a Chat</h3>
                        {activeUsers.map(user => (
                            <div
                                key={user.email}
                                className="p-2 cursor-pointer hover:bg-gray-200 rounded"
                                onClick={() => startChat(user.email)}
                            >
                                {user.email}
                            </div>
                        ))}
                        <button
                            className="mt-3 bg-red-500 text-white p-2 rounded w-full"
                            onClick={() => setShowUserList(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inbox;
