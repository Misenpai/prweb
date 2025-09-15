"use client";

import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface Notification {
  month: string;
  year: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSendData = async (month: string, year: string) => {
    try {
      const res = await api.post("/pi/submit-data", {
        month: parseInt(month),
        year: parseInt(year),
      });
      if (res.success) {
        alert(res.message);
        setNotifications((prev) =>
          prev.filter((n) => !(n.month === month && n.year === year)),
        );
      } else {
        alert(`Error: ${res.error}`);
      }
    } catch (error) {
      alert("Failed to send data. Please try again.");
    }
  };

  return (
    <div className="relative cursor-pointer">
      <span className="text-2xl text-black" onClick={() => setIsOpen(!isOpen)}>
        🔔
      </span>
      {notifications.length > 0 && (
        <span className="notification-badge">{notifications.length}</span>
      )}

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">HR Data Requests</div>
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div key={index} className="notification-item">
                <p className="mb-3 text-black">
                  Request for attendance data for:{" "}
                  <strong>
                    {new Date(0, parseInt(notif.month) - 1).toLocaleString(
                      "en-US",
                      { month: "long" },
                    )}{" "}
                    {notif.year}
                  </strong>
                </p>
                <button
                  className="btn"
                  onClick={() => handleSendData(notif.month, notif.year)}
                >
                  Send Data to HR
                </button>
              </div>
            ))
          ) : (
            <div className="notification-empty">No new requests</div>
          )}
        </div>
      )}
    </div>
  );
}
