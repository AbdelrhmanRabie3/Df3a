import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";

function MessageInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleTyping,
  handleStopTyping,
}) {
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!isUserTyping) {
      console.log("User started typing - calling handleTyping");
      setIsUserTyping(true);
      handleTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log("Typing timeout reached - calling handleStopTyping");
      setIsUserTyping(false);
      handleStopTyping();
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      console.log("Enter pressed - stopping typing and sending message");

      if (isUserTyping) {
        setIsUserTyping(false);
        handleStopTyping();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      handleSendMessage(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-2 md:p-4 bg-surface border-t border-border">
      <form onSubmit={handleSendMessage} className="relative flex items-center">
        <input
          className="w-full pl-4 pr-12 md:pl-12 md:pr-28 py-2 md:py-3 rounded-full bg-input text-primary placeholder-secondary text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary-brand transition-shadow"
          placeholder="Type your message..."
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button
          type="submit"
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 md:h-10 md:w-10 bg-primary-brand rounded-full text-text-inverse hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-brand transition-transform active:scale-95"
        >
          <IoSend className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
