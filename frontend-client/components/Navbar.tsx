import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="relative sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-slate-700 bg-white/88 dark:bg-slate-950 backdrop-blur-md shadow-sm overflow-hidden">
      {/* Dark mode diagonal flag composition */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-y-0 -left-16 w-[38%] -skew-x-12 bg-[linear-gradient(90deg,#006847_0%,#006847_34%,#ffffff_34%,#ffffff_66%,#ce1126_66%,#ce1126_100%)] opacity-75" />
        <div className="absolute left-[16%] top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-900/75">◉</div>

        <div className="absolute inset-y-0 left-[29%] w-[37%] -skew-x-12 bg-[repeating-linear-gradient(180deg,#b22234_0%,#b22234_11%,#ffffff_11%,#ffffff_22%)] opacity-70" />
        <div className="absolute left-[37%] top-0 h-full w-[15%] -skew-x-12 bg-[#3c3b6e]/80" />
        <div className="absolute left-[40%] top-1/2 -translate-y-1/2 text-[9px] tracking-[0.25em] text-white/80">✦ ✦ ✦</div>

        <div className="absolute inset-y-0 right-[-5%] w-[34%] -skew-x-12 bg-[linear-gradient(90deg,#d80621_0%,#d80621_32%,#ffffff_32%,#ffffff_68%,#d80621_68%,#d80621_100%)] opacity-75" />
        <div className="absolute right-[13%] top-1/2 -translate-y-1/2 text-xl text-[#d80621]/85">🍁</div>

        {/* Contrast veil to keep nav text readable */}
        <div className="absolute inset-0 bg-slate-950/45" />
      </div>

      {/* Light mode clean surface */}
      <div className="absolute inset-0 pointer-events-none dark:hidden bg-white/90" />

      <div className="relative z-10 container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">
            Ticket<span className="text-[var(--usa-blue)]">AR</span>
            <span className="ml-2 text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[var(--canada-red)] via-[var(--usa-blue)] to-[var(--mexico-green)]">
              MUNDIAL 2026
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-bold text-slate-700 dark:text-slate-100 transition-colors hover:text-[var(--usa-blue)] dark:hover:text-white">
            Inicio
          </Link>
          <Link href="/matches" className="text-sm font-bold text-slate-700 dark:text-slate-100 transition-colors hover:text-[var(--usa-blue)] dark:hover:text-white">
            Partidos
          </Link>
          <Link href="/about" className="text-sm font-bold text-slate-700 dark:text-slate-100 transition-colors hover:text-[var(--usa-blue)] dark:hover:text-white">
            Sobre Nosotros
          </Link>
          <Link href="/my-tickets" className="text-sm font-bold text-slate-700 dark:text-slate-100 transition-colors hover:text-[var(--usa-blue)] dark:hover:text-white">
            Mis Entradas
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="rounded-full bg-[var(--usa-blue)] px-5 py-2 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-blue-800 hover:shadow-[0_0_15px_rgba(0,43,127,0.3)]">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
