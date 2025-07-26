import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { sendNewMessage, getChatMessages } from "../../services/chatServices";
import EmptyChat from "./EmptyChat";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ChatSidebar from "./ChatSideBar";
import NavBar from "./../../components/NavBar/NavBar";
import { ChatContext } from "../../contexts/ChatContextProvider";
import { io } from "socket.io-client";

const URL = "http://localhost:5000";
let socket, selectedChatCompare;

function Chat() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const {
    currentChat,
    setCurrentChat,
    chats,
    setChats,
    chatsLoading,
    addNotification,
    clearNotificationsForChat,
    getUnreadStatusForChat,
    markChatAsRead,
  } = useContext(ChatContext);

  useEffect(() => {
    if (user?._id) {
      socket = io(URL);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    selectedChatCompare = currentChat;
    setLoading(false);
  }, [currentChat]);

  // Handle socket events
  useEffect(() => {
    if (socket) {
      const handleMessageReceived = (newMessageReceived) => {
        const chatId = newMessageReceived.chat._id;

        if (!selectedChatCompare || selectedChatCompare._id !== chatId) {
          console.log("New message in different chat:", newMessageReceived);

          if (newMessageReceived.sender._id !== user._id) {
            addNotification(newMessageReceived);
          }

          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat._id === chatId
                ? {
                    ...chat,
                    latestMessage: {
                      ...newMessageReceived,
                      readBy:
                        newMessageReceived.sender._id === user._id
                          ? [user._id]
                          : [],
                    },
                  }
                : chat
            )
          );
        } else {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);

          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat._id === chatId
                ? {
                    ...chat,
                    latestMessage: {
                      ...newMessageReceived,
                      readBy: [user._id],
                    },
                  }
                : chat
            )
          );
        }
      };

      // Handle typing events
      const handleTyping = (data) => {
        if (data.user._id !== user._id) {
          setIsTyping(true);
          setTypingUser(data.userName);
        }
      };

      const handleStopTyping = (data) => {
        if (data.user._id !== user._id) {
          setIsTyping(false);
          setTypingUser("");
        }
      };

      socket.on("message received", handleMessageReceived);
      socket.on("typing", handleTyping);
      socket.on("stop typing", handleStopTyping);

      return () => {
        socket.off("message received", handleMessageReceived);
        socket.off("typing", handleTyping);
        socket.off("stop typing", handleStopTyping);
      };
    }
  }, [socket, selectedChatCompare, addNotification, setChats, user?._id]);

  const handleChatSelect = async (chat) => {
    setCurrentChat(chat);
    setSidebarOpen(false);
    setIsTyping(false);
    setTypingUser("");
    clearNotificationsForChat(chat._id);

    if (getUnreadStatusForChat(chat._id)) {
      await markChatAsRead(chat._id);
    }

    try {
      const data = await getChatMessages(chat._id);
      console.log("Fetched messages:", data);
      setMessages(data);

      if (socket) {
        socket.emit("join chat", chat._id);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === "" || !currentChat) return;
    if (socket && currentChat) {
      socket.emit("stop typing", {
        room: currentChat._id,
        user: user,
        userName: user.name || user.username,
      });
    }
    try {
      const res = await sendNewMessage(newMessage, currentChat._id);
      console.log("Message sent:", res);

      if (socket) {
        socket.emit("new message", res);
      }

      setNewMessage("");
      setMessages((prevMessages) => [...prevMessages, res]);

      const existingChat = chats.find((chat) => chat._id === currentChat._id);

      if (!existingChat) {
        const newChatForList = {
          _id: currentChat._id,
          chatName: currentChat.chatName,
          isGroupChat: currentChat.isGroupChat,
          users: currentChat.users,
          latestMessage: {
            ...res,
            readBy: [user._id],
          },
          createdAt: currentChat.createdAt,
          updatedAt: new Date().toISOString(),
        };

        setChats((prevChats) => [newChatForList, ...prevChats]);
      } else {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === currentChat._id
              ? {
                  ...chat,
                  latestMessage: {
                    ...res,
                    readBy: [user._id],
                  },
                  updatedAt: new Date().toISOString(),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const getOtherUser = (chat) => {
    return chat?.users?.find((u) => u._id !== user?._id) || {};
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now - messageDate;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString();
  };
  // Emit typing events
  const handleTyping = () => {
    if (socket && currentChat) {
      socket.emit("typing", currentChat._id);
    }
  };

  const handleStopTyping = () => {
    if (socket && currentChat) {
      socket.emit("stop typing", currentChat._id);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handleMessageReceived = (newMessageReceived) => {
      if (!currentChat || currentChat._id !== newMessageReceived.chat._id) {
        // Show notification or update UI for new message in different chat
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };
    const handleTypingEvent = () => {
      setIsTyping(true);
    };
    const handleStopTypingEvent = () => {
      setIsTyping(false);
    };
    socket.on("message received", handleMessageReceived);
    socket.on("typing", handleTypingEvent);
    socket.on("stop typing", handleStopTypingEvent);
    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("typing", handleTypingEvent);
      socket.off("stop typing", handleStopTypingEvent);
    };
  }, [currentChat]);

  return (
    <>
      <NavBar />
      <div className="pt-20 pb-8 px-4 md:px-8 min-h-screen bg-background">
        <div className="flex h-[calc(100vh-120px)] antialiased text-primary bg-surface rounded-lg shadow-default overflow-hidden">
          <div
            className={`md:block ${
              sidebarOpen ? "block" : "hidden"
            } fixed md:relative z-20 h-full`}
          >
            <ChatSidebar
              chats={chats}
              loading={chatsLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentChat={currentChat}
              handleChatSelect={handleChatSelect}
              getOtherUser={getOtherUser}
              getRelativeTime={getRelativeTime}
              getUnreadStatusForChat={getUnreadStatusForChat}
            />
          </div>

          <main className="flex-1 flex flex-col w-full">
            {currentChat ? (
              <>
                <MessageList
                  messages={messages}
                  user={user}
                  currentChat={currentChat}
                  getOtherUser={getOtherUser}
                  formatTime={formatTime}
                  isTyping={isTyping}
                />

                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleTyping={handleTyping}
                  handleStopTyping={handleStopTyping}
                />
              </>
            ) : (
              <EmptyChat setSidebarOpen={setSidebarOpen} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Chat;
