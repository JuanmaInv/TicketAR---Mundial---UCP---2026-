export default function AboutPage() {
  const teamMembers = [
    { name: "Juan Martín", role: "Project Manager", color: "hover:border-emerald-500/50 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]" },
    { name: "Julián", role: "Analista del Frontend", color: "hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]" },
    { name: "Adolfo", role: "Desarrollador Frontend", color: "hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]" }
  ];

  return (
    <main className="min-h-screen py-20 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            El Equipo Detrás de la <span className="text-blue-500 italic">Magia</span>
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {teamMembers.map((member, index) => (
            <article 
              key={index}
              className={`group relative p-10 rounded-3xl bg-zinc-900/50 border border-white/10 transition-all duration-500 hover:-translate-y-3 ${member.color}`}
            >
              <div className="flex flex-col items-center">
                {/* Círculo del icono */}
                <div className="w-28 h-28 mb-8 rounded-full bg-zinc-800 flex items-center justify-center text-5xl border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  👨‍💻
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                  {member.name}
                </h2>
                
                <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
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