import axios from "axios";
import Cookies from "js-cookie";
const URL = "http://localhost:5000/api";

export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(
      `${URL}/users?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching users:", error);
    throw error;
  }
};

export const getAllMentors = async () => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${URL}/mentors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching mentors:", error);
    throw error;
  }
};

export const getAllStudents = async () => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${URL}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching students:", error);
    throw error;
  }
};
export const getAllReviews = async () => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${URL}/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error fetching reviews:", error);
    throw error;
  }
};

export const getReviewsByTarget = async (targetType, targetId) => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(
      `${URL}/reviews/${targetType}/${targetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching reviews by target:", error);
    throw error;
  }
};

export const getAllWorkshops = async () => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${URL}/workshops`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Workshops response:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching workshops:", error);
    if (error.response) {
      console.error("Backend error response:", error.response.data);
    }
    throw error;
  }
};
