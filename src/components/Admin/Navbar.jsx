import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContextProvider'
import { useNavigate } from 'react-router';

export default function Navbar() {
  const { user, setUser, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    setToken && setToken(null);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header-glass bg-surface shadow-lg rounded-lg sticky top-0 z-10 flex h-20 items-center justify-between border-default border-b px-8 py-4 transition-theme">
      <div className="flex items-center gap-4">
        <div className="text-primary">
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
        </div>
        <span className="font-poppins text-2xl font-bold text-primary">
          Df3a Admin Panel
        </span>
      </div>
      <div className="flex items-center gap-6">
        {/* User Icon and Name only, no dropdown */}
        <div className="flex items-center gap-2">
          <div className="size-10 flex items-center justify-center rounded-full bg-primary-light border border-default">
            <svg className="w-7 h-7 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z" />
            </svg>
          </div>
          <span className="text-primary font-medium text-base select-none">{user?.name || 'Admin'}</span>
          <button
            onClick={handleLogout}
            className="flex h-12 min-w-[110px] items-center btn-primary justify-center rounded-lg px-6 text-base  shadow-md hover:!bg-red-700 m-2"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
