// Frontend - Checkout Component
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";
import { createPaidSession } from "../../services/bookingServices";
import axiosInstance from "../../services/axios";

import { AuthContext } from "../../contexts/AuthContextProvider";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const stripe = useStripe();
  const elements = useElements();
  // let user = {};

  const {
    slot,
    time,
    mentorId,
    sessionTitle,
    sessionImage,
    mentorName,
    mentorTitle,
    sessionPrice,
    sessionDuration,
    sessionType,
    isWorkshop,
    sessionId,
    workshopId,
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
    const fetchClientSecret = async () => {
      try {
        // Send request to backend to get the client secret
        const data = {
          amount: Number(sessionPrice),
          currency: "usd", // Change this to your required currency
          studentEmail: user.email || "student1@example.com", // Use the student's email dynamically if needed
          mentorId: mentorId,
        };
        const response = await axiosInstance.post(
          "/create-payment-intent",
          data
        );
        console.log(response);

        if (response.data.success) {
          const clientSecret = response.data.clientSecret;
          const mentorStripeId = response.data.mentorStripeId;
          const studentStripeId = response.data.studentStripeId;

          setClientSecret(clientSecret);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message || "Something went wrong", {
          position: "top-center",
        });
      }
    };

    if (sessionPrice) {
      fetchClientSecret(); // Fetch the client secret only when the session price is available
    }
  }, [mentorId, sessionPrice]);

  const handlePay = async () => {
    if (!stripe || !elements || !clientSecret) return;

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    // Validate card input
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      return toast.error("Please fill out all card details.", {
        position: "top-center",
      });
    }

    try {
      setLoading(true);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: user.name || "Ahmed Hassan",
              email: user.email || "student1@example.com",
            },
          },
        }
      );
      if (error) {
        toast.error(error.message || "Payment failed", {
          position: "top-center",
        });
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Call backend to create the booking
        if (isWorkshop) {
          const response = await axiosInstance.post(
            "/workshops/paid-register",
            {
              workshopId: workshopId,
              paymentIntentId: paymentIntent.id,
            }
          );
          console.log(response);
          if (response.data.success) {
            toast.success("Booking successful! Your workshop is confirmed.", {
              position: "top-center",
            });
            navigate("/studentProfile");
          } else {
            toast.error("Booking failed after payment", {
              position: "top-center",
            });
          }
        } else {
          const bookingData = {
            mentorId,
            date: slot.date,
            slots: [slot.time],
            type: "online",
            duration: 60,
            amount: Number(sessionPrice),
            paymentIntentId: paymentIntent.id,
          };
          const bookingResponse = await createPaidSession(bookingData);
          if (bookingResponse.data?.success) {
            toast.success("Booking successful! Your session is confirmed.", {
              position: "top-center",
            });
            navigate("/studentProfile");
          } else {
            toast.error("Booking saved failed after payment", {
              position: "top-center",
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="w-full bg-background">
        <div className="max-w-4xl mx-auto p-6 bg-background">
          <h2 className="text-2xl font-bold text-primary mb-6">Checkout</h2>
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Booking Summary
          </h2>
          <section className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Booking Summary */}
            <div className="space-y-6">
              <div>
                <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4 border border-default">
                  <div className="flex items-center gap-4">
                    <img
                      alt={sessionTitle}
                      className="w-16 h-16 rounded-full object-cover"
                      src={sessionImage}
                    />
                    <div>
                      <p className="font-semibold text-lg text-primary">
                        {isWorkshop ? mentorName : `Session with ${mentorName}`}
                      </p>
                      <p className="text-sm text-secondary">{mentorTitle}</p>
                    </div>
                  </div>
                  <div className="border-t border-default my-4"></div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary">Date:</span>
                      <span className="font-medium text-primary">
                        {slot?.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Day:</span>
                      <span className="font-medium text-primary">
                        {slot?.day}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Time:</span>
                      <span className="font-medium text-primary">
                        {isWorkshop
                          ? time
                          : `${slot?.time.start} - ${slot?.time.end}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Session Type:</span>
                      <span className="font-medium text-primary">
                        {isWorkshop ? sessionType : "1 : 1"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Price:</span>
                      <span className="font-medium text-primary">
                        {isWorkshop
                          ? `${sessionPrice} EGP`
                          : `$${Number(sessionPrice).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="border-t border-default my-2"></div>
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-primary">Total:</span>
                      <span className="text-brand">
                        {isWorkshop
                          ? `${sessionPrice} EGP`
                          : `$${Number(sessionPrice).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column: Card Details */}
            <div>
              <div className="bg-surface p-6 rounded-xl shadow-lg border border-default">
                <h2 className="text-xl font-semibold mb-4 text-primary">
                  Card Details
                </h2>
                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <label className="block mb-1 text-sm font-medium text-secondary">
                      Card Number
                    </label>
                    <div className="p-3 border border-input rounded-lg bg-white">
                      <CardNumberElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              color: "#32325d",
                              "::placeholder": { color: "#a0aec0" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-secondary">
                        Expiration Date
                      </label>
                      <div className="p-3 border border-input rounded-lg bg-white">
                        <CardExpiryElement
                          options={{
                            style: {
                              base: {
                                fontSize: "16px",
                                color: "#32325d",
                                "::placeholder": { color: "#a0aec0" },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-secondary">
                        CVC
                      </label>
                      <div className="p-3 border border-input rounded-lg bg-white">
                        <CardCvcElement
                          options={{
                            style: {
                              base: {
                                fontSize: "16px",
                                color: "#32325d",
                                "::placeholder": { color: "#a0aec0" },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading || !clientSecret}
                      onClick={handlePay}
                      className={`w-full py-3 px-4 rounded cursor-pointer text-white font-medium ${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary hover:bg-primary-dark"
                      }`}
                    >
                      {loading ? "Processing..." : "Pay & Book Now"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
