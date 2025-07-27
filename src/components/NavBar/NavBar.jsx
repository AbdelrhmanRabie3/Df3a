import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { ThemeContext } from "../../contexts/ThemeContextProvider";
import { FaEnvelope, FaSun } from "react-icons/fa";
import { IoMoon } from "react-icons/io5";
import { AuthContext } from "../../contexts/AuthContextProvider";
import { ChatContext } from "../../contexts/ChatContextProvider";
import Cookies from "js-cookie";

function NavBar() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { user, setUser, setToken } = useContext(AuthContext);
  const { getTotalUnreadCount, notification, chats } = useContext(ChatContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const loggenInUser = JSON.parse(Cookies.get("user") || null);

  useEffect(() => {
    const count = getTotalUnreadCount();
    setUnreadCount(count);
  }, [getTotalUnreadCount, notification, chats]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    navigate("/");
    Cookies.remove("user");
    Cookies.remove("token");
  };

  return (
    <>
      <nav className="bg-background fixed w-full z-20 top-0 start-0  border-color">
        <div className="max-w-[98%] flex flex-wrap items-center justify-between mx-auto p-4">
          <NavLink
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <svg
              className="h-8 w-8 text-brand "
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                fill="currentColor"
              ></path>
            </svg>
            <span className="font-poppins  text-2xl font-bold text-primary">
              Df3a
            </span>
          </NavLink>
          <div className="flex md:order-2  md:ms-0 items-center md:gap-4 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {user ? (
              <>
                <div className="relative">
                  <Link to={"/chat"}>
                    <FaEnvelope
                      size={24}
                      className="text-brand hover:text-brand-dark transition-colors"
                    />
                  </Link>

        
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium border-2 border-background animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex h-12 min-w-[100px] items-center btn-primary justify-center rounded-lg px-6 text-base  shadow-md hover:!bg-red-700 "
                >
                  logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={"/login"}
                  className="font-poppins text-base hidden md:block font-medium link-primary link-primary:hover cursor-pointer "
                >
                  Log in
                </Link>
                <Link
                  to={"/Signup"}
                  className="flex h-12 min-w-[110px] items-center btn-primary justify-center rounded-lg px-6 text-base  shadow-md btn-primary:hover"
                >
                  Sign Up
                </Link>
              </>
            )}

            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-secondary rounded-lg md:hidden hover-secondary:hover focus:outline-none focus:ring-2 focus:ring-gray-200  dark:focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>

            {isDark ? (
              <FaSun
                size={24}
                className="text-brand hover:rotate-45 duration-100"
                onClick={toggleTheme}
              />
            ) : (
              <IoMoon
                size={24}
                className="text-brand hover:rotate-45 duration-100"
                onClick={toggleTheme}
              />
            )}
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-color rounded-lg bg-background md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
              <li>
                <NavLink
                  to="/FindMentors"
                  className="block py-2 px-3 font-poppins text-base font-medium link-primary link-primary:hover md:p-0 "
                  aria-current="page"
                >
                  Find Mentors
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/workshops"
                  className="block py-2 px-3 font-poppins text-base font-medium link-primary link-primary:hover md:p-0"
                >
                  Workshops
                </NavLink>
              </li>
              {loggenInUser?.role === "student" && (
                <Link
                  to={"/studentprofile"}
                  className="block py-2 px-3 font-poppins text-base font-medium link-primary link-primary:hover md:p-0 "
                >
                  Profile
                </Link>
              )}
              {loggenInUser?.role === "mentor" && (
                <Link
                  to={"/mentordashboard"}
                  className="block py-2 px-3 font-poppins text-base font-medium link-primary link-primary:hover md:p-0 "
                >
                  Dashboard
                </Link>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;