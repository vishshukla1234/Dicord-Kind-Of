import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    createRoomApi,
    joinChatApi,
    signupApi,
    signinApi,
} from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import {
    MdChatBubbleOutline,
    MdPersonOutline,
    MdMailOutline,
    MdLockOutline,
    MdTag,
    MdAutoAwesome,
    MdArrowForward,
    MdAdd,
    MdHistory,
    MdLogout,
    MdLogin,
    MdPersonAdd,
    MdShield,
} from "react-icons/md";

const RANDOM_ROOM_PRESETS = [
    "dev-hangout",
    "design-sync",
    "coffee-lounge",
    "cyber-den",
    "general-hub",
    "brainstorm-lab",
];

const JoinCreateChat = () => {
    const {
        authUser,
        loginUser,
        logoutUser,
        setRoomId,
        setRoomAdmin,
        setCurrentUser,
        setConnected,
    } = useChatContext();

    const navigate = useNavigate();

    // Mode states:
    // When NOT logged in: "signin" | "signup"
    // When logged in: "join" | "create"
    const [authMode, setAuthMode] = useState("signin");
    const [roomMode, setRoomMode] = useState("join");

    // Auth Form State
    const [authForm, setAuthForm] = useState({
        username: "",
        email: "",
        password: "",
        identifier: "", // username or email for signin
    });

    // Room Form State
    const [roomIdInput, setRoomIdInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [recentRooms, setRecentRooms] = useState([]);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("recent_rooms") || "[]");
            setRecentRooms(saved);
        } catch {
            setRecentRooms([]);
        }
    }, []);

    const saveRecentRoom = (roomName) => {
        try {
            const trimmed = roomName.trim();
            if (!trimmed) return;
            const updated = [trimmed, ...recentRooms.filter((r) => r !== trimmed)].slice(0, 4);
            setRecentRooms(updated);
            localStorage.setItem("recent_rooms", JSON.stringify(updated));
        } catch {
            // ignore
        }
    };

    // Auth Handlers
    const handleAuthInputChange = (e) => {
        setAuthForm({
            ...authForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSignup = async (e) => {
        e?.preventDefault();
        if (!authForm.username.trim() || !authForm.email.trim() || !authForm.password.trim()) {
            toast.error("Please fill in all signup fields");
            return;
        }
        if (authForm.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await signupApi({
                username: authForm.username.trim(),
                email: authForm.email.trim().toLowerCase(),
                password: authForm.password,
            });
            toast.success("Account created successfully!");
            loginUser({ username: res.username, email: res.email });
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSignin = async (e) => {
        e?.preventDefault();
        const ident = authForm.identifier.trim() || authForm.username.trim();
        if (!ident || !authForm.password.trim()) {
            toast.error("Please enter username/email and password");
            return;
        }

        setLoading(true);
        try {
            const res = await signinApi({
                usernameOrEmail: ident,
                password: authForm.password,
            });
            toast.success("Signed in successfully!");
            loginUser({ username: res.username, email: res.email });
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    // Room Handlers
    function generateRandomRoom() {
        const randomName =
            RANDOM_ROOM_PRESETS[Math.floor(Math.random() * RANDOM_ROOM_PRESETS.length)] +
            "-" +
            Math.floor(100 + Math.random() * 900);
        setRoomIdInput(randomName);
        toast.success("Generated room name!");
    }

    async function handleJoinRoom() {
        const cleanRoom = roomIdInput.trim();
        if (!cleanRoom) {
            toast.error("Please enter a room ID");
            return;
        }

        setLoading(true);
        try {
            const roomData = await joinChatApi(cleanRoom);
            saveRecentRoom(cleanRoom);
            toast.success("Joined room!");

            setRoomId(cleanRoom);
            setRoomAdmin(roomData.admin || "");
            setCurrentUser(authUser.username);
            setConnected(true);
            navigate("/chat");
        } catch (error) {
            if (error.status === 400) {
                toast.error(error.response?.data || "Room does not exist!");
            } else {
                toast.error("Failed to connect to room server");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateRoom() {
        const cleanRoom = roomIdInput.trim();
        if (!cleanRoom) {
            toast.error("Please enter a room ID");
            return;
        }

        setLoading(true);
        try {
            const createdRoom = await createRoomApi(cleanRoom, authUser.username);
            saveRecentRoom(cleanRoom);
            toast.success("Room created successfully!");

            setRoomId(cleanRoom);
            setRoomAdmin(authUser.username);
            setCurrentUser(authUser.username);
            setConnected(true);
            navigate("/chat");
        } catch (error) {
            if (error.status === 400) {
                toast.error(error.response?.data || "Room already exists! You can join it instead.");
            } else {
                toast.error("Unable to create room. Please check backend connection.");
            }
        } finally {
            setLoading(false);
        }
    }

    const currentSeed = authUser?.username || authForm.username || "Guest";

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Ambient decorative glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl rounded-3xl p-7 shadow-2xl transition-all">
                {/* Header Branding */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20">
                            <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                                <img
                                    src={`https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(currentSeed)}`}
                                    alt="Avatar preview"
                                    className="w-12 h-12 rounded-full object-cover transition-transform duration-300 transform hover:scale-110"
                                />
                            </div>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                    </div>

                    <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                        Realtime Chat
                    </h1>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        {authUser ? `Welcome back, @${authUser.username}` : "Minimalist STOMP WebSocket Messaging"}
                    </p>
                </div>

                {/* VIEW 1: SIGN IN / SIGN UP (when user is not authenticated) */}
                {!authUser ? (
                    <div>
                        {/* Auth Mode Switcher */}
                        <div className="flex p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/80 mb-5">
                            <button
                                type="button"
                                onClick={() => setAuthMode("signin")}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    authMode === "signin"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <MdLogin className="text-sm" /> Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setAuthMode("signup")}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    authMode === "signup"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <MdPersonAdd className="text-sm" /> Create Account
                            </button>
                        </div>

                        {/* Sign In Form */}
                        {authMode === "signin" ? (
                            <form onSubmit={handleSignin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">
                                        Username or Email
                                    </label>
                                    <div className="relative">
                                        <MdPersonOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                                        <input
                                            name="identifier"
                                            type="text"
                                            value={authForm.identifier}
                                            onChange={handleAuthInputChange}
                                            placeholder="Enter username or email"
                                            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                                        <input
                                            name="password"
                                            type="password"
                                            value={authForm.password}
                                            onChange={handleAuthInputChange}
                                            placeholder="Enter your password"
                                            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <MdArrowForward className="text-base" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            /* Sign Up Form */
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <MdPersonOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                                        <input
                                            name="username"
                                            type="text"
                                            value={authForm.username}
                                            onChange={handleAuthInputChange}
                                            placeholder="e.g. alex_dev"
                                            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <MdMailOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={authForm.email}
                                            onChange={handleAuthInputChange}
                                            placeholder="name@example.com"
                                            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">
                                        Password (6+ chars)
                                    </label>
                                    <div className="relative">
                                        <MdLockOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                                        <input
                                            name="password"
                                            type="password"
                                            value={authForm.password}
                                            onChange={handleAuthInputChange}
                                            placeholder="Create a strong password"
                                            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Create Free Account</span>
                                            <MdPersonAdd className="text-base" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    /* VIEW 2: LOGGED IN — ROOM JOIN / CREATE */
                    <div>
                        {/* Profile Chip */}
                        <div className="flex items-center justify-between p-2.5 mb-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={`https://api.dicebear.com/10.x/lorelei/svg?seed=${encodeURIComponent(authUser.username)}`}
                                    alt="User avatar"
                                    className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700/60 object-cover"
                                />
                                <div>
                                    <p className="text-xs font-semibold text-zinc-200">
                                        @{authUser.username}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                                        {authUser.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={logoutUser}
                                title="Sign out"
                                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <MdLogout className="text-sm" />
                                <span>Sign Out</span>
                            </button>
                        </div>

                        {/* Room Mode Switcher */}
                        <div className="flex p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/80 mb-5">
                            <button
                                type="button"
                                onClick={() => setRoomMode("join")}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    roomMode === "join"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <MdArrowForward className="text-sm" /> Join Room
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoomMode("create")}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    roomMode === "create"
                                        ? "bg-zinc-800 text-white shadow-sm"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                <MdAdd className="text-sm" /> Create Room
                            </button>
                        </div>

                        {/* Room Input */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                    <label className="text-xs font-medium text-zinc-400">
                                        Room ID
                                    </label>
                                    {roomMode === "create" && (
                                        <button
                                            type="button"
                                            onClick={generateRandomRoom}
                                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            <MdAutoAwesome className="text-xs" /> Randomize
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <MdTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg pointer-events-none" />
                                    <input
                                        type="text"
                                        maxLength={40}
                                        value={roomIdInput}
                                        onChange={(e) => setRoomIdInput(e.target.value)}
                                        placeholder={
                                            roomMode === "join"
                                                ? "Enter room ID to join"
                                                : "Enter new room ID (you'll be admin)"
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                roomMode === "join"
                                                    ? handleJoinRoom()
                                                    : handleCreateRoom();
                                            }
                                        }}
                                        className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Recent rooms list */}
                            {recentRooms.length > 0 && (
                                <div className="pt-1">
                                    <p className="text-[11px] text-zinc-500 mb-1.5 flex items-center gap-1">
                                        <MdHistory className="text-xs" /> Recent channels:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recentRooms.map((room) => (
                                            <button
                                                key={room}
                                                type="button"
                                                onClick={() => setRoomIdInput(room)}
                                                className="text-xs bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/40 cursor-pointer transition-colors"
                                            >
                                                #{room}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                type="button"
                                disabled={loading}
                                onClick={roomMode === "join" ? handleJoinRoom : handleCreateRoom}
                                className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                            >
                                {loading ? (
                                    <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : roomMode === "join" ? (
                                    <>
                                        <span>Enter Room</span>
                                        <MdArrowForward className="text-base" />
                                    </>
                                ) : (
                                    <>
                                        <span>Create & Become Admin</span>
                                        <MdShield className="text-base text-amber-300" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer security note */}
                <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center">
                    <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                        <MdChatBubbleOutline className="text-zinc-400" />
                        Admin-controlled channels & WebSocket encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;
