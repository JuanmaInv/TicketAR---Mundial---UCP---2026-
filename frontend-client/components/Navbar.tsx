import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-white">
            Ticket<span className="text-blue-500">AR</span>
            <span className="ml-1 text-xs font-light text-blue-300">MUNDIAL</span>
          </span>
        </Link>
        
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            Inicio
          </Link>
          <Link href="/matches" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            Partidos
          </Link>
          <Link href="/my-tickets" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
          Sobre Nosotros
         </Link>
          <Link href="/my-tickets" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
            Mis Entradas
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
