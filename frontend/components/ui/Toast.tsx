"use client";
import { useEffect, useState } from "react";

let _setToast: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  _setToast?.(msg);
}

export default function Toast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    _setToast = (m: string) => {
      setMsg(m);
      setShow(true);
      setTimeout(() => setShow(false), 2800);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[200] pointer-events-none transition-all duration-300 ${
        show
          ? "opacity-100 -translate-x-1/2 translate-y-0"
          : "opacity-0 -translate-x-1/2 translate-y-2"
      }`}
    >
      <div
        className="px-5 py-3 rounded-2xl text-white text-sm font-semibold whitespace-nowrap flex items-center gap-2.5"
        style={{
          background: "rgba(15,23,42,0.92)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
        {msg}
      </div>
    </div>
  );
}
