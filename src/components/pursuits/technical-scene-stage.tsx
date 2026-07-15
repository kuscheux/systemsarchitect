import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ObjModelViewer } from "@/components/pursuits/obj-model-viewer";
import type { PresentationAppearance, ProductVisual, PursuitScene, TechnicalDetail } from "@/data/pursuits/types";

type TechnicalSceneStageProps = {
  scene: PursuitScene;
  appearance: PresentationAppearance;
};

function DetailReference({ detail }: { detail: TechnicalDetail }) {
  const primaryReference = detail.sourceStatus === "reference-assembly" ? detail.detail : detail.sheet;
  const secondaryReference = detail.sourceStatus === "reference-assembly" ? "Reference assembly" : detail.detail;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-black/12 pt-2 font-mono text-[9px] uppercase text-black/48">
      <span>{primaryReference}</span>
      <span>{secondaryReference}</span>
    </div>
  );
}

function ProductRender({ visual }: { visual: ProductVisual }) {
  return (
    <figure className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-black/12 bg-white">
      <div className="relative min-h-0 bg-[#f4f6f9]">
        <Image
          src={visual.image}
          alt={visual.alt}
          fill
          priority
          sizes="(min-width: 1024px) 28vw, 100vw"
          className="object-contain"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-3 border-t border-black/10 px-4 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase text-black/42">Official ES product render</p>
          <p className="mt-1 text-xs font-semibold text-black">{visual.title}</p>
        </div>
        <a
          href={visual.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="grid size-8 shrink-0 place-items-center border border-black/12 text-black/58 transition hover:border-black hover:text-black"
          aria-label={`Open ${visual.title} source`}
        >
          <ArrowUpRight size={14} />
        </a>
      </figcaption>
    </figure>
  );
}

function SingleDetail({ scene, detail }: { scene: PursuitScene; detail: TechnicalDetail }) {
  const hasModel = Boolean(scene.modelUrl);
  const productVisual = scene.productVisuals?.[0];
  return (
    <section className="absolute inset-0 z-20 grid min-h-0 grid-cols-1 gap-5 px-5 pb-20 pt-20 text-black sm:px-8 lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] lg:gap-10 lg:px-12 lg:pb-24 lg:pt-24">
      <div className="flex min-h-0 flex-col lg:py-4">
        <p className="font-mono text-[10px] uppercase text-[#b3192b]">{scene.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-balance text-[clamp(2.8rem,5.6vw,6.6rem)] font-semibold leading-[0.92] tracking-normal">
          {scene.title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-black/62 lg:text-base lg:leading-7">
          {scene.lead}
        </p>

        <div className="mt-auto hidden border-t border-black/14 pt-5 lg:block">
          <p className="font-mono text-[9px] uppercase text-black/42">Detail callouts</p>
          <ol className="mt-4 grid gap-3">
            {detail.callouts.map((callout, index) => (
              <li key={callout} className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-5 text-black/72">
                <span className="grid size-6 place-items-center bg-black font-mono text-[9px] text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{callout}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {hasModel ? (
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_112px] gap-3">
          <div className={`grid min-h-0 gap-3 ${productVisual ? "md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]" : "grid-cols-1"}`}>
            {productVisual ? <ProductRender visual={productVisual} /> : null}
            <div className={`${productVisual ? "hidden md:block" : "block"} min-h-0`}>
              <ObjModelViewer src={scene.modelUrl!} label={scene.modelLabel ?? detail.title} />
            </div>
          </div>
          <figure className="grid min-h-0 grid-cols-[160px_1fr] overflow-hidden border border-black/12 bg-white">
            <div className="relative min-h-0 border-r border-black/10">
              <Image src={detail.image} alt={detail.alt} fill sizes="160px" className="object-contain" />
            </div>
            <figcaption className="flex min-w-0 flex-col justify-center px-4 py-3">
              <p className="text-xs font-semibold text-black">{detail.title}</p>
              <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-black/58">{detail.callouts[0]}</p>
              <DetailReference detail={detail} />
            </figcaption>
          </figure>
        </div>
      ) : (
        <figure className="relative min-h-0 overflow-hidden border border-black/12 bg-white">
          <Image src={detail.image} alt={detail.alt} fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-contain" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-white/94 px-4 pb-3 pt-3 backdrop-blur-sm">
            <p className="text-xs font-semibold text-black">{detail.title}</p>
            <DetailReference detail={detail} />
          </figcaption>
        </figure>
      )}
    </section>
  );
}

function DetailCard({ detail, compact = false }: { detail: TechnicalDetail; compact?: boolean }) {
  return (
    <article className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-black/12 bg-white">
      <div className="relative min-h-0">
        <Image src={detail.image} alt={detail.alt} fill sizes={compact ? "26vw" : "32vw"} className="object-contain" />
      </div>
      <div className="border-t border-black/10 p-3 sm:p-4">
        <p className="text-[11px] font-semibold leading-4 text-black sm:text-sm">{detail.title}</p>
        <DetailReference detail={detail} />
        {!compact ? (
          <p className="mt-3 text-[11px] leading-4 text-black/58">{detail.callouts[0]}</p>
        ) : null}
      </div>
    </article>
  );
}

function MultiDetail({ scene, details }: { scene: PursuitScene; details: TechnicalDetail[] }) {
  const isOverview = scene.technicalLayout === "overview";
  const isPaired = scene.technicalLayout === "paired";

  return (
    <section className="absolute inset-0 z-20 flex min-h-0 flex-col px-5 pb-20 pt-20 text-black sm:px-8 lg:px-12 lg:pb-24 lg:pt-24">
      <header className={`grid shrink-0 gap-5 ${isOverview ? "lg:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.58fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)]"}`}>
        <div>
          <p className="font-mono text-[10px] uppercase text-[#b3192b]">{scene.eyebrow}</p>
          <h1 className="mt-3 max-w-5xl text-balance text-[clamp(2.45rem,4.8vw,5.8rem)] font-semibold leading-[0.92] tracking-normal">
            {scene.title}
          </h1>
        </div>
        <p className="max-w-2xl self-end text-sm leading-6 text-black/60 lg:text-base lg:leading-7">
          {scene.lead}
        </p>
      </header>

      <div className={`mt-6 grid min-h-0 flex-1 gap-3 lg:mt-8 ${isOverview ? "grid-cols-3" : isPaired ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
        {details.map((detail) => (
          <DetailCard key={detail.id} detail={detail} compact={isOverview} />
        ))}
      </div>

      {!isOverview ? (
        <div className={`mt-3 hidden gap-3 lg:grid ${isPaired ? "grid-cols-2" : "grid-cols-3"}`}>
          {details.map((detail, index) => (
            <div key={`${detail.id}-callout`} className="grid grid-cols-[24px_1fr] gap-3 border-t border-black/14 pt-3">
              <span className="grid size-6 place-items-center bg-black font-mono text-[9px] text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-xs leading-5 text-black/62">{detail.callouts[1] ?? detail.callouts[0]}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function TechnicalSceneStage({ scene, appearance }: TechnicalSceneStageProps) {
  const details = scene.technicalDetails ?? [];
  if (!details.length) return null;

  return (
    <>
      <div className={`pointer-events-none absolute inset-0 ${appearance === "light" ? "bg-[#f2f2ef]" : "bg-[#dcdedc]"}`} />
      {scene.technicalLayout === "single" ? (
        <SingleDetail scene={scene} detail={details[0]} />
      ) : (
        <MultiDetail scene={scene} details={details} />
      )}
    </>
  );
}
