import axios from "axios";
const URL = "http://localhost:5000/api/auth";

export const signUp = async (userData) => {
  try {
    console.log("Signing up user with data:");
    const response = await axios.post(`${URL}/register`, userData);
    console.log("User registered successfully:", response);
    return response.data;
  } catch (error) {
    console.log("Error during registration:", error);
    throw error;
  }
};
export const signin = async (userData) => {
  try {
    const response = await axios.post(`${URL}/login`, userData);
    console.log("User logged in successfully:", response);
    return response.data;
  } catch (error) {
    console.log("Error during Login:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${URL}/forgot-password`, { email });
    console.log("Forgot password request sent:", response);
    return response.data;
  } catch (error) {
    console.log("Error during forgot password:", error);
    throw error;
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await axios.post(`${URL}/reset-password`, resetData);
    console.log("Password reset successfully:", response);
    return response.data;
  } catch (error) {
    console.log("Error during password reset:", error);
    throw error;
  }
};

export const updatePassword = async (updateData, token) => {
  try {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await axios.post(
      `${URL}/update-password`,
      updateData,
      config
    );
    console.log("Password updated successfully:", response);
    return response.data;
  } catch (error) {
    console.log("Error during password update:", error);
    throw error;
  }
};
