import axios from "axios";
import Cookies from "js-cookie";
const URL = "http://localhost:5000/api";
const getToken = () => {
  return Cookies.get("token");
};
export const getAllUserChats = async () => {
  try {
    const response = await axios.get(`${URL}/chats`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user chats:", error);
    throw error;
  }
};

export const getOneToOneChat = async (userId) => {
  try {
    const response = await axios.post(
      `${URL}/chats`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching one-to-one chat:", error);
    throw error;
  }
};

export const sendNewMessage = async (content, chatId) => {
  try {
    const response = await axios.post(
      `${URL}/messages`,
      { content, chatId },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending new message:", error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const response = await axios.get(`${URL}/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};
export const markMessageAsRead = async (chatId) => {
  try {
    const response = await axios.put(
      `${URL}/chats/mark-read/${chatId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};
