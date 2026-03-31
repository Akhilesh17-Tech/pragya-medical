"use client";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  backHref?: string;
  rightIcon?: React.ReactNode;
  onRightClick?: () => void;
  showBack?: boolean;
  transparent?: boolean;
}

export default function TopBar({
  title,
  backHref,
  rightIcon,
  onRightClick,
  showBack = true,
  transparent,
}: Props) {
  const router = useRouter();
  return (
    <div
      className={`px-4 py-3.5 flex items-center justify-between flex-shrink-0 ${transparent ? "bg-transparent" : "bg-white border-b border-slate-100"}`}
      style={transparent ? {} : { boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
    >
      {showBack ? (
        <button
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="w-9 h-9 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      ) : (
        <div className="w-9" />
      )}

      <h2 className="text-[15px] font-black text-slate-800 flex-1 text-center tracking-tight">
        {title}
      </h2>

      {rightIcon ? (
        <button
          onClick={onRightClick}
          className="w-9 h-9 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
        >
          {rightIcon}
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  );
}
