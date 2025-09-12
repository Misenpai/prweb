import type { Metadata } from "next";
import { AuthProvider } from "../hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "PI Dashboard - Attendance Management",
  description:
    "Principal Investigator Dashboard for managing project attendance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
