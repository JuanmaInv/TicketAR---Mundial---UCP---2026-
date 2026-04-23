import React from 'react';

interface BanderaProps {
  pais: string;
  fill?: boolean;
}

export default function Bandera({ pais, fill = false }: BanderaProps) {
  // Diccionario básico de códigos ISO para FlagCDN
  // Agregué los países que vi en tu mock-tickets.ts
  const codigos: Record<string, string> = {
    "Argentina": "ar",
    "Argelia": "dz",
    "Austria": "at",
    "Jordania": "jo"
    "Brasil": "br",
    "Uruguay": "uy",
    "Colombia": "co",
    "Chile": "cl",
    "Ecuador": "ec",
    "Francia": "fr",
    "España": "es",
    "Inglaterra": "gb-eng",
    "Alemania": "de",
    "Italia": "it",
    "Portugal": "pt",
    "Estados Unidos": "us",
    "Mexico": "mx",
    "Canada": "ca",
  };

  const codigo = codigos[pais.trim()];

  // Si no encuentra el país en el diccionario, mostramos un planeta de emoji como resguardo
  if (!codigo) {
    return (
      <div
        className={`${fill ? 'w-full h-full' : 'text-2xl w-[44px] h-[32px]'} flex items-center justify-center bg-zinc-800 rounded-sm border border-zinc-700`}
        title={pais}
      >
        🌍
      </div>
    );
  }

  if (fill) {
    return (
      <img
        src={`https://flagcdn.com/w320/${codigo}.png`}
        alt={`Bandera de ${pais}`}
        className="w-full h-full object-cover"
      />
    );
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
