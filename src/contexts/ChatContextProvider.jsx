import React, { createContext, useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContextProvider";
import { getAllUserChats, markMessageAsRead } from "../services/chatServices"; // Add the import

export const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [currentChat, setCurrentChat] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);

  const refreshChats = async () => {
    if (!user) return;

    setChatsLoading(true);
    try {
      const data = await getAllUserChats();
      console.log("Refreshed chats:", data);
      setChats(data);
    } catch (error) {
      console.error("Failed to refresh chats:", error);
      setChats([]);
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      refreshChats();
    } else {
      setChats([]);
    }
  }, [user]);
  const addNotification = (newMessage) => {
    setNotification((prev) => [...prev, newMessage]);
  };

  const clearNotificationsForChat = (chatId) => {
    setNotification((prev) =>
      prev.filter((notif) => notif.chat._id !== chatId)
    );
  };

  const clearAllNotifications = () => {
    setNotification([]);
  };

  const hasUnreadMessages = (chat) => {
    if (!chat.latestMessage || !user?._id) return false;

    if (chat.latestMessage.sender._id === user._id) return false;

    return !chat.latestMessage.readBy.includes(user._id);
  };

  const getTotalUnreadCount = () => {
    return chats.filter((chat) => hasUnreadMessages(chat)).length;
  };

  const getUnreadStatusForChat = (chatId) => {
    const chat = chats.find((chat) => chat._id === chatId);
    return chat ? hasUnreadMessages(chat) : false;
  };

  const markChatAsRead = async (chatId) => {
    try {
      await markMessageAsRead(chatId);

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (
            chat._id === chatId &&
            chat.latestMessage &&
            chat.latestMessage.sender._id !== user._id
          ) {
            return {
              ...chat,
              latestMessage: {
                ...chat.latestMessage,
                readBy: [...new Set([...chat.latestMessage.readBy, user._id])],
              },
            };
          }
          return chat;
        })
      );

      console.log(`Chat ${chatId} marked as read`);
    } catch (error) {
      console.error("Failed to mark chat as read:", error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        notification,
        setNotification,
        chats,
        setChats,
        chatsLoading,
        addNotification,
        clearNotificationsForChat,
        clearAllNotifications,
        getTotalUnreadCount,
        getUnreadStatusForChat,
        hasUnreadMessages,
        markChatAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
