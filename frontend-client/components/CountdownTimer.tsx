"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  tiempoExpiracion: Date;
  onExpirar: () => void;
}

export default function CountdownTimer({ tiempoExpiracion, onExpirar }: CountdownTimerProps) {
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);

  useEffect(() => {
    // Calculamos el tiempo cada vez que se ejecute la función
    const calcularTiempoRestante = () => {
      const ahora = new Date().getTime();
      const expiracion = tiempoExpiracion.getTime();
      const diferencia = expiracion - ahora;

      // Si la diferencia es menor a 0, devolvemos 0 para que no haya números negativos
      return diferencia > 0 ? diferencia : 0;
    };

    // Actualizamos el estado inicial
    setTiempoRestante(calcularTiempoRestante());

    // Configuramos el temporizador para que se actualice cada segundo (1000 ms)
    const intervalo = setInterval(() => {
      const restante = calcularTiempoRestante();
      setTiempoRestante(restante);

      // Si llegó a cero, detenemos el reloj y ejecutamos la función onExpirar
      if (restante <= 0) {
        clearInterval(intervalo);
        onExpirar();
      }
    }, 1000);

    // Limpieza del intervalo cuando el componente se desmonta
    // Esto es muy importante para no causar bugs de memoria (memory leaks)
    return () => clearInterval(intervalo);
  }, [tiempoExpiracion, onExpirar]); // El efecto se reinicia si estas variables cambian

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
