import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContextProvider";


const ChatSidebar = ({
  chats,
  loading,
  searchTerm,
  setSearchTerm,
  currentChat,
  handleChatSelect,
  getOtherUser,
  getRelativeTime,
  getUnreadStatusForChat,
}) => {
  const { user } = useContext(AuthContext);
  const filteredChats = chats.filter((chat) => {
    const otherUser = getOtherUser(chat);
    return (
      otherUser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-80 bg-background border-r border-gray-200 flex flex-col">

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats found</div>
        ) : (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            const hasUnread = getUnreadStatusForChat(chat._id);
            const isActive = currentChat?._id === chat._id;
            const isUserLastSender =
              chat.latestMessage?.sender._id === user?._id;

            return (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 border-default  border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive ? "bg-primary border-l-4 !border-l-blue-500" : ""
                } ${hasUnread && !isActive ? "bg-blue-25" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                  
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 relative">
                      <span className="text-lg font-medium text-gray-600">
                        {(otherUser.name ||
                          otherUser.username ||
                          "U")[0].toUpperCase()}
                      </span>

                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>


                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-medium truncate ${
                            hasUnread 
                              ? "text-primary font-bold"
                              : "text-primary"
                          }`}
                        >
                          {otherUser.name ||
                            otherUser.username ||
                            "Unknown User"}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {getRelativeTime(chat.latestMessage?.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center flex-1 min-w-0">

                          {isUserLastSender && (
                            <span className="text-sm text-primary mr-1">
                              You:{" "}
                            </span>
                          )}
                          <p
                            className={`text-sm truncate ${
                              hasUnread && !isUserLastSender
                                ? "text-primary font-bold"
                                : "text-primary"
                            }`}
                          >
                            {chat.latestMessage?.content || "No messages yet"}
                          </p>
                        </div>

                        {hasUnread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
