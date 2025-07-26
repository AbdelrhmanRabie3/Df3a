import React, { useState } from "react";

export default function StudentSlider({
  students,
  workshop,
  handleOpenReportModal,
  reportedMap = {},
}) {
  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 2;
  const canGoLeft = startIdx > 0;
  const canGoRight = startIdx + visibleCount < students.length;

  const handleLeft = () => {
    if (canGoLeft) setStartIdx(startIdx - 1);
  };
  const handleRight = () => {
    if (canGoRight) setStartIdx(startIdx + 1);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 shadow-sm">
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-primary shadow transition hover:bg-primary hover:text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={handleLeft}
        disabled={!canGoLeft}
        aria-label="Scroll left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
        {students.slice(startIdx, startIdx + visibleCount).map((student) => (
          <div
            key={student._id}
            className="flex flex-col items-center border border-gray-200 rounded-lg p-3 min-w-[120px] bg-white shadow-sm"
          >
            <span className="mb-2 font-semibold text-primary text-sm">
              {student.name}
            </span>
            {!reportedMap[student._id] && workshop.status === "completed" ? (
              <button
                className="btn-danger px-2 py-1 rounded text-xs mt-1"
                onClick={() => handleOpenReportModal(student, workshop)}
              >
                Report Student
              </button>
            ) : reportedMap[student._id] && workshop.status === "completed" ? (
              <span className="text-green-600 font-semibold text-xs mt-1">
                Reported
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-primary shadow transition hover:bg-primary hover:text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={handleRight}
        disabled={!canGoRight}
        aria-label="Scroll right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
