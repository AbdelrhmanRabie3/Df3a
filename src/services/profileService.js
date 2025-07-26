import axios from "axios";
import Cookies from "js-cookie";
const URL = "http://localhost:5000";

const getToken = () => Cookies.get("token");

// Fetch current user profile (by token) or by userId
export const fetchUserProfile = async (userId) => {
  try {
    const token = getToken();
    let url = `${URL}/api/auth/me`;
    if (userId) {
      url = `${URL}/api/users/${userId}`;
    }
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data?.user;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

// Update current user profile (by token)
export const editUserProfile = async (formData) => {
  try {
    const token = getToken();
    const res = await axios.put(`${URL}/api/users/profile/update`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data?.user;
  } catch (err) {
    console.error("Edit error:", err?.response?.data || err.message);
    return null;
  }
};

export const getMentorBookings = async (userId) => {
  try {
    const token = getToken();
    let url = `${URL}/api/bookings/mentor`;
    if (userId) {
      url = `${URL}/api/bookings/mentor/${userId}`;
    }
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Bookings fetched:", res.data);
    return res.data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};
export const getMentorWorkshops = async (userId) => {
  try {
    const token = getToken();
    let url = `${URL}/api/workshops/me/mentor`;
    if (userId) {
      url = `${URL}/api/workshops/me/mentor/${userId}`;
    }
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Workshops fetched:", res.data);

    return res.data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

// Confirm Booking
export const confirmBookingHandler = async (bookingId) => {
  try {
    const token = getToken();
    const res = await axios.patch(
      `${URL}/api/bookings/${bookingId}/confirmattend`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Confirm Booking Error:", err);
    return null;
  }
};

// Cancel Booking
export const cancelBookingHandler = async (bookingId) => {
  try {
    const token = getToken();
    const url = `${URL}/api/bookings/cancel/${bookingId}`;
    console.log("Cancel booking for ID:", bookingId);
    console.log("Request URL:", url);
    console.log("Token present:", !!token);
    if (!bookingId) {
      throw new Error("No bookingId provided to cancelBookingHandler");
    }
    if (!token) {
      throw new Error("No auth token found for cancelBookingHandler");
    }
    const res = await axios.post(
      url,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error(
        "Cancel Booking Error (backend response):",
        err.response.data
      );
    } else {
      console.error("Cancel Booking Error:", err);
    }
    throw err;
  }
};

export const getReviewsByTarget = async (targetType, targetId) => {
  try {
    const res = await axios.get(`${URL}/api/reviews/${targetType}/${targetId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return [];
  }
};

export const fetchAvailability = async () => {
  try {
    const token = getToken();
    const res = await axios.get(`${URL}/api/mentors/availability`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching availability:", error);
  }
};

export const addAvailability = async (date, day, slots) => {
  try {
    const token = getToken();
    const res = await axios.post(
      `${URL}/api/mentors/availability/add`,
      {
        date,
        day,
        slots,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Add error:", error);
    throw error;
  }
};

// Remove slots
export const removeAvailability = async (date, day, slots) => {
  try {
    const token = getToken();
    const res = await axios.post(
      `${URL}/api/mentors/availability/remove`,
      {
        date,
        day,
        slots,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Remove error:", error);
    throw error;
  }
};

export const updateMentorPrice = async (price) => {
  try {
    const token = getToken();
    const res = await axios.put(
      `${URL}/api/mentors/mentor/set-price`,
      { price: Number(price) },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Update price error:", error);
    throw error;
  }
};

export const uploadProfilePhoto = async (file) => {
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  let imageUrl = null;
  if (file && typeof file !== "string") {
    const base64 = await fileToBase64(file);
    const formData = new FormData();
    formData.append("image", base64.split(",")[1]);
    const res = await axios.post(
      "https://api.imgbb.com/1/upload?key=c40248bb545395f4cfbca0db7f5abc21",
      formData
    );
    const data = res.data;
    if (data.success) {
      imageUrl = data.data.url;
    } else {
      throw new Error("Image upload failed");
    }
  }
  return imageUrl;
};

export const updateProfilePhoto = async (imageUrl) => {
  return editUserProfile({ image: imageUrl });
};

// Fetch workshops the current student is registered in
export const getStudentRegisteredWorkshops = async () => {
  try {
    const token = getToken();
    const res = await axios.get(`${URL}/api/students/me/workshops`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (err) {
    console.error("Fetch student workshops error:", err);
    return [];
  }
};

// Fetch bookings for the current student
export const getStudentBookings = async () => {
  try {
    const token = getToken();
    const res = await axios.get(`${URL}/api/bookings/me/student`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  } catch (err) {
    console.error("Fetch student bookings error:", err);
    return [];
  }
};

// Set user role
export const setUserRole = async (role) => {
  const token = getToken();
  try {
    const res = await axios.post(
      "http://localhost:5000/api/users/set-role",
      { role }, // send as object
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Set role error:", err.response?.data || err.message);
    throw err;
  }
};
