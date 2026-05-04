"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitamos errores de hidratación
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; 
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2.5 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 shadow-sm transition-all hover:scale-110 active:scale-95 group"
      aria-label="Cambiar tema"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all group-hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-blue-600 transition-all group-hover:-rotate-12" />
      )}
      
      {/* Tooltip sutil */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase font-black">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
