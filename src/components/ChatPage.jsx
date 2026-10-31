import { useState, useRef, useEffect } from "react";
import { MdSend, MdAttachFile } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { baseUrl } from "/src/config/AxiosHelper";
import toast from "react-hot-toast";
import { getMessages } from "../services/RoomService";
import { timeAgo } from "../config/helper";
const ChatPage = () => {

    const [messages, setMessages] = useState([
        {
            sender: "Vishal",
            content: "Hi",
        }
    ])

    const {
        roomId,
        currentUser,
        connected,
        setConnected,
        setRoomId,
        setCurrentUser,
    } = useChatContext();

    const navigate = useNavigate();

    // redirect to home if not connected
    useEffect(() => {
        if (!connected) {
            navigate("/");
        }
    }, [connected, navigate]);

    // const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatBox = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessages(roomId);
                setMessages(messages);
            } catch (error) {

            }
        }
        if (connected) {
            loadMessages();
        }
    }, [])

    // connect + subscribe (single effect, with cleanup)
    useEffect(() => {
        if (!connected || !roomId) return;

        let active = true; // ignore callbacks from a cleaned-up client

        const client = new Client({
            webSocketFactory: () => new SockJS(`${baseUrl}/chat`),
            reconnectDelay: 5000,
            onConnect: () => {
                if (!active) return;

                toast.success("Connected!");
                setStompClient(client);

                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => console.error("STOMP error", frame),
        });

        client.activate();

        return () => {
            active = false;
            client.deactivate();
            setStompClient(null);
        };
    }, [roomId, connected]);

    // auto-scroll to latest message
    useEffect(() => {
        if (chatBox.current) {
            chatBox.current.scrollTo({
                top: chatBox.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const sendMessage = () => {
        if (stompClient && connected && input.trim()) {
            stompClient.publish({
                destination: `/app/sendMessage/${roomId}`,
                body: JSON.stringify({
                    sender: currentUser,
                    content: input,
                    roomId: roomId,
                }),
            });
            setInput("");
        }
    };

    const handleLeave = () => {
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        // the redirect effect above navigates to "/"
    };

    return (
        <div className="">
            {/* header */}
            <header className="dark:border-gray-700 border-gray-500 dark:bg-gray-900 h-20 py-5 fixed w-full flex justify-between items-center">
                <div>
                    <h1 className="xl font-semibold">
                        Room: <span className="text-lg font-normal">{roomId}</span>
                    </h1>
                </div>

                <div>
                    <h1 className="2xl font-semibold">
                        Username: <span>{currentUser}</span>
                    </h1>
                </div>

                <div>
                    <button
                        onClick={handleLeave}
                        className="dark:bg-red-500 dark:hover:bg-red-700 py-1 px-3 my-2 cursor-pointer rounded-full"
                    >
                        Leave Room
                    </button>
                </div>
            </header>

            {/* messages */}
            <main
                ref={chatBox}
                className="py-20 px-10 w-2/3 dark:bg-slate-800 mx-auto pt-24 h-screen overflow-auto"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`my-2 ${message.sender === currentUser ? "bg-green-500" : "bg-gray-500"
                                } p-2 rounded max-w-xs`}
                        >
                            <div className="flex flex-row w-fit rounded-lg px-2 py-1 gap-2">
                                <img
                                    className="w-10 h-10 rounded-full"
                                    src={`https://api.dicebear.com/10.x/lorelei/svg?seed=${message.sender}`}
                                    alt=""
                                />
                                <div>
                                    <p className="font-bold">{message.sender}</p>
                                    <p>{message.content}</p>
                                    <p className="test-sm text-gray-300">{timeAgo(message.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* footer */}
            <div className="fixed bottom-2 w-full h-15">
                <div className="h-full gap-4 flex items-center justify-between rounded-lg w-200 mx-auto dark:bg-gray-900">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        type="text"
                        placeholder="Type your message"
                        className="h-full w-full focus:border rounded-lg outline-none px-3 py-2"
                    />

                    <div className="flex gap-4">
                        <button className="dark:bg-purple-500 py-4 w-14 rounded-full cursor-pointer hover:dark:bg-purple-800 flex justify-center items-center">
                            <MdAttachFile />
                        </button>
                        <button
                            onClick={sendMessage}
                            className="dark:bg-green-600 py-4 w-14 rounded-full cursor-pointer hover:dark:bg-green-800 flex justify-center items-center"
                        >
                            <MdSend />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;