"use client";

import { useState } from "react";
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
      <div className="users-table">
        <div className="table-header">
          <h2>Employee Attendance Records</h2>
          <div className="header-info">
            <span>
              Month: {data.month}/{data.year}
            </span>
            <span>Total Users: {data.totalUsers}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Username</th>
              <th>Class</th>
              <th>Projects</th>
              <th>Monthly Stats</th>
              <th>Field Trip Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.data.map((user: User, index: number) => (
              <tr key={user.employeeNumber || index} className="user-row">
                <td>{user.employeeNumber}</td>
                <td>{user.username}</td>
                <td>{user.empClass}</td>
                <td>
                  <div className="project-list">
                    {user.projects.map((p) => (
                      <span key={p.projectCode} className="project-tag">
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
                      title="Not Checked Out"
                      className="stat-badge not-checked"
                    >
                      {user.monthlyStatistics.notCheckedOut}NC
                    </span>
                    <span title="Total Days" className="stat-badge total-days">
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
            ))}
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
              alert("Field trips saved successfully!");
            } catch (error) {
              console.error("Error saving field trips:", error);
              alert("Failed to save field trips.");
            }
          }}
        />
      )}

      {selectedDate && dateAttendances && dateAttendances.length > 0 && (
        <div className="date-attendance-details">
          <h3>Attendance for {selectedDate}</h3>
          <ul>
            {dateAttendances.map((att, idx) => (
              <li key={idx}>
                {att.username}: Check-in{" "}
                {new Date(att.checkinTime).toLocaleTimeString()},
                {att.checkoutTime
                  ? `Check-out ${new Date(att.checkoutTime).toLocaleTimeString()}`
                  : "No Check-out"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
