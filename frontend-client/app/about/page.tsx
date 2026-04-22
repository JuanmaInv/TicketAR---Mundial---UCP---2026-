export default function AboutPage() {
  const teamMembers = [
    // Liderazgo y Análisis
    { name: "Juan Martín", role: "Project Manager", accent: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]" },
    { name: "Julián", role: "Analista del Frontend", accent: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]" },
    
    // Equipo Frontend
    { name: "Adolfo", role: "Desarrollador Frontend ", accent: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]" },
    { name: "Damian", role: "Tester Frontend", accent: "group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]" },

    // Equipo Backend
    { name: "Santiago", role: "Backend - Motor de Cola (Redis)", accent: "group-hover:border-red-500/50 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]" },
    { name: "Erwin", role: "Backend - Base de Datos y API", accent: "group-hover:border-orange-500/50 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]" },
    { name: "Sosa", role: "Analista del Backend", accent: "group-hover:border-yellow-500/50 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]" },
    { name: "Valentino", role: "Tester Backend", accent: "group-hover:border-pink-500/50 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]" }
  ];

  return (
    <main className="min-h-screen py-20 px-4 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            El Equipo Detrás de la <span className="text-blue-500 italic">Magia</span>
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"></div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <article 
              key={index}
              // El 'hover:z-10' es clave para que la sombra no quede abajo de la tarjeta de al lado
              className={`group relative p-8 rounded-3xl bg-zinc-900/80 border border-white/10 transition-all duration-300 hover:-translate-y-3 hover:z-10 cursor-default ${member.accent}`}
            >
              <div className="flex flex-col items-center text-center">
                {/* El icono ahora también se ilumina con el hover del grupo */}
                <div className="w-20 h-20 mb-6 rounded-full bg-zinc-800 flex items-center justify-center text-4xl border border-white/5 shadow-2xl group-hover:scale-110 group-hover:border-white/20 transition-all duration-300">
                  👨‍💻
                </div>
                <h2 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  {member.name}
                </h2>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  {member.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}