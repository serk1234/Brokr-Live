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

    /** ✅ Fetch active users for starting a new chat **/
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

    /** ✅ Fetch previous chats **/
    useEffect(() => {
        const fetchChats = async () => {
            if (!userEmail) return;

            const { data, error } = await supabase
                .from("chat_participants")
                .select("chat_id, user_email")
                .neq("user_email", userEmail);

            if (error) {
                console.error("❌ Error fetching chats:", error.message);
                return;
            }

            const chatMap = {};
            data.forEach(({ chat_id, user_email }) => {
                if (!chatMap[chat_id]) {
                    chatMap[chat_id] = { email: user_email };
                }
            });

            const chatList = Object.entries(chatMap).map(([chat_id, user]) => ({
                id: chat_id,
                name: user.email,
            }));

            setChats(chatList);
        };

        fetchChats();
    }, [userEmail]);

    /** ✅ Fetch messages **/
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

    /** ✅ Real-time message updates **/
    useEffect(() => {
        if (!selectedChat) return;

        const channel = supabase
            .channel(`chat-${selectedChat.id}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedChat]);

    /** ✅ Start a new chat **/
    const startChat = async (otherUserEmail) => {
        console.log("Starting chat with:", otherUserEmail);

        const { data: existingChat, error: existingError } = await supabase
            .from("chat_participants")
            .select("chat_id")
            .eq("user_email", userEmail);

        if (existingError) {
            console.error("Error checking existing chat:", existingError.message);
            return;
        }

        let chatExists = null;
        for (let chat of existingChat) {
            const { data, error } = await supabase
                .from("chat_participants")
                .select("chat_id")
                .eq("chat_id", chat.chat_id)
                .eq("user_email", otherUserEmail);

            if (!error && data.length > 0) {
                chatExists = chat.chat_id;
                break;
            }
        }

        if (chatExists) {
            setSelectedChat({ id: chatExists, name: otherUserEmail });
            return;
        }

        const { data: newChat, error: chatError } = await supabase
            .from("chats")
            .insert([{ type: "private" }])
            .select()
            .single();

        if (chatError) {
            console.error("Error creating chat:", chatError.message);
            return;
        }

        await supabase.from("chat_participants").insert([
            { chat_id: newChat.id, user_email: userEmail },
            { chat_id: newChat.id, user_email: otherUserEmail }
        ]);

        setSelectedChat({ id: newChat.id, name: otherUserEmail });
        setShowUserList(false);
    };

    /** ✅ Send a message **/
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        const { error } = await supabase.from("messages").insert({
            chat_id: selectedChat.id,
            sender_email: userEmail,
            content: newMessage,
        });

        if (!error) {
            setMessages([...messages, { sender_email: userEmail, content: newMessage }]);
            setNewMessage("");
        }
    };

    return (
        <div className="flex h-full">
            {/* 📌 Sidebar */}
            <div className="w-1/3 bg-gray-100 p-4">
                <h2 className="text-xl font-semibold mb-4">Messages</h2>

                {/* ✅ Start Chat Button */}
                <button
                    className="w-full bg-green-500 text-white p-3 rounded-lg mb-4"
                    onClick={() => setShowUserList(!showUserList)}
                >
                    Start Chat
                </button>

                {/* ✅ Show active users to start a new chat */}
                {showUserList && (
                    <div className="mt-4 bg-white shadow-md p-3 rounded-lg">
                        <h3 className="text-md font-semibold mb-2">Start a Chat</h3>
                        {activeUsers.map(user => (
                            <div
                                key={user.email}
                                className="p-2 cursor-pointer hover:bg-gray-200 rounded"
                                onClick={() => startChat(user.email)}
                            >
                                {user.email}
                            </div>
                        ))}
                    </div>
                )}

                {/* ✅ Show list of previous chats (Always Visible) */}
                <h3 className="text-md font-semibold mt-4">Previous Chats</h3>
                {chats.length > 0 ? (
                    chats.map(chat => (
                        <div
                            key={chat.id}
                            className="flex items-center p-3 cursor-pointer hover:bg-gray-200 rounded-lg"
                            onClick={() => setSelectedChat(chat)}
                        >
                            <div className="font-semibold text-blue-600">{chat.name}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No previous chats</p>
                )}
            </div>

            {/* 📌 Chat Messages */}
            <div className="flex-1 flex flex-col p-4">
                {selectedChat ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4">{selectedChat.name}</h2>
                        <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow">
                            {messages.length > 0 ? (
                                messages.map((msg, index) => (
                                    <div key={index} className={`mb-2 p-2 rounded ${msg.sender_email === userEmail ? "bg-green-200 text-right" : "bg-gray-300 text-left"}`}>
                                        <strong>{msg.sender_email}</strong>
                                        <p>{msg.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No messages yet. Start a conversation!</p>
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
                            <button className="bg-green-500 text-white px-4 rounded-r" onClick={sendMessage}>
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">Select a chat to start messaging</p>
                )}
            </div>
        </div>
    );
}

export default Inbox;

