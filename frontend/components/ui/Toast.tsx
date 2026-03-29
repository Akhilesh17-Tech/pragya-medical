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
      setTimeout(() => setShow(false), 2500);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-[#2c3e50] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-300 pointer-events-none ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {msg}
    </div>
  );
}
