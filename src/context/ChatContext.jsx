import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    // Authenticated user session
    const [authUser, setAuthUser] = useState(() => {
        try {
            const saved = localStorage.getItem("chat_auth_user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Active room & chat session
    const [roomId, setRoomId] = useState(() => {
        return sessionStorage.getItem("chat_roomId") || "";
    });
    const [roomAdmin, setRoomAdmin] = useState(() => {
        return sessionStorage.getItem("chat_roomAdmin") || "";
    });
    const [currentUser, setCurrentUser] = useState(() => {
        const auth = localStorage.getItem("chat_auth_user");
        if (auth) {
            try {
                return JSON.parse(auth).username || "";
            } catch {
                // ignore
            }
        }
        return sessionStorage.getItem("chat_currentUser") || "";
    });
    const [connected, setConnected] = useState(() => {
        return sessionStorage.getItem("chat_connected") === "true";
    });

    useEffect(() => {
        if (authUser) {
            localStorage.setItem("chat_auth_user", JSON.stringify(authUser));
            setCurrentUser(authUser.username);
        } else {
            localStorage.removeItem("chat_auth_user");
        }
    }, [authUser]);

    useEffect(() => {
        if (roomId) {
            sessionStorage.setItem("chat_roomId", roomId);
        } else {
            sessionStorage.removeItem("chat_roomId");
        }
    }, [roomId]);

    useEffect(() => {
        if (roomAdmin) {
            sessionStorage.setItem("chat_roomAdmin", roomAdmin);
        } else {
            sessionStorage.removeItem("chat_roomAdmin");
        }
    }, [roomAdmin]);

    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem("chat_currentUser", currentUser);
        } else {
            sessionStorage.removeItem("chat_currentUser");
        }
    }, [currentUser]);

    useEffect(() => {
        sessionStorage.setItem("chat_connected", connected ? "true" : "false");
    }, [connected]);

    const loginUser = (userObj) => {
        setAuthUser(userObj);
        setCurrentUser(userObj.username);
    };

    const logoutUser = () => {
        setAuthUser(null);
        setCurrentUser("");
        setRoomId("");
        setRoomAdmin("");
        setConnected(false);
        localStorage.removeItem("chat_auth_user");
        sessionStorage.clear();
    };

    const leaveRoom = () => {
        setRoomId("");
        setRoomAdmin("");
        setConnected(false);
        sessionStorage.removeItem("chat_roomId");
        sessionStorage.removeItem("chat_roomAdmin");
        sessionStorage.removeItem("chat_connected");
    };

    return (
        <ChatContext.Provider
            value={{
                authUser,
                loginUser,
                logoutUser,
                roomId,
                setRoomId,
                roomAdmin,
                setRoomAdmin,
                currentUser,
                setCurrentUser,
                connected,
                setConnected,
                leaveRoom,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

const useChatContext = () => useContext(ChatContext);

export default useChatContext;
