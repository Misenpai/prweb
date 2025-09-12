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
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

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
        <span className="absolute -top-1 -right-2.5 bg-black text-white rounded-full w-5 h-5 flex justify-center items-center text-xs font-bold">
          {notifications.length}
        </span>
      )}

      {isOpen && (
        <div className="absolute top-10 right-0 w-72 bg-white border-2 border-black rounded-none shadow-brutal z-[1000]">
          <div className="p-4 font-bold border-b-2 border-black text-black">
            HR Data Requests
          </div>
          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <div key={index} className="p-4 border-b border-gray-200">
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
                  className="py-1.5 px-3 bg-black text-white rounded-none cursor-pointer font-bold border-2 border-black"
                  onClick={() => handleSendData(notif.month, notif.year)}
                >
                  Send Data to HR
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No new requests</div>
          )}
        </div>
      )}
    </div>
  );
}
