import axios from "axios";
import Cookies from "js-cookie";
const URL = "http://localhost:5000/api";

const getToken = () => Cookies.get("token");

export const createReview = async ({
  targetType,
  targetId,
  comment,
  rating,
  authorId,
}) => {
  try {
    const token = getToken();

    console.log("Token exists:", !!token);
    console.log("Token:", token ? token.substring(0, 20) + "..." : "No token");
    console.log("Author ID:", authorId);

    if (!authorId) {
      throw new Error("Author ID is required");
    }

    const reviewData = {
      targetType,
      targetId,
      comment,
      rating: Number(rating),
      author: authorId,
    };
    console.log("Sending review data:", reviewData);
    console.log("Request URL:", `${URL}/reviews/`);

    const response = await axios.post(`${URL}/reviews/`, reviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error status text:", error.response?.statusText);
    console.error("Error response data:", error.response?.data);
    console.error("Error response headers:", error.response?.headers);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw error;
  }
};
