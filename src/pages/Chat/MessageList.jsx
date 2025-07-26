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
  console.log("Rendering MessageList with messages:", messages);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const groupedMessages = messages.reduce((groups, message) => {
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

  const chatStartTime =
    messages.length > 0 ? new Date(messages[0].createdAt) : null;

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-6">
      {chatStartTime && (
        <div className="text-center text-xs text-secondary mb-2">
          Chat started at {chatStartTime.toLocaleString()}
        </div>
      )}

      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          <div className=" text-center text-xs font-semibold text-secondary my-2">
            {date}
          </div>
          <div className="space-y-6">
            {dateMessages.map((message, index) => {
              const isOwnMessage = message.sender._id === user?._id;
              return (
                <div
                  key={message._id || index}
                  className={`flex items-end gap-3 ${
                    isOwnMessage ? "justify-end" : ""
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      alt="Sender avatar"
                      className="w-8 h-8 rounded-full object-cover self-start"
                      src={getOtherUser(currentChat).image}
                    />
                  )}
                  <div
                    className={`flex flex-col gap-1 ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`${
                        isOwnMessage ? "bg-primary text-white" : "bg-background"
                      } p-3 ${
                        isOwnMessage
                          ? "rounded-l-lg rounded-tr-lg"
                          : "rounded-r-lg rounded-tl-lg"
                      } max-w-md`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-secondary flex items-center gap-1">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  {isOwnMessage && (
                    <img
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full object-cover self-start"
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
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
            <div className="flex items-center space-x-1">
              <span className="text-sm">{typingUser} is typing</span>
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
