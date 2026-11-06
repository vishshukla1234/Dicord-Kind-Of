import React, { useState, useRef, useEffect, useMemo } from "react";
import logo from "../assets/logo.png"
import {
    MdSend,
    MdAttachFile,
    MdOutlineContentCopy,
    MdCheck,
    MdSearch,
    MdClose,
    MdLogout,
    MdOutlineDeleteSweep,
    MdVolumeUp,
    MdVolumeOff,
    MdArrowDownward,
    MdSentimentSatisfiedAlt,
    MdOutlineChat,
    MdShield,
    MdUpload,
} from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { baseUrl } from "../config/AxiosHelper";
import toast from "react-hot-toast";
import {
    getMessages,
    clearMessagesApi,
    joinChatApi,
    sendImageApi,
} from "../services/RoomService";
import {
    timeAgo,
    formatTime,
    playNotificationSound,
    compressImage,
} from "../config/helper";
import EmojiPicker from "./EmojiPicker";

const QUICK_EMOJIS = ["👍", "❤️", "🔥", "😂", "🎉", "✨", "🚀", "👏", "👋", "👀"];

const ChatPage = () => {
    const {
        roomId,
        roomAdmin,
        setRoomAdmin,
        currentUser,
        connected,
        leaveRoom,
    } = useChatContext();

    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [copied, setCopied] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        return localStorage.getItem("chat_sound_enabled") !== "false";
    });
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [showEmojiBar, setShowEmojiBar] = useState(false);
    const [attachedImage, setAttachedImage] = useState(null);
    const [isCompressingImage, setIsCompressingImage] = useState(false);
    const [isSendingImage, setIsSendingImage] = useState(false);
    const [previewModalImage, setPreviewModalImage] = useState(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [stompClient, setStompClient] = useState(null);

    const chatBox = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    // Redirect to home if disconnected
    useEffect(() => {
        if (!connected) {
            navigate("/");
        }
    }, [connected, navigate]);

    // Fetch room metadata (including admin) and initial messages
    useEffect(() => {
        let mounted = true;
        async function loadRoomAndMessages() {
            if (!roomId) return;
            try {
                if (!roomAdmin) {
                    const roomInfo = await joinChatApi(roomId);
                    if (mounted && roomInfo?.admin) {
                        setRoomAdmin(roomInfo.admin);
                    }
                }

                const data = await getMessages(roomId, 100);
                if (mounted && Array.isArray(data)) {
                    setMessages(data);
                }
            } catch (err) {
                console.error("Failed to load room messages", err);
            }
        }

        if (connected) {
            loadRoomAndMessages();
        }

        return () => {
            mounted = false;
        };
    }, [roomId, connected, roomAdmin, setRoomAdmin]);

    // WebSocket STOMP connection
    useEffect(() => {
        if (!connected || !roomId) return;

        let active = true;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${baseUrl}/chat`),
            reconnectDelay: 4000,
            onConnect: () => {
                if (!active) return;
                setStompClient(client);

                // Subscribe to room messages
                client.subscribe(`/topic/room/${roomId}`, (messageFrame) => {
                    try {
                        const newMsg = JSON.parse(messageFrame.body);
                        setMessages((prev) => {
                            // Deduplicate if already added via REST response
                            const alreadyExists = prev.some(
                                (m) =>
                                    m.sender === newMsg.sender &&
                                    m.content === newMsg.content &&
                                    (m.timeStamp === newMsg.timeStamp ||
                                        Math.abs(new Date(m.timeStamp) - new Date(newMsg.timeStamp)) < 1500)
                            );
                            if (alreadyExists) return prev;
                            return [...prev, newMsg];
                        });

                        // Sound notification if received from another user
                        if (newMsg.sender !== currentUser) {
                            if (soundEnabled) {
                                playNotificationSound();
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing incoming message", e);
                    }
                });

                // Subscribe to typing notifications
                client.subscribe(`/topic/typing/${roomId}`, (typingFrame) => {
                    try {
                        const event = JSON.parse(typingFrame.body);
                        if (event && event.sender && event.sender !== currentUser) {
                            setTypingUsers((prev) => {
                                const next = new Set(prev);
                                if (event.typing) {
                                    next.add(event.sender);
                                } else {
                                    next.delete(event.sender);
                                }
                                return next;
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing typing frame", e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("STOMP connection error", frame);
            },
        });

        client.activate();

        return () => {
            active = false;
            client.deactivate();
            setStompClient(null);
        };
    }, [roomId, connected, currentUser, soundEnabled]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (chatBox.current && !showScrollBottom) {
            chatBox.current.scrollTo({
                top: chatBox.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, showScrollBottom]);

    const handleScroll = () => {
        if (!chatBox.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatBox.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setShowScrollBottom(distanceFromBottom > 150);
    };

    const scrollToBottom = () => {
        if (chatBox.current) {
            chatBox.current.scrollTo({
                top: chatBox.current.scrollHeight,
                behavior: "smooth",
            });
            setShowScrollBottom(false);
        }
    };

    // Typing broadcast
    const sendTypingStatus = (typing) => {
        if (stompClient && connected && roomId) {
            try {
                stompClient.publish({
                    destination: `/app/typing/${roomId}`,
                    body: JSON.stringify({
                        sender: currentUser,
                        typing: typing,
                    }),
                });
            } catch {
                // ignore
            }
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            sendTypingStatus(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            sendTypingStatus(false);
        }, 1500);
    };

    // Send Message: Handles photo sending via REST + WebSocket broadcast, and text via WebSocket
    const sendMessage = async () => {
        const text = input.trim();
        if (!connected) {
            toast.error("Not connected to chat room");
            return;
        }

        if (!text && !attachedImage) return;

        // 1. Send image if attached
        if (attachedImage) {
            const imageToSend = attachedImage;
            setAttachedImage(null);
            setIsSendingImage(true);
            const toastId = toast.loading("Sending photo...");

            try {
                // Primary reliable path: REST endpoint with automatic WebSocket broadcast
                const savedMsg = await sendImageApi(roomId, currentUser, imageToSend);
                setMessages((prev) => {
                    const exists = prev.some(
                        (m) =>
                            m.sender === savedMsg.sender &&
                            m.content === savedMsg.content &&
                            m.timeStamp === savedMsg.timeStamp
                    );
                    if (exists) return prev;
                    return [...prev, savedMsg];
                });
                toast.success("Photo sent!", { id: toastId });
            } catch (err) {
                console.error("REST image upload failed, falling back to STOMP socket", err);
                // Fallback: send directly through STOMP WebSocket
                if (stompClient) {
                    stompClient.publish({
                        destination: `/app/sendMessage/${roomId}`,
                        body: JSON.stringify({
                            sender: currentUser,
                            content: imageToSend,
                            roomId: roomId,
                            messageType: "IMAGE",
                        }),
                    });
                    toast.success("Photo sent via socket!", { id: toastId });
                } else {
                    toast.error("Failed to send photo", { id: toastId });
                }
            } finally {
                setIsSendingImage(false);
                scrollToBottom();
            }
        }

        // 2. Send text if present
        if (text) {
            if (stompClient) {
                stompClient.publish({
                    destination: `/app/sendMessage/${roomId}`,
                    body: JSON.stringify({
                        sender: currentUser,
                        content: text,
                        roomId: roomId,
                        messageType: "CHAT",
                    }),
                });
                setInput("");
            } else {
                toast.error("WebSocket reconnecting, please wait...");
            }
        }

        if (isTypingRef.current) {
            isTypingRef.current = false;
            sendTypingStatus(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }

        setShowEmojiBar(false);
        scrollToBottom();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const copyRoomId = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(roomId);
            setCopied(true);
            toast.success("Room ID copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const toggleSound = () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        localStorage.setItem("chat_sound_enabled", String(nextState));
        toast.success(nextState ? "Sound notifications on" : "Sound muted", {
            duration: 1500,
        });
    };

    // Admin-only history deletion
    const isRoomAdmin = Boolean(
        roomAdmin && currentUser && roomAdmin.toLowerCase() === currentUser.toLowerCase()
    );

    const handleClearChat = async () => {
        if (!isRoomAdmin) {
            toast.error("Permission denied: Only the room creator can delete chat history.");
            return;
        }

        if (window.confirm("As Room Admin, do you want to delete all chat history for everyone?")) {
            try {
                await clearMessagesApi(roomId, currentUser);
                setMessages([]);
                toast.success("Room chat history deleted by admin");
            } catch (err) {
                toast.error(err.response?.data || "Failed to clear chat history");
            }
        }
    };

    // File selection with automatic client-side optimization
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file (PNG, JPG, WebP)");
            return;
        }

        try {
            setIsCompressingImage(true);
            const optimizedBase64 = await compressImage(file, 800, 0.7);
            setAttachedImage(optimizedBase64);
            toast.success("Photo attached! Click 'Send Photo' or press Enter.");
        } catch (err) {
            console.error("Compression error", err);
            toast.error("Could not process image");
        } finally {
            setIsCompressingImage(false);
            e.target.value = "";
        }
    };

    const addEmoji = (emoji) => {
        setInput((prev) => prev + emoji);
    };

    // Custom toast confirmation instead of window.confirm()
    const confirmLeave = () => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-2">
                        <span className="text-rose-400 text-lg leading-none mt-0.5">🚪</span>
                        <div>
                            <p className="font-semibold text-zinc-100 text-sm">Leave Room?</p>
                            <p className="text-zinc-400 text-xs mt-0.5">
                                You'll exit <span className="text-zinc-200 font-medium">#{roomId}</span> and return to the lobby.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors"
                        >
                            Stay
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                leaveRoom();
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors"
                        >
                            Leave Room
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 8000,
                position: "top-center",
                style: {
                    background: "#18181b",
                    color: "#f4f4f5",
                    border: "1px solid #3f3f46",
                    borderRadius: "14px",
                    padding: "14px",
                    minWidth: "280px",
                },
            }
        );
    };

    const confirmClearChat = () => {
        if (!isRoomAdmin) {
            toast.error("Permission denied: Only the room creator can delete chat history.");
            return;
        }
        toast(
            (t) => (
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-2">
                        <span className="text-amber-400 text-lg leading-none mt-0.5">⚠️</span>
                        <div>
                            <p className="font-semibold text-zinc-100 text-sm">Clear Chat History?</p>
                            <p className="text-zinc-400 text-xs mt-0.5">
                                This will permanently delete all messages in <span className="text-zinc-200 font-medium">#{roomId}</span> for everyone.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                try {
                                    await clearMessagesApi(roomId, currentUser);
                                    setMessages([]);
                                    toast.success("Room chat history deleted by admin");
                                } catch (err) {
                                    toast.error(err.response?.data || "Failed to clear chat history");
                                }
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-colors"
                        >
                            Delete All
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 8000,
                position: "top-center",
                style: {
                    background: "#18181b",
                    color: "#f4f4f5",
                    border: "1px solid #3f3f46",
                    borderRadius: "14px",
                    padding: "14px",
                    minWidth: "280px",
                },
            }
        );
    };

    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return messages;
        const q = searchQuery.toLowerCase();
        return messages.filter(
            (m) =>
                m.content?.toLowerCase().includes(q) ||
                m.sender?.toLowerCase().includes(q)
        );
    }, [messages, searchQuery]);

    const typingList = Array.from(typingUsers);
    const typingText =
        typingList.length === 1
            ? `${typingList[0]} is typing...`
            : typingList.length > 1
                ? `${typingList.slice(0, 2).join(", ")} are typing...`
                : null;

    return (
        <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-text overflow-hidden">
            {/* Top Navigation Header */}
            <header className="h-16 px-4 md:px-8 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
                {/* Left: Room Info */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-zinc-200">
                        <img className="h-10 w-10 object-cover backgroun-none" src={logo} alt="" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-semibold text-sm md:text-base text-zinc-100 tracking-tight">
                                {roomId}
                            </h1>
                            <button
                                type="button"
                                onClick={copyRoomId}
                                title="Copy Room ID"
                                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                {copied ? (
                                    <MdCheck className="text-emerald-400 text-sm" />
                                ) : (
                                    <MdOutlineContentCopy className="text-sm" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>@{currentUser}</span>
                            </span>
                            {roomAdmin && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    <MdShield className="text-xs" />
                                    <span>Admin: @{roomAdmin}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-1.5 md:gap-2">
                    {/* Search bar */}
                    {isSearching ? (
                        <div className="flex items-center bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 gap-1.5 text-xs animate-in fade-in duration-200">
                            <MdSearch className="text-zinc-400 text-sm shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 w-32 md:w-48 text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSearching(false);
                                    setSearchQuery("");
                                }}
                                className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                            >
                                <MdClose className="text-sm" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsSearching(true)}
                            title="Search in chat"
                            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                        >
                            <MdSearch className="text-lg" />
                        </button>
                    )}

                    {/* Sound toggle */}
                    <button
                        type="button"
                        onClick={toggleSound}
                        title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                    >
                        {soundEnabled ? (
                            <MdVolumeUp className="text-lg text-blue-400" />
                        ) : (
                            <MdVolumeOff className="text-lg" />
                        )}
                    </button>

                    {/* Clear chat history: ONLY VISIBLE TO THE ROOM ADMIN */}
                    {isRoomAdmin && (
                        <button
                            type="button"
                            onClick={confirmClearChat}
                            title="Admin: Delete all chat history"
                            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20 transition-all cursor-pointer"
                        >
                            <MdOutlineDeleteSweep className="text-base" />
                            <span className="hidden sm:inline font-medium">Clear History</span>
                        </button>
                    )}

                    {/* Leave room */}
                    <button
                        type="button"
                        onClick={confirmLeave}
                        title="Leave Room"
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 cursor-pointer transition-all ml-1"
                    >
                        <MdLogout className="text-sm" />
                        <span className="hidden md:inline font-medium">Leave</span>
                    </button>
                </div>
            </header>

            {/* Chat Body & Messages Viewport */}
            <main
                ref={chatBox}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative space-y-4 max-w-4xl w-full mx-auto"
            >
                {/* Empty State */}
                {filteredMessages.length === 0 && (
                    <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3 shadow-inner">
                            <MdOutlineChat className="text-2xl" />
                        </div>
                        <h3 className="text-base font-medium text-zinc-200">
                            {searchQuery ? "No matching messages" : `Welcome to #${roomId}`}
                        </h3>
                        <p className="text-xs text-zinc-500 max-w-xs mt-1">
                            {searchQuery
                                ? "Try searching for a different keyword or name."
                                : "Share this Room ID with others to start chatting in real time!"}
                        </p>
                        {!searchQuery && (
                            <button
                                type="button"
                                onClick={copyRoomId}
                                className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50 flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                                <MdOutlineContentCopy className="text-sm" />
                                Copy Room ID
                            </button>
                        )}
                    </div>
                )}

                {/* Message List */}
                {filteredMessages.map((msg, idx) => {
                    const isMe = msg.sender === currentUser;
                    const contentStr = typeof msg.content === "string" ? msg.content.trim() : "";
                    const isImage =
                        msg.messageType === "IMAGE" ||
                        contentStr.startsWith("data:image") ||
                        contentStr.startsWith("blob:") ||
                        /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(contentStr);

                    return (
                        <div
                            key={idx}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} group animate-in fade-in slide-in-from-bottom-1 duration-150`}
                        >
                            {/* Sender Info for other users */}
                            {!isMe && (
                                <div className="flex items-center gap-2 mb-1 ml-11">
                                    <span className="text-[11px] font-medium text-zinc-400">
                                        @{msg.sender}
                                    </span>
                                    {roomAdmin && msg.sender?.toLowerCase() === roomAdmin.toLowerCase() && (
                                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                                            Admin
                                        </span>
                                    )}
                                    <span className="text-[10px] text-zinc-600">
                                        {formatTime(msg.timeStamp)}
                                    </span>
                                </div>
                            )}

                            <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                {!isMe && (
                                    <img
                                        src={`https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(msg.sender || "user")}`}
                                        alt={msg.sender}
                                        className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 object-cover shrink-0 mb-0.5"
                                    />
                                )}

                                <div
                                    className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words transition-all ${isMe
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs"
                                        : "bg-zinc-900 border border-zinc-800/90 text-zinc-200 rounded-bl-xs"
                                        }`}
                                >
                                    {isImage ? (
                                        <div className="space-y-1">
                                            <img
                                                src={msg.content}
                                                alt="Shared attachment"
                                                onClick={() => setPreviewModalImage(msg.content)}
                                                className="max-h-80 max-w-full rounded-xl cursor-pointer hover:opacity-95 transition-opacity object-contain bg-black/40 border border-white/5"
                                            />
                                        </div>
                                    ) : (
                                        <p className="leading-relaxed whitespace-pre-wrap select-text">
                                            {msg.content}
                                        </p>
                                    )}

                                    {/* Footer timestamp for user's own messages */}
                                    {isMe && (
                                        <div className="text-[10px] text-blue-200/70 text-right mt-1 select-none flex items-center justify-end gap-1">
                                            <span>{formatTime(msg.timeStamp)}</span>
                                            <span>•</span>
                                            <span title={new Date(msg.timeStamp).toLocaleString()}>
                                                {timeAgo(msg.timeStamp)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Typing Indicator */}
            {typingText && (
                <div className="max-w-4xl w-full mx-auto px-4 md:px-8 py-1 flex items-center gap-2 text-xs text-zinc-400 select-none animate-in fade-in duration-200">
                    <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span className="italic">{typingText}</span>
                </div>
            )}

            {/* Scroll-to-Bottom Button */}
            {showScrollBottom && (
                <button
                    type="button"
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-8 p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl border border-blue-400/30 transition-all cursor-pointer z-30 animate-in fade-in zoom-in-90"
                    title="Scroll to bottom"
                >
                    <MdArrowDownward className="text-lg" />
                </button>
            )}

            {/* Bottom Message Composer */}
            <footer className="p-3 md:p-5 shrink-0 bg-zinc-950 border-t border-zinc-800/80 relative">
                <div className="max-w-4xl mx-auto flex flex-col gap-2 relative">
                    {/* Dynamic Categorized & Searchable Emoji Picker */}
                    {showEmojiBar && (
                        <div className="absolute bottom-16 left-0 sm:left-4 z-40">
                            <EmojiPicker
                                onSelectEmoji={(emoji) => addEmoji(emoji)}
                                onClose={() => setShowEmojiBar(false)}
                            />
                        </div>
                    )}

                    {/* Image Attachment Preview with Direct 1-Click Send Button */}
                    {attachedImage && (
                        <div className="relative inline-flex items-center gap-3 p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit animate-in fade-in slide-in-from-bottom-1">
                            <img
                                src={attachedImage}
                                alt="Attachment preview"
                                className="w-14 h-14 object-cover rounded-xl border border-zinc-700 shadow"
                            />
                            <div className="text-xs">
                                <p className="text-zinc-100 font-medium">Photo attached</p>
                                <p className="text-zinc-400 text-[11px]">Ready to transmit</p>
                            </div>
                            <button
                                type="button"
                                disabled={isSendingImage}
                                onClick={sendMessage}
                                className="ml-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
                            >
                                <MdUpload className="text-sm" />
                                <span>{isSendingImage ? "Sending..." : "Send Photo"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAttachedImage(null)}
                                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-full cursor-pointer ml-1"
                                title="Remove attachment"
                            >
                                <MdClose className="text-xs" />
                            </button>
                        </div>
                    )}

                    {/* Compressing indicator */}
                    {isCompressingImage && (
                        <div className="text-xs text-blue-400 flex items-center gap-2 px-1">
                            <span className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                            Optimizing photo for instant send...
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-3 py-2 shadow-inner focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Attach button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach an image"
                            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-xl cursor-pointer transition-colors"
                        >
                            <MdAttachFile className="text-xl" />
                        </button>

                        {/* Emoji toggle */}
                        <button
                            type="button"
                            onClick={() => setShowEmojiBar((prev) => !prev)}
                            title="Quick emoji reactions"
                            className={`p-2 rounded-xl cursor-pointer transition-colors ${showEmojiBar
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80"
                                }`}
                        >
                            <MdSentimentSatisfiedAlt className="text-xl" />
                        </button>

                        {/* Text input */}
                        <textarea
                            rows={1}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={attachedImage ? "Add an optional caption... (Press Enter to send)" : "Type a message... (Press Enter to send)"}
                            className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 text-sm resize-none py-1.5 px-2 max-h-32"
                        />

                        {/* Main Send button */}
                        <button
                            type="button"
                            onClick={sendMessage}
                            disabled={(!input.trim() && !attachedImage) || isCompressingImage || isSendingImage}
                            title="Send Message"
                            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
                        >
                            <MdSend className="text-lg" />
                        </button>
                    </div>
                </div>
            </footer>

            {/* Lightbox Modal for Full-Size Image */}
            {previewModalImage && (
                <div
                    onClick={() => setPreviewModalImage(null)}
                    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={previewModalImage}
                            alt="Full preview"
                            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewModalImage(null)}
                            className="absolute -top-3 -right-3 p-1.5 bg-zinc-800 text-zinc-200 rounded-full hover:bg-zinc-700 cursor-pointer"
                        >
                            <MdClose className="text-lg" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
