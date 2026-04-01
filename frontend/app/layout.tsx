import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pragya Medical — Patient Reminder System",
  description: "Manage patients, medicines, reminders and invoices",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f0f4f8", fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}