"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import AttendanceTable from "../../components/AttendanceTable";
import Calendar from "../../components/Calendar";
import Modal from "../../components/Modal";
import type { ApiResponse, User, UserAttendance } from "../../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(), // Year is set to the current year
  });
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );
  const [dateAttendances, setDateAttendances] = useState<UserAttendance[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const endpoint = `/pi/users-attendance?month=${filters.month}&year=${filters.year}`;
      const response = await api.get(endpoint);
      if (response.success) {
        setData(response);
      } else {
        setError("Failed to load data");
      }
    } catch (err) {
      setError("Error connecting to server: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, filters.month, filters.year]);

  const handleDateSelect = (date: string, attendances: UserAttendance[]) => {
    setSelectedDate(date);
    setDateAttendances(attendances);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="dashboard-content">
      {/* This container uses flexbox to align children in a row */}
      <div className="dashboard-filters">
        <select
          value={filters.month}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, month: parseInt(e.target.value) }))
          }
          className="select-brutal"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en-US", { month: "long" })}
            </option>
          ))}
        </select>

        {/* This div will appear next to the select dropdown */}
        <div className="select-brutal static-year">{filters.year}</div>
      </div>

      <Calendar
        month={filters.month}
        year={filters.year}
        users={data?.data || []}
        onDateClick={handleDateSelect}
      />

      <AttendanceTable
        data={data}
        loading={loading}
        error={error}
        onViewDetails={(user) => setModalData(user)}
        selectedDate={selectedDate}
        dateAttendances={dateAttendances}
      />

      {modalData && (
        <Modal user={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
