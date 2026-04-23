import React from 'react';

interface BanderaProps {
  pais: string;
}

export default function Bandera({ pais }: BanderaProps) {
  // Diccionario básico de códigos ISO para FlagCDN
  // Agregué los países que vi en tu mock-tickets.ts
  const codigos: Record<string, string> = {
    "Argentina": "ar",
    "Argelia": "dz",
    "Austria": "at",
    "Jordania": "jo"
  };

  const codigo = codigos[pais.trim()];

  // Si no encuentra el país en el diccionario, mostramos un planeta de emoji como resguardo
  if (!codigo) {
    return <span className="text-2xl" title={pais}>🌍</span>;
  }

  // Renderizamos la imagen optimizada que viene de los servidores perimetrales de la CDN
  return (
    <img
      src={`https://flagcdn.com/w80/${codigo}.png`}
      width={44}
      height={32}
      alt={`Bandera de ${pais}`}
      className="rounded-sm border border-zinc-700 shadow-sm object-cover"
    />
  );
}
