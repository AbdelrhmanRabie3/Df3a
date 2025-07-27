import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import "flowbite";
import ThemeContextProvider from "./contexts/ThemeContextProvider.jsx";

import { Toaster } from "react-hot-toast";
import AuthContextProvider from "./contexts/AuthContextProvider.jsx";
import { UserProvider } from "./contexts/ProfileContext.jsx";
import ChatContextProvider from "./contexts/ChatContextProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "./contexts/SocketContext.jsx";
const client = new QueryClient();
createRoot(document.getElementById("root")).render(
  <ThemeContextProvider>
    <AuthContextProvider>
      <UserProvider>
        <SocketProvider>
          <ChatContextProvider>
            <QueryClientProvider client={client}>
              <Toaster
                toastOptions={{
                  success: {
                    style: {
                      background: "var(--primary-brand)",
                      color: "var(--text-inverse)",
                    },
                    iconTheme: {
                      primary: "var(--surface)",
                      secondary: "var(--primary-brand)",
                    },
                  },
                  error: {
                    style: {
                      background: "#e74c3c",
                      color: "var(--text-inverse)",
                    },
                    iconTheme: {
                      primary: "var(--surface)",
                      secondary: "#e74c3c",
                    },
                  },
                }}
              />
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </QueryClientProvider>
          </ChatContextProvider>
        </SocketProvider>
      </UserProvider>
    </AuthContextProvider>
  </ThemeContextProvider>
);
