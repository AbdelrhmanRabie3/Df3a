import { useRef, useEffect } from "react";

function MessageList({
  messages,
  user,
  currentChat,
  getOtherUser,
  formatTime,
  isTyping,
  typingUser,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const uniqueMessages = messages.filter((msg, idx, arr) =>
    msg._id
      ? arr.findIndex((m) => m._id === msg._id) === idx
      : arr.findIndex(
          (m) => m.content === msg.content && m.createdAt === msg.createdAt
        ) === idx
  );

  const groupedMessages = uniqueMessages.reduce((groups, message) => {
    const msgDate = new Date(message.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    let dateLabel;
    if (msgDate.toDateString() === today.toDateString()) {
      dateLabel = "Today";
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = msgDate.toLocaleDateString();
    }
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 p-2 md:p-4 overflow-y-auto space-y-4 md:space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="text-center text-xs font-semibold text-secondary my-2">
            {date}
          </div>
          <div className="space-y-3 md:space-y-6">
            {dateMessages.map((message, index) => {
              const isOwnMessage = message.sender._id === user?._id;
              return (
                <div
                  key={message._id || index}
                  className={`flex items-end gap-2 md:gap-3 px-2 md:px-0 ${
                    isOwnMessage ? "justify-end" : ""
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      alt="Sender avatar"
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover self-start"
                      src={getOtherUser(currentChat).image}
                    />
                  )}
                  <div
                    className={`flex flex-col gap-1 ${
                      isOwnMessage ? "items-end" : "items-start"
                    } max-w-[85%] md:max-w-md`}
                  >
                    <div
                      className={`${
                        isOwnMessage ? "bg-primary text-white" : "bg-background"
                      } p-2 md:p-3 ${
                        isOwnMessage
                          ? "rounded-l-lg rounded-tr-lg"
                          : "rounded-r-lg rounded-tl-lg"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    <span className="text-xs text-secondary flex items-center gap-1">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {isOwnMessage && (
                    <img
                      alt="Your avatar"
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover self-start"
                      src={user?.image}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex justify-start px-2 md:px-0">
          <div className="bg-gray-200 text-gray-800 px-3 py-2 md:px-4 md:py-2 rounded-lg max-w-xs">
            <div className="flex items-center space-x-1">
              <span className="text-xs md:text-sm">{typingUser} is typing</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
