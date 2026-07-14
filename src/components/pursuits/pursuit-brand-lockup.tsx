import Image from "next/image";

export function PursuitBrandLockup() {
  return (
    <div className="inline-flex h-11 items-center gap-3 border border-white/14 bg-black/38 px-3 text-white shadow-xl shadow-black/10 backdrop-blur-xl">
      <Image
        src="/logo/1cg-line.svg"
        alt="1CG"
        width={650}
        height={389}
        className="h-6 w-auto brightness-0 invert"
        priority
      />
      <span className="h-5 w-px bg-white/18" aria-hidden="true" />
      <Image
        src="/logo/es-logo.svg"
        alt="ES"
        width={498}
        height={367}
        className="h-6 w-auto"
        priority
      />
      <span className="hidden items-center gap-2 border-l border-white/18 pl-3 font-mono text-[10px] uppercase text-white/54 sm:inline-flex">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
        Active record
      </span>
    </div>
  );
}
