import { createContext, useEffect, useState } from "react";
import {
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  updatePassword as updatePasswordService,
} from "../services/authService";
import Cookies from "js-cookie";
export const AuthContext = createContext();
function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = 
          Cookies.get("user") || null
          
        const storedToken = 
          Cookies.get("token") ||null

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        Cookies.remove("user");
        Cookies.remove("token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handler for forgot password
  const forgotPassword = async (email) => {
    try {
      return await forgotPasswordService(email);
    } catch (error) {
      throw error;
    }
  };

  // Handler for reset password
  const resetPassword = async (resetData) => {
    try {
      return await resetPasswordService(resetData);
    } catch (error) {
      throw error;
    }
  };

  // Handler for update password
  const updatePassword = async (updateData, token) => {
    try {
      return await updatePasswordService(updateData, token);
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          loading,
          token,
          setToken,
          forgotPassword,
          resetPassword,
          updatePassword,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
}

export default AuthContextProvider;
