"use client";

import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b-2 border-black shadow-brutal">
      <div className="flex justify-between items-center px-8 py-4">
        <h1 className="text-black text-3xl font-bold m-0">PI Dashboard</h1>
        <div className="flex items-center gap-6 text-black">
          <NotificationBell />
          <span>Welcome, {user?.username}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-black text-white rounded-none cursor-pointer font-bold border-2 border-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
