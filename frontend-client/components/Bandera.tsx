import React from 'react';

interface BanderaProps {
  pais: string;
  fill?: boolean;
}

export default function Bandera({ pais, fill = false }: BanderaProps) {
  // Guard: si pais es undefined, null o string vacío, mostramos fallback inmediatamente
  if (!pais) {
    return (
      <div
        className={`${fill ? 'w-full h-full' : 'text-2xl w-[44px] h-[32px]'} flex items-center justify-center bg-zinc-800 rounded-sm border border-zinc-700`}
        title="País desconocido"
      >
        🌍
      </div>
    );
  }
  // Diccionario básico de códigos ISO para FlagCDN
  // Agregué los países que vi en tu mock-tickets.ts
  const codigos: Record<string, string> = {
    "Alemania": "de",
    "Arabia Saudí": "sa",
    "Argelia": "dz",
    "Argentina": "ar",
    "Australia": "au",
    "Austria": "at",
    "Bélgica": "be",
    "Bosnia y Herzegovina": "ba",
    "Brasil": "br",
    "Cabo Verde": "cv",
    "Canadá": "ca",
    "Colombia": "co",
    "Corea del Sur": "kr",
    "Costa de Marfil": "ci",
    "Croacia": "hr",
    "Curazao": "cw",
    "Ecuador": "ec",
    "Egipto": "eg",
    "Escocia": "gb-sct",
    "España": "es",
    "Estados Unidos": "us",
    "Francia": "fr",
    "Ghana": "gh",
    "Haití": "ht",
    "Inglaterra": "gb-eng",
    "Irak": "iq",
    "Irán": "ir",
    "Japón": "jp",
    "Jordania": "jo",
    "Marruecos": "ma",
    "México": "mx",
    "Noruega": "no",
    "Nueva Zelanda": "nz",
    "Países Bajos": "nl",
    "Panamá": "pa",
    "Paraguay": "py",
    "Portugal": "pt",
    "Qatar": "qa",
    "RD Congo": "cd",
    "República Checa": "cz",
    "Senegal": "sn",
    "Sudáfrica": "za",
    "Suecia": "se",
    "Suiza": "ch",
    "Túnez": "tn",
    "Turquía": "tr",
    "Uruguay": "uy",
    "Uzbekistán": "uz",
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
