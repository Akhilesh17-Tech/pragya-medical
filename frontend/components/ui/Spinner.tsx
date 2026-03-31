export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#1a6fc4] animate-spin" />
      <p className="text-xs font-semibold text-slate-400">Loading...</p>
    </div>
  );
}
