import { IoSearch } from "react-icons/io5";

function ChatSidebar({
  chats,
  loading,
  searchTerm,
  setSearchTerm,
  currentChat,
  handleChatSelect,
  getOtherUser,
  getRelativeTime,
  getUnreadStatusForChat,
}) {
  const filteredChats = chats.filter((chat) => {
    if (!searchTerm) return true;
    const otherUser = getOtherUser(chat);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-full bg-surface border-r border-border flex flex-col">
     
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">
          Messages
        </h2>

      
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-3 bg-input rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary-brand text-sm md:text-base"
          />
        </div>
      </div>

   
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-brand"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center text-secondary p-8">
            <p className="text-sm md:text-base">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const isUnread = getUnreadStatusForChat(chat._id);
              const isActive = currentChat?._id === chat._id;

              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 md:p-4 hover:bg-background cursor-pointer transition-colors ${
                    isActive ? "bg-background" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={otherUser.image}
                        alt={otherUser.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                      />
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-brand rounded-full border-2 border-surface"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold text-sm md:text-base truncate ${
                            isUnread ? "text-primary" : "text-primary"
                          }`}
                        >
                          {chat.isGroupChat ? chat.chatName : otherUser.name}
                        </h3>
                        {chat.latestMessage && (
                          <span
                            className={`text-xs ${
                              isUnread
                                ? "text-primary-brand font-medium"
                                : "text-secondary"
                            }`}
                          >
                            {getRelativeTime(chat.latestMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {chat.latestMessage && (
                        <p
                          className={`text-xs md:text-sm truncate ${
                            isUnread
                              ? "text-primary font-medium"
                              : "text-secondary"
                          }`}
                        >
                          {chat.latestMessage.sender._id === otherUser._id
                            ? ""
                            : "You: "}
                          {chat.latestMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;
