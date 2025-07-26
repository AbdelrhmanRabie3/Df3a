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
    console.log("=== INPUT CHANGED ===");
    console.log("Input value:", e.target.value);
    console.log("isUserTyping before:", isUserTyping);
    
    setNewMessage(e.target.value);

    if (!isUserTyping) {
      console.log("User started typing - calling handleTyping");
      setIsUserTyping(true);
      handleTyping(); // This should call the parent's handleTyping
    } else {
      console.log("User already typing - not calling handleTyping again");
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      console.log("Typing timeout reached - calling handleStopTyping");
      setIsUserTyping(false);
      handleStopTyping();
    }, 3000);
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
    <div className="p-4 bg-surface border-t border-border">
      <form onSubmit={handleSendMessage} className="relative flex items-center">
        <input
          className="w-full pl-12 pr-28 py-3 rounded-full bg-input text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary-brand transition-shadow"
          placeholder="Type your message..."
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // Make sure this is onKeyPress, not onKeyDown
        />
        <div className="absolute left-0 inset-y-0 flex items-center pl-4"></div>
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 bg-primary-brand rounded-full text-text-inverse hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-brand transition-transform active:scale-95"
        >
          <IoSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;