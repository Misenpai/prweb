"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../utils/api";
import AttendanceTable from "../../components/AttendanceTable";
import Calendar from "../../components/Calendar";
import Modal from "../../components/Modal";
import type { ApiResponse, User } from "../../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined); // Changed to undefined
  const [dateAttendances, setDateAttendances] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      let response;

      if (user.isSSO) {
        response = await api.postWithSSO(
          `/pi/users-attendance-sso?month=${filters.month}&year=${filters.year}`,
          {},
        );
      } else {
        response = await api.get(
          `/pi/users-attendance?month=${filters.month}&year=${filters.year}`,
        );
      }

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
  }, [user, filters.month, filters.year]); // Added dependencies

  // Polling for updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (user) loadData();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [user, loadData]); // Added loadData to deps


  const handleDateSelect = (date: string, attendances: any[]) => {
    setSelectedDate(date);
    setDateAttendances(attendances);
  };

  useEffect(() => {
    loadData();
  }, [loadData]); // Use loadData from useCallback

  return (
    <div className="dashboard-content">
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
              {new Date(0, i).toLocaleDateString("en-US", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: parseInt(e.target.value) }))
          }
          className="select-brutal"
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        <button onClick={loadData} className="btn-brutal">
          Refresh
        </button>
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