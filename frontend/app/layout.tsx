import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pragya Medical",
  description: "Patient Reminder System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100">{children}</body>
    </html>
  );
}
