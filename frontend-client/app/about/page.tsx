export default function AboutPage() {
  const teamMembers = [
    { name: "Juan Martín", role: "Project Manager", accent: "hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:border-emerald-500" },
    { name: "Julián", role: "Analista del Frontend", accent: "hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] hover:border-purple-500" },
    { name: "Adolfo", role: "Desarrollador Frontend", accent: "hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] hover:border-blue-500" },
    { name: "Damian", role: "Frontend Tester", accent: "hover:shadow-[0_0_50px_rgba(6,182,212,0.7)] hover:border-cyan-500" },
    { name: "Santiago", role: "Backend - Base De Datos", accent: "hover:shadow-[0_0_50px_rgba(239,68,68,0.7)] hover:border-red-500" },
    { name: "Erwin", role: "Desarrollador del Backend", accent: "hover:shadow-[0_0_50px_rgba(249,115,22,0.7)] hover:border-orange-500" },
    { name: "Sosa", role: "Analista del Backend", accent: "hover:shadow-[0_0_50px_rgba(234,179,8,0.7)] hover:border-yellow-500" },
    { name: "Valentino", role: "Backend Tester ", accent: "hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] hover:border-pink-500" }
  ];

  return (
    <main className="min-h-screen py-20 px-4 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            El Equipo Detrás de la <span className="text-[var(--usa-blue)] dark:text-blue-400 italic">Magia</span>
          </h1>
          <div className="w-24 h-1 bg-[var(--usa-blue)] dark:bg-blue-500 mx-auto mt-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <article 
              key={index}
              // Agregamos hover:z-10 para que la tarjeta se ponga 'arriba' de las otras al brillar
              className={`group relative p-8 rounded-3xl bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-3 hover:z-20 shadow-sm hover:shadow-lg dark:hover:shadow-none ${member.accent}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-4xl border border-gray-100 dark:border-slate-600 shadow-xl group-hover:scale-110 group-hover:border-gray-300 dark:group-hover:border-slate-500 transition-all duration-300">
                  👨‍💻
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
                  {member.name}
                </h2>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
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