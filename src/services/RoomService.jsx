import { httpClient } from "../config/AxiosHelper";

export const createRoomApi = async (roomId, admin) => {
    const response = await httpClient.post(`/api/v1/rooms`, {
        roomId: roomId.trim(),
        admin: admin ? admin.trim() : "Admin",
    });
    return response.data;
};

export const joinChatApi = async (roomId) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
    return response.data;
};

export const getMessages = async (roomId, size = 100, page = 0) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`);
    return response.data;
};

export const clearMessagesApi = async (roomId, user) => {
    const response = await httpClient.delete(`/api/v1/rooms/${roomId}/messages?user=${encodeURIComponent(user)}`);
    return response.data;
};

export const sendImageApi = async (roomId, sender, base64Content) => {
    const response = await httpClient.post(`/api/v1/rooms/${roomId}/image`, {
        roomId,
        sender,
        content: base64Content,
        messageType: "IMAGE",
    });
    return response.data;
};

export const signupApi = async (userData) => {
    const response = await httpClient.post(`/api/v1/auth/signup`, userData);
    return response.data;
};

export const signinApi = async (credentials) => {
    const response = await httpClient.post(`/api/v1/auth/signin`, credentials);
    return response.data;
};
