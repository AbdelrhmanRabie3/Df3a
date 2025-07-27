import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { AuthContext } from "./AuthContextProvider";
import { SocketContext } from "./SocketContext";
import { getAllUserChats, markMessageAsRead } from "../services/chatServices";

export const ChatContext = createContext();

const ChatContextProvider = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { socket, socketConnected } = useContext(SocketContext);
  const [currentChat, setCurrentChat] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const currentChatRef = useRef(currentChat);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  const refreshChats = async () => {
    if (!user) return;

    setChatsLoading(true);
    try {
      const data = await getAllUserChats();
      console.log("Refreshed chats:", data);
      setChats(data);
      setInitialized(true);
    } catch (error) {
      console.error("Failed to refresh chats:", error);
      setChats([]);
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && user._id) {
      refreshChats();
    } else if (!authLoading && !user) {
      setChats([]);
      setInitialized(true);
    }
  }, [user, authLoading]);


  useEffect(() => {
    if (!socket || !user || !socketConnected || !initialized) {
      console.log("Not ready for socket listeners:", {
        socket: !!socket,
        user: !!user,
        socketConnected,
        initialized,
      });
      return;
    }

    console.log("Setting up socket listeners in ChatContext");

    
    console.log("Setting up socket listeners in ChatContext");

    const handleNotification = (data) => {
      console.log("Notification received in ChatContext:", data);

     
      setNotification((prev) => [...prev, data.message]);


      setChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex(
          (chat) => chat._id === data.chat._id
        );

        if (existingChatIndex !== -1) {
          
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            latestMessage: {
              ...data.message,
              readBy: data.message.sender._id === user._id ? [user._id] : [],
            },
            updatedAt: new Date().toISOString(),
          };

          const [updatedChat] = updatedChats.splice(existingChatIndex, 1);
          return [updatedChat, ...updatedChats];
        } else {

          const newChat = {
            _id: data.chat._id,
            chatName: data.chat.chatName,
            isGroupChat: data.chat.isGroupChat,
            users: data.chat.users,
            latestMessage: {
              ...data.message,
              readBy: data.message.sender._id === user._id ? [user._id] : [],
            },
            createdAt: data.chat.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [newChat, ...prevChats];
        }
      });
    };

    const handleMessageReceived = (newMessageReceived) => {
      console.log("Message received in ChatContext:", newMessageReceived);
      console.log("Current chat:", currentChatRef.current);


      const isCurrentChat =
        currentChatRef.current &&
        currentChatRef.current._id === newMessageReceived.chat._id;


      if (newMessageReceived.sender._id !== user._id && !isCurrentChat) {
        console.log("Adding notification for message from different chat");
        setNotification((prev) => [...prev, newMessageReceived]);
      }

      setChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex(
          (chat) => chat._id === newMessageReceived.chat._id
        );

        if (existingChatIndex !== -1) {
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            latestMessage: {
              ...newMessageReceived,
              readBy:
                newMessageReceived.sender._id === user._id
                  ? [user._id]
                  : isCurrentChat
                  ? [user._id]
                  : [],
            },
            updatedAt: new Date().toISOString(),
          };


          const [updatedChat] = updatedChats.splice(existingChatIndex, 1);
          return [updatedChat, ...updatedChats];
        }

        return prevChats;
      });
    };


    socket.on("notification", handleNotification);
    socket.on("message received", handleMessageReceived);


    return () => {
      console.log("Cleaning up socket listeners in ChatContext");
      socket.off("notification", handleNotification);
      socket.off("message received", handleMessageReceived);
    };
  }, [socket, user]); 

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
    return !chat.latestMessage.readBy?.includes(user._id);
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
                readBy: [
                  ...new Set([...(chat.latestMessage.readBy || []), user._id]),
                ],
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
        refreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContextProvider;
