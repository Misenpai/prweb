"use client";

import React, { useState, useEffect } from "react";
import type { User, Attendance } from "../types";

interface ModalProps {
  user: User;
  onClose: () => void;
}

export default function Modal({
  user,
  onClose,
}: ModalProps): React.JSX.Element {
  const [searchDate, setSearchDate] = useState<string>("");
  const [filteredAttendances, setFilteredAttendances] = useState(
    user.attendances,
  );

  useEffect(() => {
    if (searchDate) {
      const filtered = user.attendances.filter((att) => {
        const attDate = new Date(att.date).toISOString().split("T")[0];
        return attDate === searchDate;
      });
      setFilteredAttendances(filtered);
    } else {
      setFilteredAttendances(user.attendances);
    }
  }, [searchDate, user.attendances]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  const getSessionColor = (sessionType?: string) => {
    if (sessionType === "FN") return "#17a2b8";
    if (sessionType === "AF") return "#ffc107";
    return "#6c757d";
  };

  const getAttendanceTypeLabel = (att: Attendance) => {
    if (!att.isCheckedOut) return "In Progress";
    if (att.isFullDay) return "Full Day";
    if (att.isHalfDay) return "Half Day";
    return "N/A";
  };

  const getAttendanceTypeColor = (att: Attendance) => {
    if (!att.isCheckedOut) return "#ffc107";
    if (att.isFullDay) return "#28a745";
    if (att.isHalfDay) return "#17a2b8";
    return "#6c757d";
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{user.username} - Attendance Details</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body p-6 flex flex-col gap-6">
          <div className="modal-info leading-relaxed text-base text-gray-600 bg-gray-50 p-4 rounded-md">
            <strong>Employee Number:</strong> {user.employeeNumber}
            <br />
            <strong>Employee Class:</strong> {user.empClass}
            <br />
            <strong>Projects:</strong>{" "}
            {user.projects.map((p) => p.projectCode).join(", ")}
            <br />
          </div>

          {user.monthlyStatistics && (
            <div className="stats-summary card bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="mt-0 text-xl text-gray-800 border-b-2 border-blue-500 inline-block pb-1">
                Monthly Summary
              </h3>
              <div className="stats-row flex justify-around text-center mt-4">
                <div className="stat-item flex flex-col items-center text-lg">
                  <strong className="text-gray-700">Total Days:</strong>{" "}
                  <span className="font-semibold text-blue-600 mt-1">
                    {user.monthlyStatistics.totalDays.toFixed(1)}
                  </span>
                </div>
                <div className="stat-item flex flex-col items-center text-lg">
                  <strong className="text-gray-700">Full Days:</strong>{" "}
                  <span className="font-semibold text-blue-600 mt-1">
                    {user.monthlyStatistics.fullDays}
                  </span>
                </div>
                <div className="stat-item flex flex-col items-center text-lg">
                  <strong className="text-gray-700">Half Days:</strong>{" "}
                  <span className="font-semibold text-blue-600 mt-1">
                    {user.monthlyStatistics.halfDays}
                  </span>
                </div>
              </div>
            </div>
          )}

          <h3 className="section-title mt-0 text-xl text-gray-800 border-b-2 border-blue-500 inline-block pb-1">
            Attendance Records
          </h3>

          <div className="search-container flex items-center gap-2">
            <label htmlFor="dateSearch">Filter by Date:</label>
            <input
              id="dateSearch"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="date-search-input flex-grow p-3 border border-gray-300 rounded-md text-base"
            />
            {searchDate && (
              <button
                className="clear-search-btn p-3 bg-gray-500 text-white border-none rounded-md cursor-pointer text-base transition-colors duration-200 hover:bg-gray-600"
                onClick={() => setSearchDate("")}
              >
                Clear
              </button>
            )}
          </div>

          {filteredAttendances.length === 0 ? (
            <p className="no-records-message text-center text-gray-500 italic p-8">
              No attendance records found{" "}
              {searchDate ? "for the selected date" : "for this month"}.
            </p>
          ) : (
            <div className="attendance-list flex flex-col gap-6">
              {filteredAttendances.map((att, index: number) => {
                const checkInDate = new Date(att.checkinTime);
                const checkOutDate = att.checkoutTime
                  ? new Date(att.checkoutTime)
                  : null;

                return (
                  <div
                    key={index}
                    className="attendance-item card bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-4"
                  >
                    <div className="attendance-date text-xl font-semibold text-gray-800 border-b border-dashed border-gray-300 pb-2 mb-2">
                      {checkInDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="attendance-details flex flex-col gap-3">
                      <div className="detail-row flex justify-between flex-wrap gap-4">
                        <div className="detail-item flex-1 min-w-[200px]">
                          <strong>Session:</strong>
                          <span
                            className="badge text-white py-1 px-2.5 rounded-full text-sm font-medium ml-2 inline-block"
                            style={{
                              backgroundColor: getSessionColor(att.sessionType),
                            }}
                          >
                            {att.sessionType || "N/A"}
                          </span>
                        </div>
                        <div className="detail-item flex-1 min-w-[200px]">
                          <strong>Type:</strong>
                          <span
                            className="badge text-white py-1 px-2.5 rounded-full text-sm font-medium ml-2 inline-block"
                            style={{
                              backgroundColor: getAttendanceTypeColor(att),
                            }}
                          >
                            {getAttendanceTypeLabel(att)}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row flex justify-between flex-wrap gap-4">
                        <div className="detail-item flex-1 min-w-[200px]">
                          <strong>Check-in:</strong>{" "}
                          <span>{checkInDate.toLocaleTimeString()}</span>
                        </div>
                        {checkOutDate && (
                          <div className="detail-item flex-1 min-w-[200px]">
                            <strong>Check-out:</strong>{" "}
                            <span>{checkOutDate.toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="detail-row flex justify-between flex-wrap gap-4">
                        <div className="detail-item flex-1 min-w-[200px]">
                          <strong>Location:</strong>{" "}
                          <span>
                            {att.location?.address ||
                              att.takenLocation ||
                              "Not specified"}
                          </span>
                        </div>
                        <div className="detail-item flex-1 min-w-[200px]">
                          <strong>Status:</strong>
                          <span
                            className={`status-badge py-1 px-2.5 rounded-full text-sm font-semibold ml-2 ${
                              att.isCheckedOut
                                ? "bg-green-500 text-white"
                                : "bg-yellow-400 text-gray-800"
                            }`}
                          >
                            {att.isCheckedOut ? "Completed" : "In Progress"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="media-links flex flex-wrap gap-2.5 mt-4">
                      {att.photo && (
                        <a
                          href={att.photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="media-link py-2 px-3 rounded-md no-underline text-white font-medium transition-colors duration-200 text-sm bg-blue-500 hover:bg-blue-600"
                        >
                          📷 View Photo
                        </a>
                      )}
                      {att.audio && (
                        <a
                          href={att.audio.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="media-link py-2 px-3 rounded-md no-underline text-white font-medium transition-colors duration-200 text-sm bg-gray-500 hover:bg-gray-600"
                        >
                          🎵 Audio (
                          {att.audio.duration
                            ? att.audio.duration + "s"
                            : "unknown"}
                          )
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
