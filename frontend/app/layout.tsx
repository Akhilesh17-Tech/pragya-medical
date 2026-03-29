import type { Metadata } from "next";
import "./globals.css";
import Toast from "@/components/ui/Toast";

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
      <body>
        {children}
        <Toast />
      </body>
    </html>
  );
}
