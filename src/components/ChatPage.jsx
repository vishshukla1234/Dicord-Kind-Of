import { useState, useRef, useEffect } from "react";
import { MdSend, MdAttachFile } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { baseUrl } from "/src/config/AxiosHelper";
import toast from "react-hot-toast";

const ChatPage = () => {

    const { roomId, currentUser, connected } = useChatContext();
    // console.log(roomId);
    // console.log(currentUser);
    // console.log(connected);

    const navigate = useNavigate()
    useEffect(() => {
        if (!connected) {
            navigate('/')
        }
    }, [connected, roomId, currentUser])


    const [messages, setMessages] = useState([
        {
            sender: 'vish',
            content: 'Hello?',
        },
        {
            sender: 'vish',
            content: 'Hello?',
        },
        {
            sender: 'vish',
            content: 'Hello?',
        },
        {
            sender: 'vish',
            content: 'Hello?',
        },
        {
            sender: 'vish',
            content: 'Hello?',
        },
        {
            sender: 'Vishal',
            content: 'Hello?',
        }
    ]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBox = useRef(null);
    const [stompClient, setStomClient] = useState(null);

    //page init:
    //load messages
    //initialize stompclient
    //subscribe
    useEffect(() => {

        const connectWebSocket = () => {
            //SockJS
            const sock = new SockJS(`${baseUrl}/chat`);
            const client = Stomp.over(sock);

            toast.success("Connected!");

            client.connect({}, () => {
                setStomClient(client);
                client.subscribe(`topic/room/${roomId}`, (message) => {
                    console.log(message);
                    const newMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMessage]);
                });
            });
        };

        if (connected) {
            connectWebSocket();
        }

    }, [roomId])

    //send messages handle

    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            console.log(input);

            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
            };

            stompClient.send(
                `/app/sendMessage/${roomId}`,
                {},
                JSON.stringify(message));
            setInput("");
        }
    }

    return (
        <div className="">
            {/* header portion */}
            <header className="dark:border-gray-700 border-gray-500 dark:bg-gray-900 h-20 py-5 fixed w-full flex justify-between items-center">
                {/* room naem */}
                <div className="">
                    <h1 className="xl font-semibold">
                        Room:<span className="text-lg font-normal">
                            Family Room
                        </span>
                    </h1>
                </div>

                {/* username */}
                <div>
                    <h1 className="2xl font-semibold">Username: <span>Vishal</span></h1>
                </div>

                {/* button */}
                <div>
                    <button className=" dark:bg-red-500 dark:hover:bg-red-700 py-1 px-3 my-2 cursor-pointer rounded-full">Leave Room</button>
                </div>
            </header>

            <main className="py-20 px-10 w-2/3 dark:bg-slate-800 mx-auto pt-24 h-screen overflow-auto">
                {
                    messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`my-2 ${message.sender === currentUser ? 'bg-green-500' : 'bg-gray-500'} p-2 rounded max-w-xs`}>
                                <div className="flex flex-row w-fit rounded-lg px-2 py-1">
                                    <img className="w-10 h-10 rounded-full" src={"https://api.dicebear.com/10.x/lorelei/svg?seed=Felix"} alt="" />
                                    <p className="font-bold">{message.sender}</p>
                                    <p className="">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </main >

            {/* footer/message container */}
            < div className="fixed bottom-2 w-full h-15" >
                <div className="h-full gap-4 flex items-center justify-between rounded-lg w-200 mx-auto dark:bg-gray-900">
                    <input calue={input}
                        onChange={(e) => {
                            setInput(e.target.value)
                        }}
                        type="text" placeholder="Type your message" className="h-full w-full focus:border rounded-lg outline-none px-3 py-2" />

                    <div className="flex gap-4">
                        <button className="dark:bg-purple-500 py-4 w-14 rounded-full cursor-pointer hover:dark:bg-purple-800 flex justify-center items-center">
                            <MdAttachFile />
                        </button>
                        <button onClick={sendMessage} className="dark:bg-green-600 py-4 w-14 rounded-full cursor-pointer hover:dark:bg-green-800 flex justify-center items-center">
                            <MdSend />
                        </button>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default ChatPage