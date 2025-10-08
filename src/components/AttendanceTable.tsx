"use client";

import { useState, useEffect } from "react";
import FieldTripModal from "./FieldTripModel";
import type { ApiResponse, User, FieldTrip, Attendance } from "../types";

interface AttendanceTableProps {
  data: ApiResponse | null;
  loading: boolean;
  error: string;
  onViewDetails: (user: User) => void;
  selectedDate?: string;
  dateAttendances?: (Attendance & { username: string })[];
}

export default function AttendanceTable({
  data,
  loading,
  error,
  onViewDetails,
  selectedDate,
  dateAttendances,
}: AttendanceTableProps) {
  const [fieldTripModalUser, setFieldTripModalUser] = useState<User | null>(
    null,
  );
  // --- New state for search functionality ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // --- useEffect to filter users when search query or data changes ---
  useEffect(() => {
    if (data?.data) {
      const lowercasedQuery = searchQuery.toLowerCase().trim();
      if (!lowercasedQuery) {
        setFilteredUsers(data.data);
      } else {
        const filtered = data.data.filter(
          (user) =>
            user.username.toLowerCase().includes(lowercasedQuery) ||
            user.employeeNumber
              .toString()
              .toLowerCase()
              .includes(lowercasedQuery),
        );
        setFilteredUsers(filtered);
      }
    }
  }, [searchQuery, data]);

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not recorded";
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
        </div>
        <div className="loading">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
        </div>
        <div className="loading">No data available</div>
      </div>
    );
  }

  return (
    <>
      {selectedDate && dateAttendances && dateAttendances.length > 0 && (
        <div className="users-table mb-6">
          <div className="table-header">
            <h2>
              Attendance for{" "}
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <div
                className="flex gap-4 pb-4"
                style={{ minWidth: "fit-content" }}
              >
                {dateAttendances.map((att, idx) => (
                  <div
                    key={idx}
                    className="card flex-shrink-0"
                    style={{ minWidth: "250px" }}
                  >
                    <div className="font-bold mb-3 pb-2 border-b-2 border-black">
                      {att.username}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="font-bold text-sm mb-1">Check-in:</div>
                        <div className="text-green-600 font-semibold">
                          {formatTime(att.checkinTime)}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-1">Check-out:</div>
                        <div
                          className={
                            att.checkoutTime
                              ? "text-red-600 font-semibold"
                              : "text-gray-500 italic"
                          }
                        >
                          {formatTime(att.checkoutTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
          {/* --- Search input and header info container --- */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="date-search-input"
                style={{ minWidth: "250px" }}
              />
            </div>
            <div className="header-info">
              <span>
                Month: {data.month}/{data.year}
              </span>
              <span>Total Users: {data.totalUsers}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Employee Username</th>
              <th>Projects</th>
              <th>Monthly Stats</th>
              <th>Field Trip Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* --- Render filtered users or a "no results" message --- */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user: User, index: number) => (
                <tr key={user.employeeNumber || index} className="user-row">
                  <td>{user.employeeNumber}</td>
                  <td>{user.username}</td>
                  <td>
                    <div className="project-list">
                      {user.projects.map((p, pIndex) => (
                        <span
                          key={`${p.projectCode}-${pIndex}`}
                          className="project-tag"
                        >
                          {p.projectCode}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td>
                    <div className="monthly-stats">
                      <span title="Full Days" className="stat-badge full-days">
                        {user.monthlyStatistics.fullDays}F
                      </span>
                      <span title="Half Days" className="stat-badge half-days">
                        {user.monthlyStatistics.halfDays}H
                      </span>
                      <span
                        title="Total Days"
                        className="stat-badge total-days"
                      >
                        {user.monthlyStatistics.totalDays}T
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="field-trip-status">
                      <button
                        className="manage-trips-btn"
                        onClick={() => setFieldTripModalUser(user)}
                      >
                        Manage
                      </button>
                    </div>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => onViewDetails(user)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="no-records-message">
                  No employees found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {fieldTripModalUser && (
        <FieldTripModal
          user={fieldTripModalUser}
          onClose={() => setFieldTripModalUser(null)}
          onSave={async (employeeNumber: string, fieldTrips: FieldTrip[]) => {
            try {
              console.log(
                "Saving field trips for:",
                employeeNumber,
                fieldTrips,
              );
            } catch (error) {
              console.error("Error saving field trips:", error);
              alert("Failed to save field trips.");
            }
          }}
        />
      )}
    </>
  );
}
