export default function PhoneShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#eef4fb] flex justify-center items-start p-0 sm:p-5">
      <div className="w-full sm:w-[390px] min-h-screen sm:min-h-[780px] bg-white sm:rounded-[28px] sm:shadow-2xl overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
