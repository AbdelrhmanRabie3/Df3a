import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar/NavBar";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { createFreeBooking, getAvailability } from "../../services/bookingServices";
import { toast } from 'react-toastify';
import { getReviewsByTarget } from "../../services/getAllData";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Footer from './../../components/Footer/Footer';

function Booking(props) {

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  // Mentor Data
  const mentor = location.state?.mentor || props.mentor || {};
  const {
    name: mentorName = "",
    title: mentorTitle = "",
    price = 0,
    image: mentorAvatar = "",
    rating: mentorRating = 0,
    bio: mentorBio = "",
    expertise: mentorExpertise = [],
    languages: mentorLanguages = [],
    availability: mentorAvailability = []
  } = mentor;


  const [selectedSlot, setSelectedSlot] = useState({ date: "", time: null });
  const [selectedDay, setSelectedDay] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  // Availability
  const [availability, setAvailability] = useState(
    []
  );

  // Filtered latest 5 days
  const latestAvailability = availability
    .filter(slot => Array.isArray(slot.slots) && slot.slots.length > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Total price (fixed session time)
  const totalPrice = price.toFixed(2);

  // Fetch reviews on mount
  useEffect(() => {
    const fetchMentorReviews = async () => {
      setLoadingReviews(true);
      try {
        if (mentor && mentor._id) {
          const response = await getReviewsByTarget("mentor", mentor._id);
          setReviews(response);
        }
      } catch (error) {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    const fetchAvailability = async () => {
      try {
        const response = await getAvailability(mentor._id);
        console.log("Availability fetched:", response.availability);
        mentor.availability = response.availability;
        setAvailability(response.availability);
      } catch (error) {
        console.error("❌ Error fetching availability:", error);
      }
    };
    fetchMentorReviews();
    fetchAvailability();

  }, [mentor]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);


  // handler of free booking 
  const handleFreeBooking = async () => {

    const bookingData = {
      mentorId: mentor._id,
      date: selectedSlot.date,
      slots: [selectedSlot.time],
      type: "online",
      duration: 60,
      price: Number(totalPrice),
    };

    try {
      const result = await createFreeBooking(bookingData);
      setAvailability((prev) =>
        prev
          .map((dayObj) => {
            if (dayObj.date === selectedSlot.date) {
              const newSlots = dayObj.slots.filter(
                (slot) =>
                  slot.start !== selectedSlot.time.start || slot.end !== selectedSlot.time.end
              );
              return { ...dayObj, slots: newSlots };
            }
            return dayObj;
          })
          .filter((dayObj) => dayObj.slots.length > 0)
      );
      setSelectedSlot({ day: "", date: "", time: "" });
    } catch (err) {
      console.log(err);
    } finally {
      toast.success("Booking successful! Your session is confirmed.", { position: 'top-center' });
      navigate("/studentProfile");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <NavBar></NavBar>
        </nav>
      </header>
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mentor Card */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="w-32 h-32 rounded-full bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('${mentorAvatar}')` }}
                ></div>
                <div className="text-center sm:text-left w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl font-bold text-primary">
                      {mentorName}
                    </h2>
                    {/* Verified Badge */}
                    {mentor.verified && (
                      <svg
                        className="w-6 h-6 text-brand"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          clipRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a.75.75 0 00-1.06-1.06l-3.89 3.889-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.44-4.44z"
                          fillRule="evenodd"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-lg text-secondary">{mentorTitle}</p>
                  <p className="text-base font-semibold text-brand mt-1">
                    {price === 0
                      ? "0 EGP/hr (Free)"
                      : `${price} EGP/hr`}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start mt-2 gap-1">
                    {/* Star Icon */}
                    <svg
                      className="w-5 h-5 text-amber"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <p className="text-base font-semibold text-primary">
                      {mentorRating}{" "}
                      <span className="font-normal text-secondary">
                        ({reviews.length} reviews)
                      </span>
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-secondary">{mentorBio}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mentorExpertise.map((exp, i) => (
                      <span
                        key={i}
                        className="bg-surface text-secondary shadow text-xs font-medium px-3.5 py-1 rounded-full"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mentorLanguages.map((lang, i) => (
                      <span
                        key={i}
                        className="bg-surface text-secondary shadow text-xs font-medium px-3.5 py-1 rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Availability Time Card */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-6 text-primary">Availability Time</h3>
              {latestAvailability.length === 0 ? (
                <div className="text-center text-secondary py-8">
                  Mentor not available now
                </div>
              ) : (
                <>
                  {/* Latest 5 Days */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {latestAvailability.map((day) => (
                      <button
                        key={day._id}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg border ${selectedDay?.date === day.date
                          ? 'bg-green-500 text-white'
                          : 'bg-surface text-primary'
                          }`}
                      >
                        <div className="font-semibold">{day.day}</div>
                        <div className="text-sm">{day.date}</div>
                      </button>
                    ))}

                    {availability.length > 5 && (
                      <button
                        onClick={() => setShowModal(true)}
                        className={`px-4 py-2 rounded-lg border bg-brand text-black`}
                      >
                        <div className="font-semibold">View More</div>
                        <div className="text-sm">Dates</div>
                      </button>
                    )}
                  </div>
                  {/* Slots */}
                  {selectedDay && (
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                      {selectedDay.slots.map((slot) => (
                        <button
                          key={slot._id}
                          className={`px-4 py-2 rounded-lg font-medium text-white ${selectedSlot?.time?.start === slot.start
                            ? 'bg-green-600 ring-2 ring-brand'
                            : 'bg-green-500 hover:bg-green-600'
                            }`}
                          onClick={() =>
                            setSelectedSlot({
                              date: selectedDay.date,
                              day: selectedDay.day,
                              time: slot,
                            })
                          }
                        >
                          {slot.start} - {slot.end}
                        </button>
                      ))}
                    </div>
                  )}

                </>
              )}
            </div>


            {/* Calendar Modal */}
            {showModal && (
              <div
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
                onClick={() => {
                  setShowModal(false);
                  document.body.style.overflow = 'auto';
                }}
              >
                <div
                  className="bg-white dark:bg-gray-900 text-primary dark:text-white w-full max-w-2xl rounded-2xl shadow-2xl relative p-6 md:p-8 border border-gray-200 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-red-600 text-2xl"
                    onClick={() => {
                      setShowModal(false);
                      document.body.style.overflow = 'auto';
                    }}
                    aria-label="Close"
                  >
                    &times;
                  </button>

                  {/* Modal Title */}
                  <h2 className="text-center text-2xl md:text-3xl font-bold text-primary dark:text-white mb-6">
                    Select Available Date
                  </h2>

                  {/* Calendar */}
                  <div className="flex justify-center">
                    <Calendar
                      onClickDay={(value) => {
                        const dateStr = value.toLocaleDateString('en-CA');
                        const selected = availability.find((a) => a.date === dateStr);
                        if (selected) setSelectedDay(selected);
                      }}
                      tileDisabled={({ date }) => {
                        const dateStr = date.toLocaleDateString('en-CA');
                        return !availability.some((a) => a.date === dateStr);
                      }}
                      tileClassName={({ date }) => {
                        const dateStr = date.toLocaleDateString('en-CA');
                        return availability.some((a) => a.date === dateStr)
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 font-semibold rounded'
                          : '';
                      }}
                      minDate={new Date()}
                      maxDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
                      className="rounded-lg shadow-sm p-2 dark:bg-gray-800"
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="mt-6">
                    {selectedDay ? (
                      <>
                        <h3 className="text-lg font-semibold text-primary dark:text-white mb-3">
                          {selectedDay.date} ({selectedDay.day}) Slots:
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {selectedDay.slots.map((slot) => (
                            <button
                              key={slot._id}
                              onClick={() =>
                                setSelectedSlot({
                                  date: selectedDay.date,
                                  day: selectedDay.day,
                                  time: slot,
                                })
                              }
                              className={`px-4 py-2 text-sm rounded-lg font-medium transition ${selectedSlot?.time?.start === slot.start
                                ? 'bg-brand text-black ring-2 ring-brand-dark'
                                : 'bg-surface text-primary dark:text-white hover:bg-brand hover:text-white'
                                }`}
                            >
                              {slot.start} - {slot.end}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-secondary dark:text-gray-400 mt-4">
                        Select a date to see available slots.
                      </p>
                    )}
                  </div>

                  {/* Done Button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => {
                        if (selectedSlot) {
                          setShowModal(false);
                          document.body.style.overflow = 'auto';
                        } else {
                          alert('Please select a time slot.');
                        }
                      }}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}





            {/* Reviews Section */}
            <div className="card p-6 mt-4 h-32 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-primary">Reviews</h3>
              {loadingReviews ? (
                <div className="text-secondary">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-secondary">No reviews yet.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-default pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">
                          {review.reviewerName || "Anonymous"}
                        </span>
                        <span className="text-amber-500 font-bold">
                          {"★".repeat(Math.round(review.rating || 0))}
                        </span>
                      </div>
                      <div className="text-secondary text-sm">
                        {review.comment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Right Side - Booking Summary */}
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-4 text-primary">Booking Summary</h3>

            <div className="space-y-4">
              {/* Mentor */}
              <div className="flex justify-between items-center">
                <span className="text-secondary">Mentor</span>
                <span className="font-semibold text-primary">{mentorName}</span>
              </div>

              {/* Day */}
              <div className="flex justify-between items-center">
                <span className="text-secondary">Date</span>
                <span className="font-semibold text-primary">
                  {selectedSlot?.date
                    ? new Date(selectedSlot.date).toLocaleDateString('en-GB') // Format date dd/mm/yyyy
                    : "---"}
                </span>
              </div>

              {/* Day Name */}
              <div className="flex justify-between items-center">
                <span className="text-secondary">Day</span>
                <span className="font-semibold text-primary">
                  {selectedSlot?.date
                    ? new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'long' })
                    : "---"}
                </span>
              </div>

              {/* Time */}
              <div className="flex justify-between items-center">
                <span className="text-secondary">Time</span>
                <span className="font-semibold text-primary">
                  {selectedSlot?.time
                    ? `${selectedSlot.time.start} - ${selectedSlot.time.end}`
                    : "---"}
                </span>
              </div>

              <div className="border-t border-input my-4"></div>

              {/* Price */}
              <div className="flex justify-between items-center text-lg font-bold text-primary">
                <span>Price</span>
                <span>{totalPrice} EGP</span>
              </div>
            </div>

            {/* Toast */}
            {/* {toast.show && (
              <div
                className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white text-lg font-semibold ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                  }`}
                style={{ minWidth: "300px", textAlign: "center" }}
              >
                {toast.message}
              </div>
            )} */}

            {/* Checkout Button */}
            <button
              className={`btn-primary px-4 py-2 rounded w-full mt-6 border-2 ${!selectedSlot.date || !selectedSlot.time
                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-primary text-white border-primary'
                }`}
              // disabled={!selectedSlot.date || !selectedSlot.time}
              onClick={() => {
                if (!selectedSlot.date || !selectedSlot.time) {
                  toast.error("please select day and time", { position: 'top-center' });
                  return;
                }

                if (Number(totalPrice) === 0) {
                  handleFreeBooking();
                } else {
                  navigate("/checkout", {
                    state: {
                      slot: selectedSlot,
                      mentorId: mentor._id,
                      // sessionId: sessionId, // the actual session _id
                      sessionTitle: mentor?.sessionTitle,
                      sessionImage: mentor?.image,
                      mentorName: mentor?.name,
                      mentorTitle: mentor?.title,
                      sessionPrice: mentor?.price,
                      sessionDuration: mentor?.duration,
                      sessionType: mentor?.sessionType,
                      isWorkshop: false,
                    },
                  });
                }
              }}
            >
              {Number(totalPrice) === 0 ? 'Confirm Booking' : 'Checkout'}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-secondary mt-4 mb-8">
              By confirming, you agree to our terms and conditions.
            </p>

            {/* Stretch lower area */}
            <div className="h-32"></div>
          </div>


        </div>
      </main>
      <Footer></Footer>
    </div>
  );
}
export default Booking;
