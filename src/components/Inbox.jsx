"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/app/supabaseClient";
import { formatDistanceToNow } from "date-fns";
import { format, isSameDay, parseISO } from "date-fns";// Install with `npm install date-fns`

function Inbox({ userEmail, dataroomId }) {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeUsers, setActiveUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedChat) return;

        console.log("Uploading file:", file.name);

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from("chat_files")
            .upload(`${selectedChat.id}/${file.name}`, file);

        if (error) {
            console.error("❌ Error uploading file:", error.message);
            return;
        }

        // Get the public URL of the uploaded file
        const publicUrl = supabase.storage.from("chat_files").getPublicUrl(`${selectedChat.id}/${file.name}`).data.publicUrl;
        console.log("✅ File uploaded, public URL:", publicUrl);

        // Send the file as a message
        await supabase.from("messages").insert({
            chat_id: selectedChat.id,
            sender_email: userEmail,
            content: `File: <a href='${publicUrl}' target='_blank'>${file.name}</a>`,
            dataroom_id: dataroomId,
        });

        // Update messages state
        setMessages([...messages, { sender_email: userEmail, content: `File: <a href='${publicUrl}' target='_blank'>${file.name}</a>`, created_at: new Date().toISOString() }]);
    };


    const handleDragOver = (event) => {
        event.preventDefault();
        event.currentTarget.classList.add("border-green-500", "border-dashed");
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove("border-green-500", "border-dashed");
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove("border-green-500", "border-dashed");
        const file = event.dataTransfer.files[0];
        if (file) {
            await handleFileUpload({ target: { files: [file] } });
        }
    };


    useEffect(() => {
        if (!selectedChat?.id) return;

        console.log("Subscribing to chat messages:", selectedChat.id);

        const channel = supabase
            .channel(`chat-${selectedChat.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `chat_id=eq.${selectedChat.id}`
                },
                (payload) => {
                    console.log("🔔 New message received:", payload.new);
                    setMessages((prev) => [...prev, payload.new]); // ✅ Update messages in real-time
                }
            )
            .subscribe();

        return () => {
            console.log("Unsubscribing from chat:", selectedChat.id);
            supabase.removeChannel(channel);
        };
    }, [selectedChat]);

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
            if (!userEmail || !dataroomId) return;
    
            console.log("Fetching chats for user:", userEmail, "in dataroom:", dataroomId);
    
            // ✅ Fetch chats where the user is a participant
            const { data, error } = await supabase
                .from("chat_participants")
                .select("chat_id")
                .eq("user_email", userEmail)
                .eq("dataroom_id", dataroomId);
    
            if (error) {
                console.error("❌ Error fetching chats:", error.message);
                return;
            }
    
            if (!data || data.length === 0) {
                console.warn("⚠️ No chats found for user.");
                setChats([]);
                return;
            }
    
            const chatList = await Promise.all(
                data.map(async ({ chat_id }) => {
                    // Fetch the participant that is NOT the current user
                    const { data: participants, error: participantError } = await supabase
                        .from("chat_participants")
                        .select("user_email")
                        .eq("chat_id", chat_id)
                        .neq("user_email", userEmail);
    
                    if (participantError) {
                        console.error("❌ Error fetching chat participants:", participantError.message);
                        return null;
                    }
    
                    // Fetch latest message
                    const { data: lastMessage, error: lastMessageError } = await supabase
                        .from("messages")
                        .select("content, sender_email, created_at")
                        .eq("chat_id", chat_id)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();
    
                    if (lastMessageError && lastMessageError.code !== "PGRST116") {
                        console.error("❌ Error fetching latest message:", lastMessageError.message);
                        return null;
                    }
    
                    return {
                        id: chat_id,
                        name: participants.length > 0 ? participants[0].user_email : "Unknown",  // ✅ Fix: No more "Unknown"
                        lastMessage: lastMessage ? {
                            content: lastMessage.content.includes("File:")
                                ? `${lastMessage.sender_email === userEmail ? "You" : lastMessage.sender_email} sent an attachment.`
                                : lastMessage.content.length > 50
                                    ? lastMessage.content.substring(0, 50) + "..."
                                    : lastMessage.content,
                            sender: lastMessage.sender_email === userEmail ? "You" : lastMessage.sender_email,
                            timestamp: lastMessage.created_at
                        } : null
                    };
                })
            );
    
            setChats(chatList.filter(Boolean)); // ✅ Remove any failed fetches
        };
    
        fetchChats();
    }, [userEmail, dataroomId]);
    


    /** ✅ Fetch messages **/
    useEffect(() => {
        if (!selectedChat?.id) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("chat_id", selectedChat.id)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("❌ Error fetching messages:", error.message);
                return;
            }

            setMessages(data);
        };

        fetchMessages();
    }, [selectedChat]);

    /** ✅ Start a new chat **/
    const startChat = async (otherUserEmail) => {
        console.log("Starting chat with:", otherUserEmail);

        let chatExists = chats.find(chat => chat.name === otherUserEmail);

        if (!chatExists) {
            const { data: newChat, error: newChatError } = await supabase
                .from("chats")
                .insert([{ type: "private", dataroom_id: dataroomId }])
                .select()
                .single();

            if (newChatError) {
                console.error("❌ Error creating new chat:", newChatError.message);
                return;
            }

            await supabase.from("chat_participants").insert([
                { chat_id: newChat.id, user_email: userEmail, dataroom_id: dataroomId },
                { chat_id: newChat.id, user_email: otherUserEmail, dataroom_id: dataroomId }
            ]);

            chatExists = { id: newChat.id, name: otherUserEmail };
            setChats([...chats, chatExists]);
        }

        setSelectedChat(chatExists);
        setShowUserList(false);  // ✅ Close popup after selection
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || !dataroomId) return;

        console.log("Sending message:", newMessage);  // ✅ Log message content
        console.log("Selected Chat ID:", selectedChat?.id); // ✅ Log chat ID

        const { error } = await supabase.from("messages").insert({
            chat_id: selectedChat.id,
            sender_email: userEmail,
            content: newMessage,  // ✅ Ensure this is always a string
            dataroom_id: dataroomId,
        });

        if (error) {
            console.error("❌ Error sending message:", error.message);
            return;
        }

        // Ensure message is added correctly
        setMessages([...messages, { sender_email: userEmail, content: newMessage, created_at: new Date().toISOString() }]);
        setNewMessage(""); // ✅ Clear input after sending
    };


    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-1/3 bg-gray-100 p-4">
                {/* Messages Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Messages</h2>
                    <button onClick={() => setShowUserList(true)} className="text-gray-700 hover:text-gray-900 text-2xl">
                        <i className="fa-solid fa-inbox"></i>
                    </button>
                </div>

                {/* Start Chat Popup */}
                {/* Start Chat Popup */}
                {showUserList && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-semibold mb-4">Start a New Chat</h3>

                            {/* List Active Users */}
                            {activeUsers.length > 0 ? (
                                activeUsers.map(user => (
                                    <div
                                        key={user.email}
                                        className="p-2 cursor-pointer hover:bg-gray-200 rounded"
                                        onClick={() => startChat(user.email)}
                                    >
                                        {user.email}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No active users available</p>
                            )}

                            {/* Close Button */}
                            <button
                                className="mt-4 w-full bg-gray-400 p-2 rounded"
                                onClick={() => setShowUserList(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}



                {/* Chat List */}

                {chats.length > 0 ? (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`flex flex-col p-3 cursor-pointer rounded-lg transition duration-200 ${selectedChat?.id === chat.id ? "bg-gray-200" : "hover:bg-gray-100"
                                }`}
                            onClick={() => setSelectedChat(chat)}
                        >
                            <div className="font-bold text-black">{chat.name}</div>
                            <div className="text-gray-500 text-sm">
                                <span className="truncate">{chat.lastMessage ? chat.lastMessage.content : "No messages yet"}</span>
                                {chat.lastMessage?.timestamp && <span className="mx-1">•</span>}
                                {chat.lastMessage?.timestamp && (
                                    <span className="text-xs">
                                        {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: false })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No previous chats</p>
                )}
            </div>

            {/* Chat Box */}
            <div className="flex-1 flex flex-col p-4">
                {selectedChat ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4">{selectedChat.name}</h2>
                        <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow">
                            {messages.map((msg, index) => {
                                const messageDate = parseISO(msg.created_at);
                                const prevMessageDate = index > 0 ? parseISO(messages[index - 1].created_at) : null;
                                const showDate = !prevMessageDate || !isSameDay(messageDate, prevMessageDate);

                                return (
                                    <div key={index} className="mb-2">
                                        {showDate && <div className="text-center text-xs text-gray-500 my-2">{format(messageDate, "MMMM d, yyyy")}</div>}
                                        <div
                                            className={`p-3 rounded-lg max-w-[70%] ${msg.sender_email === userEmail ? "bg-blue-500 text-white self-end" : "bg-white border self-start"
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <div className="text-right text-xs text-gray-600 mt-1">{format(messageDate, "h:mm a")}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex">
                            <input type="text" className="border p-2 flex-1 rounded-l" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
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
    )
}




export default Inbox;
