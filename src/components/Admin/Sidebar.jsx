import React from "react";
import { NavLink } from "react-router";

export default function Sidebar() {
  return (
    <div className="sidebar h-screen w-80 flex flex-col border-default bg-surface">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-theme " +
              (isActive
                ? "bg-green-100 text-green-700"
                : "text-secondary hover:bg-green-50 hover:text-green-700")
            }
          >
            <svg
              className="text-brand"
              fill="currentColor"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 10.75L12 4l9 6.75V19a2 2 0 0 1-2 2h-2.5a.5.5 0 0 1-.5-.5V15a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.5a.5.5 0 0 1-.5.5H5a2 2 0 0 1-2-2V10.75Z" />
            </svg>
            <p className="text-sm font-medium">Dashboard</p>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-theme " +
              (isActive
                ? "bg-green-100 text-green-700"
                : "text-secondary hover:bg-green-50 hover:text-green-700")
            }
          >
            <svg
              className="text-brand"
              fill="currentColor"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 7a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm8 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8 2a4 4 0 0 0-4 4v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a4 4 0 0 0-4-4Zm8 1a3 3 0 0 0-2.83 2h5.66A3 3 0 0 0 15 13Z" />
            </svg>
            <p className="text-sm font-medium">Users</p>
          </NavLink>
          <NavLink
            to="/admin/mentors"
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-theme " +
              (isActive
                ? "bg-green-100 text-green-700"
                : "text-secondary hover:bg-green-50 hover:text-green-700")
            }
          >
            {/* Mentors Icon */}
            <svg
              className="text-brand"
              fill="currentColor"
              height="24px"
              viewBox="0 0 256 256"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M64.12,147.8a4,4,0,0,1-4,4.2H16a8,8,0,0,1-7.8-6.17,8.35,8.35,0,0,1,1.62-6.93A67.79,67.79,0,0,1,37,117.51a40,40,0,1,1,66.46-35.8,3.94,3.94,0,0,1-2.27,4.18A64.08,64.08,0,0,0,64,144C64,145.28,64,146.54,64.12,147.8Zm182-8.91A67.76,67.76,0,0,0,219,117.51a40,40,0,1,0-66.46-35.8,3.94,3.94,0,0,0,2.27,4.18A64.08,64.08,0,0,1,192,144c0,1.28,0,2.54-.12,3.8a4,4,0,0,0,4,4.2H240a8,8,0,0,0,7.8-6.17A8.33,8.33,0,0,0,246.17,138.89Zm-89,43.18a48,48,0,1,0-58.37,0A72.13,72.13,0,0,0,65.07,212,8,8,0,0,0,72,224H184a8,8,0,0,0,6.93-12A72.15,72.15,0,0,0,157.19,182.07Z" />
            </svg>
            <p className="text-sm font-medium">Mentors</p>
          </NavLink>
          <NavLink
            to="/admin/workshops"
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-theme " +
              (isActive
                ? "bg-green-100 text-green-700"
                : "text-secondary hover:bg-green-50 hover:text-green-700")
            }
          >
            {/* Workshops Icon - modern presentation icon */}
            <svg
              className="text-brand"
              fill="currentColor"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-7v2.09a3.001 3.001 0 1 1-2 0V15H4a1 1 0 0 1-1-1V4Zm2 1v8h14V5H5Z" />
            </svg>
            <p className="text-sm font-medium">Workshops</p>
          </NavLink>
          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-theme " +
              (isActive
                ? "bg-green-100 text-green-700"
                : "text-secondary hover:bg-green-50 hover:text-green-700")
            }
          >
            {/* Reviews Icon */}
            <svg
              className="text-brand"
              fill="currentColor"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            <p className="text-sm font-medium">Reviews</p>
          </NavLink>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-theme " +
              (isActive
                ? "bg-green-100 text-green-700"
                : "text-secondary hover:bg-green-50 hover:text-green-700")
            }
          >
            {/* Reports Icon */}
            <svg
              className="text-brand"
              fill="currentColor"
              viewBox="0 0 24 24"
              height="24px"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} stroke="currentColor" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            <p className="text-sm font-medium">Reports</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
