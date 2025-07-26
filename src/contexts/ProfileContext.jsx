import { createContext, useContext, useEffect, useState } from "react";

import {
  addAvailability,
  cancelBookingHandler,
  confirmBookingHandler,
  fetchUserProfile,
  getMentorBookings,
  getMentorWorkshops,
  getReviewsByTarget,
  removeAvailability,
  updateMentorPrice,
  uploadProfilePhoto,
  updateProfilePhoto,
  getStudentRegisteredWorkshops,
  getStudentBookings,
} from "../services/profileService";
import { AuthContext } from "./AuthContextProvider";

import toast from "react-hot-toast";

import Cookies from "js-cookie";

export const UserContext = createContext();

// Utility to calculate profile completion percentage
function getProfileCompletion(user) {
  if (!user) return 0;
  let total = 6;
  let score = 0;
  if (user.name) score++;
  if (user.bio) score++;
  if (user.image) score++;
  if (user.availability && user.availability.length > 0) score++;
  if (user.expertise && user.expertise.length > 0) score++;
  if (user.languages && user.languages.length > 0) score++;
  return Math.round((score / total) * 100);
}

export const UserProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [workshops, setworkshops] = useState([]);
  const [reviews, setReviews] = useState([]);
  // Availability form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [tempSlots, setTempSlots] = useState([]);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySuccess, setAvailabilitySuccess] = useState("");
  const { user, setUser } = useContext(AuthContext);
  const refreshUser = async (userId) => {
    // If userId is not provided, try to fetch current user
    let userData = null;
    if (userId) {
      userData = await fetchUserProfile(userId);
    } else {
      userData = await fetchUserProfile(); // Should fetch /api/auth/me
    }
    if (userData) setUser(userData);
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      refreshUser(); // Fetch current user on mount only if token exists
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const res = await getMentorBookings(user._id);
      if (res?.success) setBookings(res.data);
    };

    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchWorkshops = async () => {
      const res = await getMentorWorkshops(user._id);
      if (res?.success) setworkshops(res.data);
    };

    fetchWorkshops();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      const data = await getReviewsByTarget("mentor", user._id);
      setReviews(data);
    };

    fetchReviews();
  }, [user]);

  const hanldeBookingConfirm = async (bookingId) => {
    const result = await confirmBookingHandler(bookingId);
    if (result?.success) {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, attendStatus: "confirmed" } : b
        )
      );
    }
  };

  const hanldeBookingCancel = async (bookingId) => {
    const result = await cancelBookingHandler(bookingId);
    if (result?.success) {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, attendStatus: "cancelled" } : b
        )
      );
      if (result.message) {
        toast.success(result.message);
      }
    } else if (result?.message) {
      toast.error(result.message);
    }
  };

  // Add slot to tempSlots
  const handleAddSlot = () => {
    setAvailabilityError("");
    setAvailabilitySuccess("");
    if (!slotStart || !slotEnd) {
      setAvailabilityError("Both start and end times are required.");
      return;
    }
    if (slotStart >= slotEnd) {
      setAvailabilityError("Start time must be before end time.");
      return;
    }
    setTempSlots([...tempSlots, [slotStart, slotEnd]]);
    setSlotStart("");
    setSlotEnd("");
    setAvailabilitySuccess("Slot added.");
  };

  // Remove slot from tempSlots
  const handleRemoveTempSlot = (idx) => {
    setTempSlots(tempSlots.filter((_, i) => i !== idx));
  };

  // Add day and slots to availability (now with date)
  const handleSaveDay = async () => {
    setAvailabilityError("");
    setAvailabilitySuccess("");
    if (!selectedDate) {
      setAvailabilityError("Select a date.");
      return;
    }
    if (!selectedDay) {
      setAvailabilityError("Select a day.");
      return;
    }
    if (tempSlots.length === 0) {
      setAvailabilityError("Add at least one slot for this day.");
      return;
    }
    try {
      await handleAddAvailability(
        selectedDate,
        selectedDay,
        tempSlots.map(([start, end]) => `${start}-${end}`)
      );
      setSelectedDate("");
      setSelectedDay("");
      setTempSlots([]);
      setAvailabilitySuccess("Date, day, and slots added.");
    } catch (e) {
      setAvailabilityError("Failed to add availability.");
    }
  };

  // Add availability to backend and refresh user (now with date)
  const handleAddAvailability = async (date, day, slots) => {
    try {
      await addAvailability(date, day, slots);
      await refreshUser();
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  // Remove availability from backend and refresh user
  const handleRemoveAvailability = async (date, day, slots) => {
    try {
      await removeAvailability(date, day, slots);
      await refreshUser();
    } catch (error) {
      console.error("Remove error:", error);
    }
  };

  // Handler to update mentor price
  const updateMentorPriceHandler = async (price) => {
    try {
      const result = await updateMentorPrice(price);
      await refreshUser();
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Handler to upload and update profile photo
  const handleProfilePhotoSave = async (file) => {
    try {
      const imageUrl = await uploadProfilePhoto(file);
      if (imageUrl) {
        await updateProfilePhoto(imageUrl);
        await refreshUser();
        return { success: true, imageUrl };
      } else {
        throw new Error("No image URL returned");
      }
    } catch (err) {
      return { success: false, error: err.message || "Failed to update photo" };
    }
  };

  // Handler to fetch student registered workshops
  const fetchStudentWorkshops = async () => {
    return await getStudentRegisteredWorkshops();
  };

  // Handler to fetch student bookings
  const fetchStudentBookings = async () => {
    return await getStudentBookings();
  };

  // Calculate profile completion
  const profileCompletion = getProfileCompletion(user);

  return (
    <UserContext.Provider
      value={{
        refreshUser,
        bookings,
        workshops,
        reviews,
        selectedDate,
        setSelectedDate,
        selectedDay,
        setSelectedDay,
        slotStart,
        setSlotStart,
        slotEnd,
        setSlotEnd,
        tempSlots,
        setTempSlots,
        availabilityError,
        setAvailabilityError,
        availabilitySuccess,
        setAvailabilitySuccess,
        handleAddSlot,
        handleRemoveTempSlot,
        handleSaveDay,
        hanldeBookingCancel,
        hanldeBookingConfirm,
        handleAddAvailability,
        handleRemoveAvailability,
        profileCompletion,
        updateMentorPriceHandler,
        handleProfilePhotoSave,
        fetchStudentWorkshops,
        fetchStudentBookings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
