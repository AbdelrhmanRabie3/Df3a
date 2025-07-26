import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import {
  fetchWorkshopDetails,
  registerToWorkshop,
} from "../../services/workshopService";
import { AuthContext } from "../../contexts/AuthContextProvider";
import JoinVideoRoomButton from "../Video/JoinRoomButton";

export default function WorkshopDetails() {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerMsg, setRegisterMsg] = useState("");
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(false);

  function isMeetingAvailable(workshop) {
    if (!workshop?.date || !workshop?.time) return false;

    const startTime = new Date(
      `${workshop.date.split("T")[0]}T${workshop.time}:00`
    );

    const now = new Date();

    return now >= startTime;
  }

  useEffect(() => {
    const check = () => setIsAvailable(isMeetingAvailable(workshop));
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [workshop]);

  const refreshWorkshop = () => {
    setLoading(true);
    fetchWorkshopDetails(id)
      .then((data) => setWorkshop(data))
      .catch(() => setError("Failed to load workshop details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshWorkshop();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-10 text-lg text-primary">
        Loading workshop details...
      </div>
    );
  if (error || !workshop)
    return (
      <div className="text-center py-10 text-lg text-red-500">
        {error || "Workshop not found."}
      </div>
    );

  const isFull =
    Array.isArray(workshop.registeredStudents) &&
    Number(workshop.capacity) > 0 &&
    workshop.registeredStudents.length >= Number(workshop.capacity);
  const enrolledStudent = workshop.registeredStudents?.find(
    (s) => s?._id === user?._id
  );
  const isEnrolled = !!enrolledStudent;

  const handleRegister = async () => {
    setRegistering(true);
    setRegisterMsg("");
    try {
      await registerToWorkshop(id);
      setRegisterMsg("Successfully registered!");
      refreshWorkshop();
    } catch (err) {
      setRegisterMsg(
        err?.response?.data?.message || "Failed to register. Please try again."
      );
    } finally {
      setRegistering(false);
    }
  };

  const canJoin = workshop?.registeredStudents?.includes(user._id);

  return (
    console.log("Workshop details:", workshop),
    (
      <div className="min-h-screen bg-background flex justify-center py-10 px-4 mt-12">
        <div className="w-full max-w-3xl bg-surface rounded-2xl shadow-xl overflow-hidden">
          {/* Workshop Image */}
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
            <img
              src={workshop.image || "/public/Hero.jpg"}
              alt={workshop.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Title */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-primary font-poppins">
                {workshop.title}
              </h1>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  workshop.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {workshop.status.charAt(0).toUpperCase() +
                  workshop.status.slice(1)}
              </span>
            </div>

            {/* Description */}
            <p className="text-base text-primary mb-6 leading-relaxed">
              {workshop.description}
            </p>

            <hr className="my-4" />

            {/* Mentor & Date/Time */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              {/* Mentor Info */}
              <div className="flex items-center gap-4">
                <img
                  src={workshop.mentor?.image || "/default-avatar.png"}
                  alt="Mentor"
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <div>
                  <p className="text-lg font-semibold text-primary">
                    {workshop.mentor?.name}
                  </p>
                  <p className="text-sm text-primary">Mentor</p>
                </div>
              </div>

              {/* Date & Language */}
              <div className="flex flex-col items-start sm:items-end">
                <span className="bg-red-100 text-red-800 text-sm font-semibold px-4 py-1 rounded-full mb-1">
                  {new Date(workshop.date).toLocaleDateString()} –{" "}
                  {workshop.time}
                </span>
                <span className="bg-gray-300 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                  {workshop.language}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Detail label="Topic" value={workshop.topic} />
                <Detail
                  label="Type"
                  value={workshop.type === "online" ? "Virtual" : "On-site"}
                />
                <Detail
                  label="Location"
                  value={
                    workshop.location ||
                    (workshop.type === "online" ? "Online" : "-")
                  }
                />
                <Detail
                  label="Duration"
                  value={formatDuration(workshop.duration || 60)}
                />
              </div>
              <div className="space-y-2">
                <Detail
                  label="Price"
                  value={workshop.price > 0 ? `${workshop.price} EGP` : "Free"}
                />
                <Detail label="Capacity" value={workshop.capacity} />
                <Detail
                  label="Booked"
                  value={workshop.registeredStudents?.length || 0}
                />
                <Detail
                  label="Available"
                  value={
                    workshop.capacity -
                    (workshop.registeredStudents?.length || 0)
                  }
                />
              </div>
            </div>

            <hr className="my-4" />

            {/* Register Button */}
            {/* check if he is the workshop creator */}

            <div className="flex flex-col items-center mt-6 gap-2">
              {user._id === workshop?.mentor?._id ? (
                <JoinVideoRoomButton
                  className="mx-auto w-2/3"
                  RoomId={workshop._id}
                  StartTime={workshop.time}
                  token={token}
                  isAvailable={isAvailable}
                  type="workshop"
                />
              ) : isFull ? (
                <button
                  className="bg-gray-400 text-white font-bold rounded-full px-6 py-3 cursor-not-allowed"
                  disabled
                >
                  Workshop Full
                </button>
              ) : isEnrolled ? (
                <>
                  <button
                    className="bg-green-500 text-white w-2/3 font-bold rounded-full px-6 py-3 cursor-not-allowed"
                    disabled
                  >
                    Enrolled
                  </button>
                  <JoinVideoRoomButton
                    className="mx-auto w-2/3 "
                    RoomId={workshop._id}
                    StartTime={workshop.time}
                    token={token}
                    isAvailable={isAvailable}
                    type="workshop"
                  />
                </>
              ) : (
                <>
                  {/* Booking Summary Card */}
                  <div className="w-full max-w-md bg-surface p-6 rounded-xl shadow-lg border border-default mb-6">
                    <h3 className="text-xl font-bold mb-4 text-primary">
                      Booking Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Mentor</span>
                        <span className="font-semibold text-primary">
                          {workshop.mentor?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Date</span>
                        <span className="font-semibold text-primary">
                          {new Date(workshop.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Time</span>
                        <span className="font-semibold text-primary">
                          {workshop.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary">Duration</span>
                        <span className="font-semibold text-primary">
                          {formatDuration(workshop.duration || 60)}
                        </span>
                      </div>
                      <div className="border-t border-input my-4"></div>
                      <div className="flex justify-between items-center text-lg font-bold text-primary">
                        <span>Price</span>
                        <span>
                          {workshop.price > 0
                            ? `${workshop.price} EGP`
                            : "Free"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Toast Notification */}
                  {registerMsg && (
                    <div
                      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-lg font-semibold ${
                        registerMsg === "Successfully registered!"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{ minWidth: "300px", textAlign: "center" }}
                    >
                      {registerMsg}
                    </div>
                  )}
                  {/* Booking Button */}

                  <button
                    className={`btn-primary px-4 py-2 rounded transition-colors duration-200 w-full mt-2 border-2 ${
                      registering
                        ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                        : "bg-primary text-white border-primary"
                    }`}
                    onClick={() => {
                      if (Number(workshop.price) === 0) {
                        handleRegister();
                      } else {
                        // Use React Router navigation and pass workshop in state
                        navigate("/checkout", {
                          state: {
                            workshopId: workshop._id,
                            slot: workshop.date,
                            time: workshop.time,
                            mentorId: workshop.mentor?._id,
                            sessionTitle: workshop.title,
                            sessionImage: workshop.image,
                            mentorName: workshop.mentor?.name,
                            mentorTitle: workshop.mentor?.title,
                            sessionPrice: workshop.price,
                            sessionDuration: workshop.duration,
                            sessionType: "workshop", // or workshop.type
                            sessionId: workshop._id,
                            isWorkshop: true,
                          },
                        });
                      }
                    }}
                    disabled={registering}
                  >
                    {Number(workshop.price) === 0
                      ? registering
                        ? "Booking..."
                        : "Confirm booking"
                      : "Check out"}
                  </button>

                  <p className="text-xs text-center text-secondary mt-4">
                    By confirming, you agree to our terms and conditions.
                  </p>
                </>
              )}
              {registerMsg && registerMsg !== "Successfully registered!" && (
                <div className="text-red-500 text-center text-sm">
                  {registerMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

function Detail({ label, value }) {
  return (
    <p className="text-sm text-primary">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}

function formatDuration(minutes) {
  const min = Number(minutes);
  if (isNaN(min)) return "-";
  if (min < 60) return `${min} minutes`;
  const hours = Math.floor(min / 60);
  const rem = min % 60;
  return rem === 0
    ? `${hours} hour${hours > 1 ? "s" : ""}`
    : `${hours} hour${hours > 1 ? "s" : ""} ${rem} minutes`;
}
