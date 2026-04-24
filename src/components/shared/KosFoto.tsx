import { cn } from "@/lib/utils";

type KosFotoProps = {
  foto?: string[];
  nama: string;
  jenis: "putra" | "putri" | "campur";
  className?: string;
};

const jenisGradient = {
  putra: "from-blue-50 via-sky-50 to-blue-100",
  putri: "from-pink-50 via-rose-50 to-pink-100",
  campur: "from-primary-50 via-orange-50 to-amber-100",
};

// Siluet gedung kos minimalis + pattern geometrik Palembang
function KosFotoPlaceholder({ jenis }: { jenis: KosFotoProps["jenis"] }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        jenisGradient[jenis]
      )}
    >
      {/* Pattern songket sangat tipis di background */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="songket" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="#E85D04" strokeWidth="1" />
            <path d="M20 12 L28 20 L20 28 L12 20 Z" fill="none" stroke="#E85D04" strokeWidth="0.7" />
            <line x1="20" y1="4" x2="20" y2="36" stroke="#E85D04" strokeWidth="0.4" />
            <line x1="4" y1="20" x2="36" y2="20" stroke="#E85D04" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#songket)" />
      </svg>

      {/* Siluet gedung kos */}
      <svg
        viewBox="0 0 120 100"
        className="relative z-10 h-24 w-28 opacity-30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bangunan utama */}
        <rect x="20" y="35" width="80" height="65" rx="2" fill="#E85D04" />
        {/* Atap */}
        <path d="M10 38 L60 10 L110 38 Z" fill="#CC5200" />
        {/* Pintu */}
        <rect x="50" y="75" width="20" height="25" rx="2" fill="#FFF3E0" />
        {/* Jendela baris 1 */}
        <rect x="27" y="45" width="15" height="12" rx="1" fill="#FFF3E0" />
        <rect x="52" y="45" width="15" height="12" rx="1" fill="#FFF3E0" />
        <rect x="77" y="45" width="15" height="12" rx="1" fill="#FFF3E0" />
        {/* Jendela baris 2 */}
        <rect x="27" y="62" width="15" height="12" rx="1" fill="#FFF3E0" />
        <rect x="77" y="62" width="15" height="12" rx="1" fill="#FFF3E0" />
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
