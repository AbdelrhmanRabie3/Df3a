import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

import {
  addAvailability,
  removeAvailability,
  fetchAvailability,
} from "../../services/profileService";
import "react-calendar/dist/Calendar.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

const MentorAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [availability, setAvailability] = useState([]);
  const [recurringWeekday, setRecurringWeekday] = useState("");
  const [recurringStart, setRecurringStart] = useState("");
  const [recurringEnd, setRecurringEnd] = useState("");
  const [recurringDay, setRecurringDay] = useState("");
  const [recurringWeeks, setRecurringWeeks] = useState(4);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const hourOptions = Array.from({ length: 23 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    return `${hour}:00`;
  });

  useEffect(() => {
    const loadAvailability = async () => {
      const data = await fetchAvailability();
      if (data?.availability) {
        setAvailability(data.availability);
      }
    };
    loadAvailability();
  }, []);

  const refreshAvailability = async () => {
    const data = await fetchAvailability();
    if (data?.availability) {
      setAvailability(data.availability);
    }
  };

  const getDayName = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "long" });

  const selectedDateStr = selectedDate?.toLocaleDateString("en-CA");
  const selectedDaySlots =
    availability.find((a) => a.date === selectedDateStr)?.slots || [];

  const handleAddSlot = async () => {
    if (!slotStart || !slotEnd || !selectedDateStr) return;

    const startHour = parseInt(slotStart.split(":")[0], 10);
    const endHour = parseInt(slotEnd.split(":")[0], 10);
    if (startHour >= endHour) {
      toast.error("Start time must be before end time");
      return;
    }

    const newSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const from = `${String(hour).padStart(2, "0")}:00`;
      const to = `${String(hour + 1).padStart(2, "0")}:00`;
      newSlots.push({ start: from, end: to });
    }

    const existingDay = availability.find((a) => a.date === selectedDateStr);
    const existingSlots = existingDay?.slots || [];

    const nonDuplicateSlots = newSlots.filter((newSlot) => {
      return !existingSlots.some(
        (existing) =>
          (newSlot.start >= existing.start && newSlot.start < existing.end) ||
          (newSlot.end > existing.start && newSlot.end <= existing.end) ||
          (newSlot.start <= existing.start && newSlot.end >= existing.end)
      );
    });

    if (nonDuplicateSlots.length === 0) {
      toast("Selected time overlaps or already exists.", {
        icon: "⚠️",
      });
      return;
    }

    try {
      await addAvailability(
        selectedDateStr,
        getDayName(selectedDateStr),
        nonDuplicateSlots
      );
      await refreshAvailability();
      setSlotStart("");
      setSlotEnd("");
      toast.success("Slots added successfully!");
    } catch (error) {
      console.error("Add slot failed:", error);
      toast.error("Failed to add slots. Please try again.");
    }
  };

  const handleRemoveSlot = async (slotToRemove) => {
    try {
      await removeAvailability(selectedDateStr, getDayName(selectedDateStr), [
        slotToRemove,
      ]);
      await refreshAvailability();
    } catch (error) {
      console.error("Remove slot failed:", error);
    }
  };

  const handleAddRecurringSlots = async () => {
    if (!recurringDay || !slotStart || !slotEnd || !recurringWeeks) {
      toast.error("Please complete all fields.");
      return;
    }

    const startHour = parseInt(slotStart.split(":")[0], 10);
    const endHour = parseInt(slotEnd.split(":")[0], 10);
    if (startHour >= endHour) {
      toast.error("Start time must be before end time");
      return;
    }

    const today = new Date();
    const allDates = [];

    for (let i = 0; i < recurringWeeks * 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (
        d.toLocaleDateString("en-US", { weekday: "long" }) === recurringDay &&
        d >= today
      ) {
        allDates.push(new Date(d));
      }
    }

    const newSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const from = `${String(hour).padStart(2, "0")}:00`;
      const to = `${String(hour + 1).padStart(2, "0")}:00`;
      newSlots.push({ start: from, end: to });
    }

    try {
      for (const date of allDates) {
        const dateStr = date.toLocaleDateString("en-CA");
        const dayName = getDayName(dateStr);
        await addAvailability(dateStr, dayName, newSlots);
      }
      toast.success(`Recurring slots added for ${recurringDay}`);
      await refreshAvailability();
    } catch (error) {
      console.error("Recurring add failed:", error);
      toast.error("Failed to add recurring slots.");
    }
  };

  const handleRemoveRecurringSlots = async () => {
    if (!recurringDay || !slotStart || !slotEnd || !recurringWeeks) {
      toast.error("Complete all fields for deletion.");
      return;
    }

    const startHour = parseInt(slotStart.split(":")[0], 10);
    const endHour = parseInt(slotEnd.split(":")[0], 10);
    if (startHour >= endHour) {
      toast.error("Invalid time range");
      return;
    }

    const today = new Date();
    const allDates = [];

    for (let i = 0; i < recurringWeeks * 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (
        d.toLocaleDateString("en-US", { weekday: "long" }) === recurringDay &&
        d >= today
      ) {
        allDates.push(new Date(d));
      }
    }

    const slotsToRemove = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const from = `${String(hour).padStart(2, "0")}:00`;
      const to = `${String(hour + 1).padStart(2, "0")}:00`;
      slotsToRemove.push({ start: from, end: to });
    }

    try {
      for (const date of allDates) {
        const dateStr = date.toLocaleDateString("en-CA");
        const dayName = getDayName(dateStr);
        await removeAvailability(dateStr, dayName, slotsToRemove);
      }
      toast.success(`Recurring slots removed for ${recurringDay}`);
      await refreshAvailability();
    } catch (error) {
      console.error("Recurring delete failed:", error);
      toast.error("Failed to remove recurring slots.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Availability Management
        </h1>
        <p className="text-gray-600">
          Set your available time slots for mentoring sessions
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div className="bg-surface rounded-lg shadow  p-6">
          <h2 className="text-xl font-semibold  mb-4">Select Date</h2>

          <div className="mb-6 bg-surface">
            <Calendar
          
              onClickDay={(value) => setSelectedDate(value)}
              tileDisabled={({ date }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                date.setHours(0, 0, 0, 0);
                return date <= today;
              }}
              tileClassName={({ date }) => {
                const dateStr = date.toLocaleDateString("en-CA");
                return availability.some((a) => a.date === dateStr)
                  ? "has-availability"
                  : "";
              }}
              tileContent={({ date }) => {
                const dateStr = date.toLocaleDateString("en-CA");
                if (availability.some((a) => a.date === dateStr)) {
                  return (
                    <div className="flex justify-center mt-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  );
                }
                return null;
              }}
              className="w-full bg-surface p-4 rounded shadow "
            />
          </div>

          {/* Time Slot Management */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium  mb-4">
              {selectedDateStr
                ? `Time Slots for ${selectedDate?.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`
                : "Select a date to manage time slots"}
            </h3>

            {selectedDateStr && (
              <>
                {/* Add Time Slot */}
                <div className="bg-surface-elevated rounded-lg p-4 mb-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      value={slotStart}
                      onChange={(e) => {
                        setSlotStart(e.target.value);
                        setSlotEnd("");
                      }}
                      className="px-3 py-2 border bg-surface-elevated border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Start Time</option>
                      {hourOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <span className="text-gray-500 text-sm font-medium">
                      to
                    </span>

                    <select
                      value={slotEnd}
                      onChange={(e) => setSlotEnd(e.target.value)}
                      className="px-3 py-2 border bg-surface-elevated border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">End Time</option>
                      {hourOptions
                        .filter((time) => time > slotStart)
                        .map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={handleAddSlot}
                      disabled={!slotStart || !slotEnd}
                      className="px-4 py-2 btn-primary text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Slot
                    </button>
                  </div>
                </div>

                {/* Display Slots */}
                <div>
                  {selectedDaySlots.length > 0 ? (
                    selectedDaySlots.length > 2 ? (
                      // Vertical slider for more than 3 slots
                      <div className="relative">
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {selectedDaySlots.map((slot, idx) => (
                            <div
                              key={idx}
                              className="flex items-center bg-surface-elevated justify-between  border border-emerald-200 rounded-lg px-4 py-3  transition-colors"
                            >
                              <span className="font-medium ">
                                {slot.start} - {slot.end}
                              </span>
                              <button
                                onClick={() => handleRemoveSlot(slot)}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Remove slot"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs  mt-2 text-center">
                          {selectedDaySlots.length} slots available • Scroll to
                          see all
                        </div>
                      </div>
                    ) : (
                      // Normal layout for 3 or fewer slots
                      <div className="space-y-2">
                        {selectedDaySlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex items-center bg-surface-elevated justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 hover:bg-emerald-100 transition-colors"
                          >
                            <span className="font-medium ">
                              {slot.start} - {slot.end}
                            </span>
                            <button
                              onClick={() => handleRemoveSlot(slot)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Remove slot"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 text-sm py-4 text-center">
                      No time slots set for this date
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* All Availability Summary */}
          <div className="bg-surface rounded-lg shadow   p-6">
            <h3 className="text-xl font-semibold  mb-4">All Availability</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availability.length > 0 ? (
                availability.map((day, i) => (
                  <div
                    key={i}
                    className="border-l-4 border-blue-400 bg-surface-elevated pl-3 py-2 bg-blue-50 rounded"
                  >
                    <div className="font-medium ">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {day.slots?.length || 0} time slot
                      {day.slots?.length !== 1 ? "s" : ""} available
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  No availability set yet
                </p>
              )}
            </div>
          </div>

          {/* Recurring Slots */}
          <div className="bg-surface rounded-lg shadow   p-6">
            <h3 className="text-xl font-semibold  mb-4">
              Recurring Weekly Slots
            </h3>

            <div className="bg-gray-50 bg-surface-elevated rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(e.target.value)}
                  className="px-3 py-2 bg-surface-elevated border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  max={12}
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(parseInt(e.target.value))}
                  placeholder="Number of weeks"
                  className="px-3 py-2 bg-surface-elevated border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex  flex-wrap gap-3 items-center">
                <select
                  value={slotStart}
                  onChange={(e) => {
                    setSlotStart(e.target.value);
                    setSlotEnd("");
                  }}
                  className="px-3 py-2 bg-surface-elevated border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Start Time</option>
                  {hourOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>

                <span className="text-sm font-medium">to</span>

                <select
                  value={slotEnd}
                  onChange={(e) => setSlotEnd(e.target.value)}
                  className="px-3 py-2 bg-surface-elevated border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">End Time</option>
                  {hourOptions
                    .filter((time) => time > slotStart)
                    .map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleAddRecurringSlots}
                  disabled={!recurringDay || !slotStart || !slotEnd}
                  className="px-4 py-2 btn-primary rounded-md text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Recurring Slots
                </button>

                <button
                  onClick={handleRemoveRecurringSlots}
                  disabled={!recurringDay || !slotStart || !slotEnd}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Remove Recurring Slots
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorAvailability;
