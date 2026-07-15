import Image from "next/image";
import type { PresentationAppearance } from "@/data/pursuits/types";

export function PursuitBrandLockup({ appearance = "dark" }: { appearance?: PresentationAppearance }) {
  const light = appearance === "light";
  return (
    <div className={`inline-flex h-10 items-center gap-2.5 border px-2.5 backdrop-blur-xl ${light ? "border-black/12 bg-white/88 text-black" : "border-white/14 bg-black/42 text-white"}`}>
      <Image
        src="/logo/1cg-line.svg"
        alt="1CG"
        width={650}
        height={389}
        className={`h-5 w-auto brightness-0 ${light ? "" : "invert"}`}
        priority
      />
      <span className="h-5 w-px bg-current opacity-18" aria-hidden="true" />
      <Image
        src="/logo/es-logo.svg"
        alt="ES"
        width={498}
        height={367}
        className="h-5 w-auto"
        priority
      />
    </div>
  );
}
