"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";
import EmployeeSelectionModal from "./EmployeeSelectionModal";

interface Notification {
  month: string;
  year: string;
  message?: string;
}

interface Employee {
  employeeNumber: string;
  username: string;
}

interface UserAttendanceData {
  employeeNumber: string;
  username: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/pi/notifications");
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchEmployees = async (month: string, year: string) => {
    try {
      setLoadingEmployees(true);
      const res = await api.get(
        `/pi/users-attendance?month=${month}&year=${year}`,
      );
      if (res.success && res.data) {
        const employeeList = res.data.map((user: UserAttendanceData) => ({
          employeeNumber: user.employeeNumber,
          username: user.username,
        }));
        setEmployees(employeeList);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendAllData = async (month: string, year: string) => {
    try {
      const res = await api.post("/pi/submit-data", {
        month: parseInt(month),
        year: parseInt(year),
        sendAll: true, // Flag to indicate sending all employee data
      });
      if (res.success) {
        alert("All employee attendance data sent to HR successfully!");
        setNotifications((prev) =>
          prev.filter((n) => !(n.month === month && n.year === year)),
        );
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (error) {
      console.error("Failed to send data:", error);
      alert("Failed to send data. Please try again.");
    }
  };

  const handleSelectEmployees = async (notif: Notification) => {
    setSelectedNotification(notif);
    await fetchEmployees(notif.month, notif.year);
    setShowEmployeeModal(true);
  };

  const handleSendSelectedEmployees = async (
    selectedEmployeeNumbers: string[],
  ) => {
    if (!selectedNotification) return;

    try {
      const res = await api.post("/pi/submit-data", {
        month: parseInt(selectedNotification.month),
        year: parseInt(selectedNotification.year),
        sendAll: false,
        selectedEmployees: selectedEmployeeNumbers, // Send only selected employees
      });

      if (res.success) {
        alert(
          `${selectedEmployeeNumbers.length} employee(s) attendance data sent to HR successfully!`,
        );
        setNotifications((prev) =>
          prev.filter(
            (n) =>
              !(
                n.month === selectedNotification.month &&
                n.year === selectedNotification.year
              ),
          ),
        );
        setShowEmployeeModal(false);
        setSelectedNotification(null);
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (error) {
      console.error("Failed to send selected data:", error);
      alert("Failed to send data. Please try again.");
    }
  };

  const formatNotificationMessage = (notif: Notification) => {
    const monthName = new Date(0, parseInt(notif.month) - 1).toLocaleString(
      "en-US",
      { month: "long" },
    );
    const message = notif.message || "Request for attendance data for";
    return `${message}: ${monthName} ${notif.year}`;
  };

  return (
    <>
      <div className="relative cursor-pointer">
        <span
          className="text-2xl text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          🔔
        </span>
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">HR Attendance Requests</div>
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div key={index} className="notification-item">
                  <p className="mb-3 text-black">
                    {formatNotificationMessage(notif)}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      className="btn btn-brutal w-full"
                      onClick={() => handleSendAllData(notif.month, notif.year)}
                    >
                      Send All Employee Data
                    </button>
                    <button
                      className="btn bg-blue-100 hover:bg-blue-200 w-full"
                      onClick={() => handleSelectEmployees(notif)}
                    >
                      Select Specific Employees
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="notification-empty">No new requests</div>
            )}
          </div>
        )}
      </div>

      {showEmployeeModal && selectedNotification && (
        <EmployeeSelectionModal
          isOpen={showEmployeeModal}
          onClose={() => {
            setShowEmployeeModal(false);
            setSelectedNotification(null);
          }}
          employees={employees}
          loadingEmployees={loadingEmployees}
          month={selectedNotification.month}
          year={selectedNotification.year}
          onConfirm={handleSendSelectedEmployees}
        />
      )}
    </>
  );
}
