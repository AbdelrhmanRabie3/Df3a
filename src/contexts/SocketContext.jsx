import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContextProvider";

const URL = "http://localhost:5000";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {

    if (authLoading) {
      console.log("Waiting for auth to load...");
      return;
    }

    if (user?._id) {
      console.log("Creating socket connection for user:", user._id);


      const timeoutId = setTimeout(() => {
        const newSocket = io(URL, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
          console.log("Socket connected successfully");
          newSocket.emit("setup", user);
        });

        newSocket.on("connected", () => {
          console.log("User setup completed");
          setSocketConnected(true);
        });

        newSocket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
          setSocketConnected(false);
        });

        newSocket.on("reconnect", (attemptNumber) => {
          console.log("Socket reconnected after", attemptNumber, "attempts");
          newSocket.emit("setup", user);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        setSocket(newSocket);
      }, 100); 

      return () => {
        clearTimeout(timeoutId);
        if (socket) {
          console.log("Cleaning up socket connection");
          socket.disconnect();
        }
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketConnected(false);
      }
    }
  }, [user?._id, authLoading]); 

  return (
    <SocketContext.Provider value={{ socket, socketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
