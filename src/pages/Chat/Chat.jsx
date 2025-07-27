import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { SocketContext } from "../../contexts/SocketContext";
import { sendNewMessage, getChatMessages } from "../../services/chatServices";
import EmptyChat from "./EmptyChat";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ChatSidebar from "./ChatSideBar";
import NavBar from "./../../components/NavBar/NavBar";
import { ChatContext } from "../../contexts/ChatContextProvider";
import { IoArrowBack } from "react-icons/io5";

let selectedChatCompare;

function Chat() {
  const { user } = useContext(AuthContext);
  const { socket, socketConnected } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    selectedChatCompare = currentChat;
    setLoading(false);
  }, [currentChat]);


  useEffect(() => {
    if (socket) {
      const handleMessageForCurrentChat = (newMessageReceived) => {

        if (
          selectedChatCompare &&
          selectedChatCompare._id === newMessageReceived.chat._id
        ) {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      };

      socket.on("message received", handleMessageForCurrentChat);

      return () => {
        socket.off("message received", handleMessageForCurrentChat);
      };
    }
  }, [socket, selectedChatCompare]);

  
  useEffect(() => {
    if (socket) {
      const handleTyping = (data) => {
        if (!data || !data.user || !data.user._id) {
          setIsTyping(false);
          setTypingUser("");
          return;
        }
        if (
          selectedChatCompare &&
          data.room === selectedChatCompare._id &&
          data.user._id !== user._id
        ) {
          setIsTyping(true);
          setTypingUser(data.userName);
        }
      };

      const handleStopTyping = (data) => {
        if (!data || !data.user || !data.user._id) {
          setIsTyping(false);
          setTypingUser("");
          return;
        }
        if (
          selectedChatCompare &&
          data.room === selectedChatCompare._id &&
          data.user._id !== user._id
        ) {
          setIsTyping(false);
          setTypingUser("");
        }
      };

      socket.on("typing", handleTyping);
      socket.on("stop typing", handleStopTyping);

      return () => {
        socket.off("typing", handleTyping);
        socket.off("stop typing", handleStopTyping);
      };
    }
  }, [socket, selectedChatCompare, user?._id]);

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

  const handleBackClick = () => {
    setCurrentChat(null);
    setSidebarOpen(false);
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
        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) =>
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
          );


          const currentChatIndex = updatedChats.findIndex(
            (chat) => chat._id === currentChat._id
          );
          if (currentChatIndex > 0) {
            const [updatedChat] = updatedChats.splice(currentChatIndex, 1);
            return [updatedChat, ...updatedChats];
          }

          return updatedChats;
        });
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

  const handleTyping = () => {
    if (socket && currentChat) {
      socket.emit("typing", {
        room: currentChat._id,
        user: user,
        userName: user.name || user.username,
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && currentChat) {
      socket.emit("stop typing", {
        room: currentChat._id,
        user: user,
        userName: user.name || user.username,
      });
    }
  };

  return (
    <>
      <NavBar />
      <div className="pt-16 md:pt-20 pb-0 md:pb-8 px-0 md:px-8 min-h-screen bg-background">
        <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-120px)] antialiased text-primary bg-surface md:rounded-lg shadow-default overflow-hidden">
         
          <div
            className={`${isMobileView && currentChat ? "hidden" : "block"} ${
              isMobileView ? "w-full" : "md:block"
            } md:w-80 lg:w-96 h-full`}
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


          <main
            className={`${
              isMobileView && !currentChat ? "hidden" : "flex"
            } flex-1 flex flex-col w-full`}
          >
            {currentChat ? (
              <>
         
                {isMobileView && (
                  <div className="flex items-center gap-3 p-4 bg-surface border-b border-border">
                    <button
                      onClick={handleBackClick}
                      className="p-2 rounded-full hover:bg-background transition-colors"
                    >
                      <IoArrowBack className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={getOtherUser(currentChat).image}
                        alt="User avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-primary">
                          {currentChat.isGroupChat
                            ? currentChat.chatName
                            : getOtherUser(currentChat).name}
                        </h3>
                        {isTyping && (
                          <p className="text-xs text-secondary">typing...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Chat Header */}
                {!isMobileView && (
                  <div className="p-4 bg-surface border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={getOtherUser(currentChat).image}
                        alt="User avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg text-primary">
                          {currentChat.isGroupChat
                            ? currentChat.chatName
                            : getOtherUser(currentChat).name}
                        </h3>
                        {isTyping && (
                          <p className="text-sm text-secondary">
                            {typingUser} is typing...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <MessageList
                  messages={messages}
                  user={user}
                  currentChat={currentChat}
                  getOtherUser={getOtherUser}
                  formatTime={formatTime}
                  isTyping={isTyping}
                  typingUser={typingUser}
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
              !isMobileView && <EmptyChat setSidebarOpen={setSidebarOpen} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Chat;
