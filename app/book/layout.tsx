export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-5 py-5">
          <p className="font-serif text-xl">Studio note</p>
          <p className="text-sm font-medium text-slate-600">施設予約</p>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
