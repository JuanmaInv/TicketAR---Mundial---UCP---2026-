import Image from 'next/image';

interface BanderaProps {
  pais: string;
  fill?: boolean;
  className?: string;
}

export default function Bandera({ pais, fill = false, className = "" }: BanderaProps) {
  if (!pais) {
    return (
      <div className={`${fill ? 'w-full h-full' : 'w-[44px] h-[32px]'} flex items-center justify-center bg-zinc-800 rounded-sm border border-zinc-700 ${className}`}>
        🌍
      </div>
    );
  }

  // DICCIONARIO MAESTRO AMPLIADO
  const codigos: Record<string, string> = {
    "suiza": "ch",
    "túnez": "tn",
    "tunez": "tn",
    "austria": "at",
    "irán": "ir",
    "iran": "ir",
    "uzbekistán": "uz",
    "uzbekistan": "uz",
    "ghana": "gh",
    "sudáfrica": "za",
    "sudafrica": "za",
    "haití": "ht",
    "haiti": "ht",
    "curazao": "cw",
    "cabo verde": "cv",
    "jordania": "jo",
    "argentina": "ar",
    "brasil": "br",
    "uruguay": "uy",
    "colombia": "co",
    "ecuador": "ec",
    "chile": "cl",
    "paraguay": "py",
    "perú": "pe",
    "peru": "pe",
    "francia": "fr",
    "españa": "es",
    "espana": "es",
    "alemania": "de",
    "inglaterra": "gb-eng",
    "escocia": "gb-sct",
    "italia": "it",
    "portugal": "pt",
    "países bajos": "nl",
    "holanda": "nl",
    "bélgica": "be",
    "belgica": "be",
    "croacia": "hr",
    "canadá": "ca",
    "canada": "ca",
    "usa": "us",
    "estados unidos": "us",
    "méxico": "mx",
    "mexico": "mx",
    "panamá": "pa",
    "panama": "pa",
    "costa rica": "cr",
    "marruecos": "ma",
    "senegal": "sn",
    "nigeria": "ng",
    "egipto": "eg",
    "argelia": "dz",
    "japón": "jp",
    "japon": "jp",
    "corea del sur": "kr",
    "australia": "au",
    "arabia saudí": "sa",
    "arabia saudi": "sa",
    "qatar": "qa",
    "nueva zelanda": "nz",
    "costa de marfil": "ci",
    "noruega": "no",
  };

  const nombreNormalizado = pais.toLowerCase().trim();
  const codigo = codigos[nombreNormalizado];

  if (!codigo) {
    return (
      <div className={`${fill ? 'w-full h-full' : 'w-[44px] h-[32px]'} flex items-center justify-center bg-zinc-800 rounded-sm border border-zinc-700 ${className}`}>
        🌍
      </div>
    );
  }

  const resolucion = fill ? 'w640' : 'w160';

  return (
    <div className={`${fill ? 'w-full h-full relative' : 'w-[44px] h-[32px] relative'} ${className}`}>
      <Image
        src={`https://flagcdn.com/${resolucion}/${codigo}.png`}
        alt={`Bandera de ${pais}`}
        fill={true}
        className="rounded-sm shadow-sm object-cover"
        unoptimized={!fill} // Unoptimized for small flags to avoid processing
      />
    </div>
  );
}
