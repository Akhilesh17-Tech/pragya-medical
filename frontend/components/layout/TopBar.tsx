"use client";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  backHref?: string;
  rightIcon?: string;
  onRightClick?: () => void;
  showBack?: boolean;
}

export default function TopBar({
  title,
  backHref,
  rightIcon,
  onRightClick,
  showBack = true,
}: Props) {
  const router = useRouter();
  return (
    <div className="bg-[#1a6fc4] px-4 py-3 flex items-center justify-between text-white flex-shrink-0">
      {showBack ? (
        <button
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold"
        >
          &larr;
        </button>
      ) : (
        <div className="w-8" />
      )}
      <h2 className="text-[15px] font-extrabold flex-1 text-center">{title}</h2>
      {rightIcon ? (
        <button
          onClick={onRightClick}
          className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
        >
          {rightIcon}
        </button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}
