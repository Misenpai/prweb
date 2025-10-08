"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Holiday } from "../types";
import { api } from "../utils/api";

interface EmployeeCalendarModalProps {
  user: User;
  month: number;
  year: number;
  onClose: () => void;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  status: "present" | "absent" | "holiday" | "weekend" | "empty";
  description?: string;
}

export default function EmployeeCalendarModal({
  user,
  month,
  year,
  onClose,
}: EmployeeCalendarModalProps) {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  const generateCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const holidaysRes = await api.get(`/calendar/holidays?year=${year}`);
      const holidays: Holiday[] = holidaysRes.success
        ? holidaysRes.holidays
        : [];

      const daysInMonth = new Date(year, month, 0).getDate();
      const generatedDays: CalendarDay[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(year, month - 1, day));

        const holidayInfo = holidays.find((h) => {
          const holidayDate = new Date(h.date);
          return (
            holidayDate.getUTCFullYear() === date.getUTCFullYear() &&
            holidayDate.getUTCMonth() === date.getUTCMonth() &&
            holidayDate.getUTCDate() === date.getUTCDate()
          );
        });

        const isHoliday = !!holidayInfo;
        const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;

        const attendanceRecord = user.attendances.find((att) => {
          const attDate = new Date(att.date);
          return (
            attDate.getUTCFullYear() === date.getUTCFullYear() &&
            attDate.getUTCMonth() === date.getUTCMonth() &&
            attDate.getUTCDate() === date.getUTCDate()
          );
        });

        let status: CalendarDay["status"] = "absent";
        if (attendanceRecord) {
          status = "present";
        } else if (isHoliday) {
          status = "holiday";
        } else if (isWeekend) {
          status = "weekend";
        }

        generatedDays.push({
          date,
          dayOfMonth: day,
          status,
          description: holidayInfo?.description,
        });
      }

      setCalendarDays(generatedDays);
    } catch (error) {
      console.error("Failed to generate calendar", error);
    } finally {
      setLoading(false);
    }
  }, [month, year, user.attendances]);

  useEffect(() => {
    generateCalendar();
  }, [generateCalendar]);

  const getDayClass = (day: CalendarDay) => {
    const classes =
      "calendar-day min-h-20 flex items-center justify-center text-lg";
    switch (day.status) {
      case "present":
        return `${classes} bg-green-100`;
      case "absent":
        return `${classes} bg-red-100`;
      case "holiday":
        return `${classes} bg-yellow-50`;
      case "weekend":
        return `${classes} bg-gray-100`;
      case "empty":
        return `${classes} empty`;
      default:
        return classes;
    }
  };

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {user.username}&apos;s Monthly Attendance
          </h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body p-6">
          <div className="calendar">
            <div className="calendar-header justify-between">
              <h3 className="text-xl font-bold">
                {new Date(year, month - 1).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 border border-black"></div>{" "}
                  Present
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-100 border border-black"></div>{" "}
                  Absent
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 border border-black"></div>{" "}
                  Weekend
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-content">Loading Calendar...</div>
            ) : (
              <div className="calendar-grid mt-4">
                <div className="calendar-weekdays">
                  <div>Sun</div> <div>Mon</div> <div>Tue</div> <div>Wed</div>{" "}
                  <div>Thu</div> <div>Fri</div> <div>Sat</div>
                </div>
                <div className="calendar-days">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty" />
                  ))}
                  {calendarDays.map((day) => (
                    <div key={day.dayOfMonth} className={getDayClass(day)}>
                      <span className="font-bold">{day.dayOfMonth}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
