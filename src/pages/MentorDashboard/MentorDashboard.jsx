import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../contexts/ProfileContext";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { fetchWorkshopById } from "../../services/workshopService";
import MentorAvailability from "../../components/Mentor/MentorAvailability";
import { createReport, hasUserReported } from "../../services/reportService";
import Footer from "../../components/Footer/Footer";
import NavBar from "../../components/NavBar/NavBar";
import StudentSlider from "../../components/StudentSlider/StudentSlider";

import JoinVideoRoomButton from "../Video/JoinRoomButton";
import axiosInstance from "../../services/axios";

import Cookies from "js-cookie";
function getDayOfWeek(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

// Helper to check if booking is in the past
function isBookingPast(booking) {
  if (!booking.date || !booking.timeSlot?.length) return false;
  // Combine date and earliest timeSlot.start
  const dateStr = booking.date; // e.g., "2024-07-25"
  const timeStr = booking.timeSlot[0].start; // e.g., "14:00"
  // If timeStr is not in HH:mm format, adjust parsing as needed
  const sessionDateTime = new Date(`${dateStr}T${timeStr}`);
  return new Date() > sessionDateTime;
}

function isBookingCancelable(session) {
  if (!session.date || !session.timeSlot?.length) return false;
  const dateStr = session.date;
  const timeStr = session.timeSlot[0].start;
  const sessionDateTime = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const diffMs = sessionDateTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 24;
}

export default function MentorDashboard() {
  const navigate = useNavigate();
  const {
    bookings,
    workshops,
    reviews,
    handleRemoveAvailability,
    profileCompletion,
    updateMentorPriceHandler,
    hanldeBookingCancel,
    hanldeBookingConfirm,
  } = useContext(UserContext);
  const { user, token } = useContext(AuthContext);

  // All hooks must be before any return or conditional
  const [priceInput, setPriceInput] = useState("");
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceSuccess, setPriceSuccess] = useState("");
  const [priceError, setPriceError] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null); // user being reported
  const [reportWorkshop, setReportWorkshop] = useState(null); // workshop context
  const [reportReason, setReportReason] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [reportedSessions, setReportedSessions] = useState({});
  const [reportedWorkshopStudents, setReportedWorkshopStudents] = useState({}); // { [workshopId]: { [studentId]: true/false } }
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetSession, setCancelTargetSession] = useState(null);

  // Move these functions to the top level of the component
  const checkSessionReports = async () => {
    if (!user || !bookings.length) return;
    // Set all to null first
    const initial = {};
    for (const session of bookings) {
      if (!session.student?._id) continue;
      const key = `${session._id}_${session.student._id}`;
      initial[key] = null;
    }
    setReportedSessions(initial);

    const results = {};
    for (const session of bookings) {
      if (!session.student?._id) continue;
      const key = `${session._id}_${session.student._id}`;
      results[key] = await hasUserReported({
        reporter: user._id,
        reportedUser: session.student._id,
        booking: session._id,
      });
    }
    setReportedSessions(results);
  };

  const checkWorkshopStudentReports = async () => {
    if (!user || !workshops.length) return;
    // Set all to null first
    const initial = {};
    for (const workshop of workshops) {
      if (!workshop.registeredStudents?.length) continue;
      initial[workshop._id] = {};
      for (const student of workshop.registeredStudents) {
        initial[workshop._id][student._id] = null;
      }
    }
    setReportedWorkshopStudents(initial);

    const results = {};
    for (const workshop of workshops) {
      if (!workshop.registeredStudents?.length) continue;
      results[workshop._id] = {};
      for (const student of workshop.registeredStudents) {
        results[workshop._id][student._id] = await hasUserReported({
          reporter: user._id,
          reportedUser: student._id,
          workshop: workshop._id,
        });
      }
    }
    setReportedWorkshopStudents(results);
  };

  useEffect(() => {
    checkSessionReports();
  }, [user, bookings]);

  useEffect(() => {
    checkWorkshopStudentReports();
  }, [user, workshops]);

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }
  console.log(user);
  console.log(bookings);
  console.log(workshops);
  console.log(reviews);

  const handleViewWorkshop = async (workshopId) => {
    try {
      const workshop = await fetchWorkshopById(workshopId);
      if (workshop) {
        navigate(`/workshops/${workshopId}`);
      }
    } catch (error) {
      console.error("Error fetching workshop:", error);
    }
  };

  // Remove a day from availability (now with date)
  const handleRemoveDay = async (date, day) => {
    const dayObj = user.availability?.find(
      (a) => a.day === day && a.date === date
    );
    if (!dayObj) return;
    try {
      await handleRemoveAvailability(date, day, dayObj.slots);
    } catch (e) {
      // Optionally handle error
    }
  };

  // Handle price update
  const handlePriceUpdate = async () => {
    setPriceLoading(true);
    setPriceSuccess("");
    setPriceError("");
    try {
      await updateMentorPriceHandler(priceInput);
      setPriceSuccess("Price updated successfully!");
      setPriceInput("");
    } catch (e) {
      setPriceError("Failed to update price.");
    } finally {
      setPriceLoading(false);
    }
  };

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleOpenReportModal = (targetUser, workshop) => {
    setReportTarget(targetUser);
    setReportWorkshop(workshop);
    setReportReason("");
    setReportText("");
    setReportError("");
    setReportSuccess("");
    setReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    setReportLoading(true);
    setReportError("");
    if (!reportReason) {
      setReportError("Please select a reason.");
      setReportLoading(false);
      return;
    }
    if (!reportText) {
      setReportError("Please provide details.");
      setReportLoading(false);
      return;
    }
    try {
      const reportPayload = {
        reportedUser: reportTarget._id,
        reason: reportReason,
        message: reportText,
      };
      let isSession = false;
      if (reportWorkshop && Array.isArray(reportWorkshop.timeSlot)) {
        reportPayload.booking = reportWorkshop._id;
        isSession = true;
      } else if (reportWorkshop) {
        reportPayload.workshop = reportWorkshop._id;
      }
      await createReport(reportPayload);
      setReportSuccess("Report submitted successfully.");
      if (isSession) {
        // Update reportedSessions for this session/student
        const key = `${reportWorkshop._id}_${reportTarget._id}`;
        setReportedSessions((prev) => ({
          ...prev,
          [key]: true,
        }));
      } else {
        // Update reportedWorkshopStudents for this workshop/student
        setReportedWorkshopStudents((prev) => ({
          ...prev,
          [reportWorkshop._id]: {
            ...(prev[reportWorkshop._id] || {}),
            [reportTarget._id]: true,
          },
        }));
      }
      setTimeout(() => setReportModalOpen(false), 1500);
    } catch (err) {
      setReportError("Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await axiosInstance.post(
        "/create-stripe-account-link", {});
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Error connecting to Stripe:", err);
      toast.error("Failed to connect to Stripe");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="grid grid-cols-[auto,1fr] min-h-screen">
          {/* Sidebar */}
          <aside className="fixed left-0 top-0 w-64 h-[100%] bg-surface shadow-md p-6 flex flex-col justify-between py-20">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <img
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                  src={user.image}
                />
                <div>
                  <h1 className="font-bold text-lg text-primary">
                    {user.name}
                  </h1>
                  <p className="text-sm text-secondary">{user.role}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-2">
                {/* ...nav links as before... */}
                {/* Dashboard */}
                <a
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary text-white font-semibold"
                  href="#"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>Dashboard</span>
                </a>
                {/* Sessions */}
                {/* <a
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary text-secondary"
                  href="#"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                    <path
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>Sessions</span>
                </a> */}
                {/* Workshops */}
                {/* <a
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary text-secondary"
                  href="#"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>Workshops</span>
                </a> */}
                {/* Earnings */}
                {/* <a
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary text-secondary"
                  href="#"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0 12a9 9 0 110-18 9 9 0 010 18zm0 0a9 9 0 000-18 9 9 0 000 18z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>Earnings</span>
                </a> */}
                {/* Settings */}
                {/* <a
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary text-secondary"
                  href="#"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>Settings</span>
                </a> */}

                <div className="flex flex-col gap-2">
                  <Link
                    to={"/profile"}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg btn-secondary text-white font-semibold"
                  >
                    {user.isRegistered === true
                      ? "Edit Profile"
                      : "complete Your profile"}
                  </Link>{" "}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConnect}
                    className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                  >
                    ربط مع Stripe
                  </button>
                </div>
              </nav>
            </div>
          </aside>
          {/* Main Content */}
          <main className="col-start-2 ml-64 p-6 lg:p-10">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-primary">
                Welcome back, {user.name}
              </h1>
            </header>
            {/* Stats */}

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <NavBar />
              <div className="bg-surface shadow-md rounded-lg  p-6 flex flex-col justify-between">
                <p className="font-semibold text-primary">Booked Sessions</p>
                <p className="text-4xl font-bold text-primary-color">
                  {bookings.length}
                </p>
              </div>
              <div className="bg-surface rounded-lg shadow-md  p-6 flex flex-col justify-between">
                <p className="font-semibold text-primary">Rating</p>
                <p className="text-4xl font-bold text-primary-color">
                  {user.rating}
                </p>
              </div>
              <div className="bg-surface rounded-lg shadow-md  p-6 flex flex-col justify-between">
                <p className="font-semibold text-primary">Workshops</p>
                <p className="text-4xl font-bold text-primary-color">
                  {workshops.length}
                </p>
              </div>
            </section>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                {/* Upcoming Sessions - Vertical Slider */}
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    Sessions
                  </h2>
                  {bookings.length === 0 ? (
                    <div className="text-secondary">No sessions found.</div>
                  ) : (
                    <div className="relative" style={{ height: "350px" }}>
                      <div
                        id="mentor-bookings-slider"
                        className="flex flex-col gap-4 overflow-y-auto py-8"
                        style={{ height: "100%" }}
                      >
                        {bookings.map((session) => (
                          <div
                            key={session._id}
                            className="bg-surface rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-4"
                          >
                            <div className="flex-1">
                              <p className="text-lg font-bold text-primary">
                                {session.date} ·{" "}
                                {session.timeSlot.map((slot, index) => (
                                  <span
                                    key={index}
                                    className="inline-block mr-2"
                                  >
                                    {slot.start}
                                  </span>
                                ))}
                              </p>
                              <p className="text-secondary mb-4">
                                Student: {session.student?.name || "Unknown"}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {session.attendStatus === "pending" && (
                                  <>
                                    <div className="relative group inline-block">
                                      <button
                                        className={`btn-secondary px-4 py-2 rounded ${!isBookingPast(session)
                                          ? "cursor-not-allowed opacity-60 pointer-events-none"
                                          : ""
                                          }`}
                                        onClick={() =>
                                          hanldeBookingConfirm(session._id)
                                        }
                                        disabled={!isBookingPast(session)}
                                      >
                                        Mark as Completed
                                      </button>
                                      {!isBookingPast(session) && (
                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                          The session can be marked as completed
                                          only after it has passed.
                                        </span>
                                      )}
                                    </div>
                                    <div className="relative group inline-block">
                                      <button
                                        className={`btn-secondary px-4 py-2 rounded ${!isBookingCancelable(session)
                                          ? "cursor-not-allowed opacity-60 pointer-events-none"
                                          : ""
                                          }`}
                                        disabled={!isBookingCancelable(session)}
                                        onClick={() => {
                                          setCancelTargetSession(session._id);
                                          setCancelModalOpen(true);
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      {!isBookingCancelable(session) && (
                                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                          You can only cancel at least 24 hours
                                          before the session.
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                                {(session.attendStatus === "confirmed" ||
                                  session.attendStatus === "cancelled") && (
                                    <>
                                      <button
                                        className={
                                          session.attendStatus === "confirmed"
                                            ? "btn-primary px-4 py-2 rounded cursor-not-allowed opacity-60 pointer-events-none"
                                            : "btn-secondary px-4 py-2 rounded cursor-not-allowed opacity-60 pointer-events-none"
                                        }
                                        disabled
                                      >
                                        {session.attendStatus === "confirmed"
                                          ? "Completed"
                                          : "Cancelled"}
                                      </button>

                                      {reportedSessions[
                                        `${session._id}_${session.student?._id}`
                                      ] === null ||
                                        reportedSessions[
                                        `${session._id}_${session.student?._id}`
                                        ] === undefined ? (
                                        <span className="text-secondary text-xs ml-2">
                                          Checking...
                                        </span>
                                      ) : !reportedSessions[
                                        `${session._id}_${session.student?._id}`
                                      ] ? (
                                        <button
                                          className="btn-danger px-4 py-2 rounded ml-2"
                                          onClick={() =>
                                            handleOpenReportModal(
                                              session.student,
                                              session
                                            )
                                          }
                                        >
                                          Report
                                        </button>
                                      ) : (
                                        <span className="text-green-600 font-semibold ml-2">
                                          Reported
                                        </span>
                                      )}
                                    </>
                                  )}

                                {session.attendStatus !== "confirmed" &&
                                  session.attendStatus !== "cancelled" && (
                                    <JoinVideoRoomButton
                                      className="w-[150px]"
                                      RoomId={session._id}
                                      StartTime={
                                        session.timeSlot &&
                                          session.timeSlot.length > 0
                                          ? session.timeSlot[0].start
                                          : ""
                                      }
                                      token={
                                        token ||
                                        Cookies.get("token")
                                      }
                                      isAvailable={(() => {
                                        if (
                                          !session.date ||
                                          !session.timeSlot?.length
                                        )
                                          return false;
                                        const dateStr = session.date;
                                        const timeStr =
                                          session.timeSlot[0].start;
                                        const sessionDateTime = new Date(
                                          `${dateStr}T${timeStr}`
                                        );
                                        return new Date() >= sessionDateTime;
                                      })()}
                                      type="booking"
                                    />
                                  )}

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
                {/* My Workshops */}
                <section className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">
                      My Workshops
                    </h2>
                    {user.verified && (
                      <Link
                        to={"/createworkshop"}
                        className="btn-primary px-4 py-2 rounded"
                      >
                        Create Workshop
                      </Link>
                    )}
                  </div>
                  {workshops.map((workshop) => (
                    <div
                      key={workshop._id}
                      className="bg-surface rounded-lg shadow-md  p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-4"
                    >
                      <div className="flex-1">
                        <p className="text-lg font-bold text-primary">
                          {workshop.title}
                        </p>
                        <p className="text-sm text-secondary mb-4">
                          <span className="font-semibold">Type:</span>
                          <span
                            className={
                              workshop.type === "online"
                                ? `bg-primary py-1 px-2 rounded-full text-white ml-2`
                                : `bg-secondary py-1 px-2 rounded-full text-white ml-2`
                            }
                          >
                            {workshop.type}
                          </span>
                        </p>
                        <button
                          onClick={() =>
                            handleViewWorkshop(workshop._id || workshop.id)
                          }
                          className="btn-primary px-4 py-2 rounded"
                        >
                          View
                        </button>
                        {workshop.registeredStudents &&
                          workshop.registeredStudents.length > 0 && (
                            <div className="mt-2">
                              <StudentSlider
                                students={workshop.registeredStudents}
                                workshop={workshop}
                                handleOpenReportModal={handleOpenReportModal}
                                reportedMap={
                                  reportedWorkshopStudents[workshop._id] || {}
                                }
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </section>
                {/* Reviews & Ratings - Vertical Slider */}
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    Reviews & Ratings
                  </h2>
                  <div className="bg-surface rounded-lg shadow-md  p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-6xl font-bold text-primary-color">
                          {user.rating}
                        </p>
                        <div className="flex justify-center text-yellow-400"></div>
                        <p className="text-sm text-secondary">
                          {reviews.length} reviews
                        </p>
                      </div>
                      <div className="w-full flex-1"></div>
                    </div>
                    {reviews.length === 0 ? (
                      <div className="text-secondary">No reviews found.</div>
                    ) : (
                      <div className="relative" style={{ height: "350px" }}>
                        <div
                          id="mentor-reviews-slider"
                          className="flex flex-col gap-6 overflow-y-auto py-8"
                          style={{ height: "100%" }}
                        >
                          {reviews.map((review) => (
                            <div key={review._id} className="border-t pt-6">
                              <div className="flex items-center gap-3 mb-2">
                                <img
                                  alt={review.author.name}
                                  className="w-10 h-10 rounded-full"
                                  src={review.author.image}
                                />
                                <div>
                                  <p className="font-semibold">
                                    {review.author.name}
                                  </p>
                                  <p className="text-sm text-secondary">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex text-yellow-400 mb-2"></div>
                              <p className="text-secondary italic">
                                "{review.comment}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                {/* Availability Overview - now full width below the grid */}
                {user.verified && (
                  <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-primary mb-4">
                      Availability Overview
                    </h2>
                    <MentorAvailability />
                  </section>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                {/* Profile Completion */}
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    Profile Completion
                  </h2>
                  <div className="bg-surface rounded-lg shadow-md  p-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold">Profile Completion</p>
                      <p className="font-bold text-primary-color">
                        {profileCompletion}%
                      </p>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div
                        className="bg-primary-color h-2.5 rounded-full"
                        style={{ width: `${profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                </section>
                {/* Mentor Price Section */}
                <section>
                  <h2 className="text-2xl font-semibold text-primary mb-4">
                    Session Price
                  </h2>
                  <div className="bg-surface rounded-lg shadow-md p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-semibold"> Price/Hour:</span>
                      <span className="text-primary-color font-bold text-lg">
                        {user.price ? `${user.price} EGP` : "Not set"}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center mb-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input-field px-2 py-1 text-sm w-32"
                        placeholder="Enter new price"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        disabled={priceLoading}
                      />
                      <button
                        className="btn-primary rounded px-3 py-1 text-sm"
                        onClick={handlePriceUpdate}
                        disabled={priceLoading || !priceInput}
                      >
                        {priceLoading ? "Saving..." : "Update Price"}
                      </button>
                    </div>
                    {priceSuccess && (
                      <div className="text-green-600 text-sm mb-1">
                        {priceSuccess}
                      </div>
                    )}
                    {priceError && (
                      <div className="text-red-500 text-sm mb-1">
                        {priceError}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
            <Footer />
          </main>
        </div>

        {reportModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                Report {reportTarget?.name}
              </h2>
              <label className="block mb-2 font-medium">Reason</label>
              <select
                className="w-full border rounded p-2 mb-2"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                disabled={reportLoading}
              >
                <option value="">Select a reason</option>
                <option value="Abuse">Abuse</option>
                <option value="Fraud">Fraud</option>
                <option value="Other">Other</option>
              </select>
              <label className="block mb-2 font-medium">Details</label>
              <textarea
                className="w-full border rounded p-2 mb-2"
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe the issue..."
                disabled={reportLoading}
              />
              {reportError && (
                <div className="text-red-500 mb-2">{reportError}</div>
              )}
              {reportSuccess && (
                <div className="text-green-500 mb-2">{reportSuccess}</div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="btn-secondary px-4 py-2 rounded"
                  onClick={() => setReportModalOpen(false)}
                  disabled={reportLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary px-4 py-2 rounded"
                  onClick={handleSubmitReport}
                  disabled={reportLoading || !reportReason || !reportText}
                >
                  {reportLoading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Cancel Confirmation Modal for Mentor */}
        {cancelModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Cancel Session</h2>
              <p className="mb-4 text-secondary">
                Are you sure you want to cancel this session? <br />
                <span className="text-blue-700 font-semibold">
                  If you cancel, the funds for this session will be
                  automatically refunded to the student.
                </span>
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="btn-secondary px-4 py-2 rounded"
                  onClick={() => setCancelModalOpen(false)}
                >
                  No, Go Back
                </button>
                <button
                  className="btn-danger px-4 py-2 rounded"
                  onClick={() => {
                    hanldeBookingCancel(cancelTargetSession);
                    setCancelModalOpen(false);
                  }}
                >
                  Yes, Cancel Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
