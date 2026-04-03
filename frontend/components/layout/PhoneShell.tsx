// export default function PhoneShell({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-slate-100 flex justify-center items-start">
//       <div
//         className="w-full max-w-[430px] min-h-screen bg-white flex flex-col relative overflow-hidden"
//         style={{ boxShadow: "0 0 40px rgba(0,0,0,0.12)" }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

export default function PhoneShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
