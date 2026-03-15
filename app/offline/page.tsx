import Link from 'next/link';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,215,96,0.22),_transparent_38%),_linear-gradient(180deg,_#090909_0%,_#070707_100%)] text-white px-6 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-[#1db954]/15 text-3xl font-bold text-[#1ed760]">
          SS
        </div>
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re offline</h1>
        <p className="mt-4 text-sm leading-6 text-white/70">
          Soul Sound is still installed, but this screen needs a connection to refresh music, artists, and playlists.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-[#1db954] px-5 py-3 font-semibold text-black transition hover:brightness-110"
          >
            Try again
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Go to login
          </Link>
        </div>
      </section>
    </main>
  );
}