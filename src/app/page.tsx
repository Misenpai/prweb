"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        // Redirect to PI Website for login
        window.location.href = process.env.NEXT_PUBLIC_PI_WEBSITE_URL!;
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="loading-screen">
      <div className="loading-content">Redirecting...</div>
    </div>
  );
}
