import React, { useState } from "react";
import chat2 from "../assets/chat2.png";
import toast from 'react-hot-toast';
import { createRoomApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { joinChatApi } from "../services/RoomService";

const JoinCreateChat = () => {

    const [detail, setDetail] = useState({
        roomId: "",
        userName: ""
    });

    const {
        roomId,
        currentUser,
        setRoomId,
        setCurrentUser,
        setConnected
    } = useChatContext();

    const navigate = useNavigate();

    function handleFormInputChange(event) {
        setDetail({
            ...detail,
            [event.target.name]: event.target.value
        });
    }

    async function joinChat() {
        if (validateForm()) {
            console.log(detail);

            try {
                const room = await joinChatApi(detail.roomId);
                toast.success("Joined!!");
                setCurrentUser(detail.userName);
                setRoomId(room.roomId);
                setConnected(true);

                navigate("/chat")
            } catch (error) {
                if (error.status === 400) {
                    toast.error(error.response.data);
                } else {
                    toast.error("Error in joining!");
                }
                console.log(error);
            }
        }

    }

    async function createRoom() {
        if (validateForm()) {
            console.log(detail)
        }
        try {
            const response = await createRoomApi(detail.roomId)
            console.log(response);
            toast.success("Room created successfully!!")
            //join the room
            setCurrentUser(detail.userName);
            setRoomId(response.roomId);
            setConnected(true);

            navigate("/chat")

        } catch (error) {
            console.log(error);
            if (error.status === 400) {
                toast.error("Room already exists!")
            } else {
                toast.error("Something went wrong")
            }
        }
    }

    function validateForm() {
        if (detail.roomId === "" || detail.userName === "") {
            toast.error("Invalid Username or Room Id!");
            return false;
        }
        return true;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 w-full max-w-md flex flex-col gap-8 rounded dark:bg-gray-800 shadow-lg">

                <div>
                    <img src={chat2} className="mx-auto mb-2" width={100} height={100} alt="" />
                </div>

                <h1 className="text-2xl font-bold text-center">Join Room / Create Room ..</h1>
                {/* Name div */}
                <div className="">
                    <label htmlFor="name" className="block font-medium mb-2">Your Name</label>
                    <input
                        onChange={handleFormInputChange}
                        value={detail.userName}
                        type="text"
                        id="name"
                        name="userName"
                        placeholder="Enter your name"
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>


                {/* room id div */}
                <div className="">
                    <label htmlFor="name" className="block font-medium mb-2">Room ID/Create New Room</label>
                    <input
                        onChange={handleFormInputChange}
                        value={detail.roomId}
                        type="text"
                        id="roomId"
                        name="roomId"
                        placeholder="Enter roomId"
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* buttons */}
                <div className="flex gap-4 ">
                    <button onClick={joinChat} className="px-3 py-2 dark:bg-blue-500 hover:bg-blue-500 cursor-pointer hover:dark:bg-blue-800 rounded">Join Room</button>
                    <button onClick={createRoom} className="px-3 py-2 dark:bg-orange-500 hover:bg-blue-500 cursor-pointer hover:dark:bg-orange-800 rounded">Create Room</button>
                </div>
            </div>
        </div>
    )
}

export default JoinCreateChat