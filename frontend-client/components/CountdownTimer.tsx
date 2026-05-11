"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  tiempoExpiracion: Date;
  onExpirar: () => void;
}

function calcularTiempoRestante(tiempoExpiracion: Date): number {
  const diferencia = tiempoExpiracion.getTime() - Date.now();
  return diferencia > 0 ? diferencia : 0;
}

export default function CountdownTimer({ tiempoExpiracion, onExpirar }: CountdownTimerProps) {
  const [tiempoRestante, setTiempoRestante] = useState<number>(() =>
    calcularTiempoRestante(tiempoExpiracion),
  );
  const expiroRef = useRef(false);

  useEffect(() => {
    expiroRef.current = false;
    let intervalo: ReturnType<typeof setInterval> | null = null;

    function tick(): void {
      const restante = calcularTiempoRestante(tiempoExpiracion);
      setTiempoRestante(restante);

      if (restante <= 0 && !expiroRef.current) {
        expiroRef.current = true;
        if (intervalo) {
          clearInterval(intervalo);
          intervalo = null;
        }
        onExpirar();
      }
    }

    const inicio = setTimeout(() => {
      tick();
      if (!expiroRef.current) {
        intervalo = setInterval(tick, 1000);
      }
    }, 0);

    return () => {
      clearTimeout(inicio);
      if (intervalo) clearInterval(intervalo);
    };
  }, [tiempoExpiracion, onExpirar]);

  const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

  const formatoMinutos = minutos < 10 ? `0${minutos}` : minutos;
  const formatoSegundos = segundos < 10 ? `0${segundos}` : segundos;
  const vencido = tiempoRestante <= 0;
  const warningActivo = vencido || (minutos === 0 && segundos <= 30);
  const claseTiempo = warningActivo
    ? "text-red-500 animate-pulse"
    : "text-white";

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black border border-zinc-800 rounded-lg shadow-sm">
      <span className="text-sm font-medium text-white mb-1">Tiempo restante para abonar:</span>
      <span className={`text-4xl font-black font-mono tracking-wider ${claseTiempo}`}>
        {formatoMinutos}:{formatoSegundos}
      </span>
      {vencido ? (
        <span className="text-xs text-red-500 font-bold mt-2">Tu reserva vencio.</span>
      ) : minutos === 0 && segundos <= 30 ? (
        <span className="text-xs text-red-500 font-bold mt-2 animate-bounce">Apurate, tu ticket se liberara pronto.</span>
      ) : null}
    </div>
  );
}
