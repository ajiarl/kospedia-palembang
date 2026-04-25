import { cn } from "@/lib/utils";

type KosFotoProps = {
  foto?: string[];
  nama: string;
  jenis: "putra" | "putri" | "campur";
  className?: string;
};

// Gradient aligned dengan Navy+Teal palette
const jenisGradient = {
  putra:  "from-[#E6F4F0] via-[#C0E3D9] to-[#E6F4F0]",  // primary-50/100 teal
  putri:  "from-[#FFF3EA] via-[#FFD9B8] to-[#FFF3EA]",  // accent-50/100 orange
  campur: "from-[#EEF2F6] via-[#DCE4ED] to-[#EEF2F6]",  // cool blue-grey neutral
};

function KosFotoPlaceholder({ jenis }: { jenis: KosFotoProps["jenis"] }) {
  const strokeColor = jenis === "putri" ? "#FF8C42" : "#1E6B5A";
  const roofColor   = jenis === "putri" ? "#E6702A" : "#175849";

  return (
    <div className={cn("relative flex h-full w-full items-center justify-center bg-gradient-to-br", jenisGradient[jenis])}>
      {/* Pattern songket tipis */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`songket-${jenis}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke={strokeColor} strokeWidth="1" />
            <path d="M20 12 L28 20 L20 28 L12 20 Z" fill="none" stroke={strokeColor} strokeWidth="0.7" />
            <line x1="20" y1="4" x2="20" y2="36" stroke={strokeColor} strokeWidth="0.4" />
            <line x1="4" y1="20" x2="36" y2="20" stroke={strokeColor} strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#songket-${jenis})`} />
      </svg>

      {/* Siluet gedung */}
      <svg viewBox="0 0 120 100" className="relative z-10 h-24 w-28 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="35" width="80" height="65" rx="2" fill={strokeColor} />
        <path d="M10 38 L60 10 L110 38 Z" fill={roofColor} />
        <rect x="50" y="75" width="20" height="25" rx="2" fill="white" opacity="0.6" />
        <rect x="27" y="45" width="15" height="12" rx="1" fill="white" opacity="0.5" />
        <rect x="52" y="45" width="15" height="12" rx="1" fill="white" opacity="0.5" />
        <rect x="77" y="45" width="15" height="12" rx="1" fill="white" opacity="0.5" />
        <rect x="27" y="62" width="15" height="12" rx="1" fill="white" opacity="0.5" />
        <rect x="77" y="62" width="15" height="12" rx="1" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}

export default function KosFoto({ foto, nama, jenis, className }: KosFotoProps) {
  const hasFoto = foto && foto.length > 0;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {hasFoto ? (
        <img
          src={foto[0]}
          alt={nama}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <KosFotoPlaceholder jenis={jenis} />
      )}
    </div>
  );
}
