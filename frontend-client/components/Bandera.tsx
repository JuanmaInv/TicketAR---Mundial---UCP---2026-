import Image from 'next/image';

interface BanderaProps {
  pais: string;
  fill?: boolean;
  className?: string;
}

const CODIGOS = new Map<string, string>([
  ['suiza', 'ch'], ['tunez', 'tn'], ['austria', 'at'], ['iran', 'ir'], ['uzbekistan', 'uz'],
  ['ghana', 'gh'], ['sudafrica', 'za'], ['haiti', 'ht'], ['curazao', 'cw'], ['cabo verde', 'cv'],
  ['jordania', 'jo'], ['argentina', 'ar'], ['brasil', 'br'], ['uruguay', 'uy'], ['colombia', 'co'],
  ['ecuador', 'ec'], ['chile', 'cl'], ['paraguay', 'py'], ['peru', 'pe'], ['francia', 'fr'],
  ['espana', 'es'], ['alemania', 'de'], ['inglaterra', 'gb-eng'], ['escocia', 'gb-sct'], ['italia', 'it'],
  ['portugal', 'pt'], ['paises bajos', 'nl'], ['holanda', 'nl'], ['belgica', 'be'], ['croacia', 'hr'],
  ['canada', 'ca'], ['usa', 'us'], ['estados unidos', 'us'], ['mexico', 'mx'], ['panama', 'pa'],
  ['costa rica', 'cr'], ['marruecos', 'ma'], ['senegal', 'sn'], ['nigeria', 'ng'], ['egipto', 'eg'],
  ['argelia', 'dz'], ['japon', 'jp'], ['corea del sur', 'kr'], ['australia', 'au'], ['arabia saudi', 'sa'],
  ['qatar', 'qa'], ['nueva zelanda', 'nz'], ['costa de marfil', 'ci'], ['noruega', 'no'],
]);

function normalizarPais(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function Bandera({ pais, fill = false, className = '' }: BanderaProps) {
  if (!pais) {
    return (
      <div className={`${fill ? 'w-full h-full' : 'w-[44px] h-[32px]'} flex items-center justify-center bg-zinc-800 rounded-sm border border-zinc-700 ${className}`}>
        ??
      </div>
    );
  }

  const codigo = CODIGOS.get(normalizarPais(pais));

  if (!codigo) {
    return (
      <div className={`${fill ? 'w-full h-full' : 'w-[44px] h-[32px]'} flex items-center justify-center bg-zinc-800 rounded-sm border border-zinc-700 ${className}`}>
        ??
      </div>
    );
  }

  const resolucion = fill ? 'w640' : 'w160';

  return (
    <div className={`${fill ? 'w-full h-full relative' : 'w-[44px] h-[32px] relative'} ${className}`}>
      <Image
        src={`https://flagcdn.com/${resolucion}/${codigo}.png`}
        alt={`Bandera de ${pais}`}
        fill
        className="rounded-sm shadow-sm object-cover"
        sizes={fill ? '(max-width: 768px) 50vw, 33vw' : '44px'}
        loading={fill ? 'eager' : 'lazy'}
        unoptimized={!fill}
      />
    </div>
  );
}
