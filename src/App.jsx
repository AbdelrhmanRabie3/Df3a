import { Route, Routes } from "react-router";
import Home from "./pages/Home/Home";

import LayOut from "./components/LayOut/LayOut";
import Login from "./pages/Login/Login";
import Signup from "./pages/Register/Signup";

import Dashboard from "./pages/Admin/Dashboard";
import Mentors from "./pages/Admin/Mentors";
import Users from "./pages/Admin/Users";
import Reviews from "./pages/Admin/Reviews";
import FindMentors from "./pages/FindMentors/FindMentors";
import MentorDetails from "./pages/MentorDetails/MentorDetails";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";

import AdminWorkshops from "./pages/Admin/AdminWorkshops";
import Workshops from "./pages/Workshops/Workshops";
import Profile from "./pages/Profile/Profile";
import Booking from "./pages/booking/Booking";
import CreateWorkshop from "./pages/CreateWorkshop/CreateWorkshop";
import WorkshopDetails from "./pages/WorkshopDetails/WorkshopDetails";

import MentorDashboard from "./pages/MentorDashboard/MentorDashboard";

import Checkout from "./pages/Checkout/Checkout";

import StudentProfile from "./pages/StudentProfile/StudentProfile";

import ResetPassword from "./pages/ResetPassword/ResetPassword";

import LoginSuccess from "./pages/Login/LoginSuccess";
import ChooseRole from "./pages/Login/ChooseRole";

import Chat from "./pages/Chat/Chat";
import VideoCall from "./pages/Video/VideoCall";

import { ToastContainer } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

import Reports from "./pages/Admin/Reports";
import AdminProtect from "./components/Protect/AdminProtect";
import NotFound from "./components/NotFound/NotFound";
import MentorProtect from "./components/Protect/MentorProtect";
import StudentProtect from "./components/Protect/StudentProtect";
import UserProtect from "./components/Protect/UserProtect";
import AuthProtect from "./components/Protect/AuthProtect";

function App() {
  return (
    <>
      <ToastContainer autoClose={3000} />
      <Routes>
        <Route element={<LayOut />}>
          <Route path="/" element={<Home />} />

          <Route path="/findMentors" element={<FindMentors />} />
          <Route
            path="/mentorDetails/:id"
            element={
              <UserProtect>
                <MentorDetails />
              </UserProtect>
            }
          />
          <Route path="/workshops" element={<Workshops />} />
          <Route
            path="/workshops/:id"
            element={
              <UserProtect>
                <WorkshopDetails />
              </UserProtect>
            }
          />
          <Route
            path="/createworkshop"
            element={
              <MentorProtect>
                <CreateWorkshop />
              </MentorProtect>
            }
          />

          <Route
            path="/profile"
            element={
              <UserProtect>
                <Profile />
              </UserProtect>
            }
          />

          <Route
            path="/studentprofile"
            element={
              <StudentProtect>
                <StudentProfile />
              </StudentProtect>
            }
          />
        </Route>
        <Route
          path="/chat"
          element={
            <UserProtect>
              <Chat />
            </UserProtect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthProtect>
              <Signup />
            </AuthProtect>
          }
        />
        <Route
          path="/login"
          element={
            <AuthProtect>
              <Login />
            </AuthProtect>
          }
        />
        <Route
          path="/forgotPassword"
          element={
            <AuthProtect>
              <ForgotPassword />
            </AuthProtect>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtect>
              <Dashboard />
            </AdminProtect>
          }
        />
        <Route
          path="/admin/mentors"
          element={
            <AdminProtect>
              <Mentors />
            </AdminProtect>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtect>
              <Users />
            </AdminProtect>
          }
        />
        <Route
          path="/admin/workshops"
          element={
            <AdminProtect>
              <AdminWorkshops />
            </AdminProtect>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminProtect>
              <Reviews />
            </AdminProtect>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminProtect>
              <Reports />
            </AdminProtect>
          }
        />
        <Route
          path="/mentor/booking"
          element={
            <UserProtect>
              <Booking />
            </UserProtect>
          }
        />
        <Route
          path="/checkout"
          element={
            <Elements stripe={stripePromise}>
              <Checkout />
            </Elements>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />{" "}
        <Route
          path="/videocall"
          element={
            <UserProtect>
              <VideoCall />
            </UserProtect>
          }
        />
        <Route path="/login/success" element={<LoginSuccess />} />
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route
          path="/mentordashboard"
          element={
            <MentorProtect>
              <MentorDashboard />
            </MentorProtect>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
