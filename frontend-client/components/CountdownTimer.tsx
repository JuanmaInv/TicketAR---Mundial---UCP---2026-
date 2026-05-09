"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  tiempoExpiracion: Date;
  onExpirar: () => void;
}

const calcularTiempoRestante = (tiempoExpiracion: Date) => {
  const diferencia = tiempoExpiracion.getTime() - Date.now();
  return diferencia > 0 ? diferencia : 0;
};

export default function CountdownTimer({ tiempoExpiracion, onExpirar }: CountdownTimerProps) {
  const [tiempoRestante, setTiempoRestante] = useState<number>(() =>
    calcularTiempoRestante(tiempoExpiracion),
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      const restante = calcularTiempoRestante(tiempoExpiracion);
      setTiempoRestante(restante);

      if (restante <= 0) {
        clearInterval(intervalo);
        onExpirar();
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoExpiracion, onExpirar]);

  // Cálculos matemáticos para obtener los minutos y los segundos en base a los milisegundos restantes
  const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

  // Formateamos para que siempre tenga 2 dígitos (ejemplo: 09:05 en lugar de 9:5)
  const formatoMinutos = minutos < 10 ? `0${minutos}` : minutos;
  const formatoSegundos = segundos < 10 ? `0${segundos}` : segundos;

  // Renderizamos el componente (usando Tailwind para darle estilos dinámicos e impactantes)
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black border border-zinc-800 rounded-lg shadow-sm">
      <span className="text-sm font-medium text-white mb-1">
        Tiempo restante para abonar:
      </span>
      <span className={`text-4xl font-black font-mono tracking-wider ${minutos === 0 && segundos <= 30 ? 'text-red-500 animate-pulse' : 'text-white'
        }`}>
        {formatoMinutos}:{formatoSegundos}
      </span>
      {minutos === 0 && segundos <= 30 && (
        <span className="text-xs text-red-500 font-bold mt-2 animate-bounce">
          ¡Apurate, tu ticket se liberará pronto!
        </span>
      )}
    </div>
  );
}
