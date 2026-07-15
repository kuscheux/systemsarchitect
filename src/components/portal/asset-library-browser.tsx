"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type {
  AssetLibraryProduct,
  AssetLibrarySource,
  AssetLibraryVendor,
  MagnoliaSlideRecord,
  VendorFinish,
} from "@/data/asset-library";

type LibraryView = "products" | "finishes" | "slides" | "sources";

type AssetLibraryBrowserProps = {
  vendors: AssetLibraryVendor[];
  products: AssetLibraryProduct[];
  finishes: VendorFinish[];
  sources: AssetLibrarySource[];
  slides: MagnoliaSlideRecord[];
};

const viewOptions: Array<{ id: LibraryView; label: string }> = [
  { id: "products", label: "Products" },
  { id: "finishes", label: "Finishes" },
  { id: "slides", label: "Magnolia scenes" },
  { id: "sources", label: "Sources" },
];

export function AssetLibraryBrowser({ vendors, products, finishes, sources, slides }: AssetLibraryBrowserProps) {
  const [view, setView] = useState<LibraryView>("products");
  const [query, setQuery] = useState("");
  const [vendor, setVendor] = useState("all");
  const vendorNames = useMemo(() => new Map(vendors.map((item) => [item.id, item.name])), [vendors]);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesVendor = vendor === "all" || product.vendorId === vendor;
    const searchable = [product.name, product.model, product.category, product.summary, product.projectUse, ...product.features, ...product.specifications.flatMap((spec) => [spec.label, spec.value])].filter(Boolean).join(" ").toLowerCase();
    return matchesVendor && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  const filteredFinishes = finishes.filter((finish) => {
    const matchesVendor = vendor === "all" || finish.vendorId === vendor;
    return matchesVendor && (!normalizedQuery || `${finish.name} ${finish.family} ${finish.variation ?? ""}`.toLowerCase().includes(normalizedQuery));
  });
  const filteredSlides = slides.filter((slide) => !normalizedQuery || `${slide.slide} ${slide.title} ${slide.chapter} ${slide.concept} ${slide.extractedText.join(" ")}`.toLowerCase().includes(normalizedQuery));
  const filteredSources = sources.filter((source) => !normalizedQuery || `${source.title} ${source.owner} ${source.kind} ${source.notes ?? ""}`.toLowerCase().includes(normalizedQuery));

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 border border-zinc-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search systems, models, specifications, finishes, or source text" className="h-11 w-full border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-zinc-950" />
        </label>
        <select value={vendor} onChange={(event) => setVendor(event.target.value)} className="h-11 border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-zinc-950">
          <option value="all">All vendors</option>
          {vendors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-zinc-200">
        {viewOptions.map((option) => (
          <button key={option.id} type="button" onClick={() => setView(option.id)} className={`shrink-0 border-b-2 px-4 py-3 text-xs font-medium transition ${view === option.id ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}>
            {option.label}
          </button>
        ))}
      </div>

      {view === "products" ? (
        <div className="grid gap-3">
          {filteredProducts.map((product) => (
            <details key={product.id} className="group border border-zinc-200 bg-white open:border-zinc-400">
              <summary className="grid cursor-pointer list-none gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px_150px] md:items-center">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase text-zinc-500">{vendorNames.get(product.vendorId)} / {product.category}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-normal">{product.name}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{product.projectUse}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase text-zinc-400">Data points</p>
                  <p className="mt-1 text-sm font-medium">{product.specifications.length} specifications</p>
                </div>
                <div className={`inline-flex w-fit items-center gap-2 px-3 py-2 text-xs font-medium ${product.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-800" : product.verificationStatus === "needs-confirmation" ? "bg-amber-50 text-amber-800" : "bg-zinc-100 text-zinc-700"}`}>
                  {product.verificationStatus === "verified" ? <CheckCircle2 size={14} /> : product.verificationStatus === "needs-confirmation" ? <AlertTriangle size={14} /> : <FileText size={14} />}
                  {product.verificationStatus.replaceAll("-", " ")}
                </div>
              </summary>
              <div className="grid gap-8 border-t border-zinc-200 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
                <div>
                  <p className="text-sm leading-6 text-zinc-600">{product.summary}</p>
                  <div className="mt-6 grid gap-px overflow-hidden border border-zinc-200 bg-zinc-200 sm:grid-cols-2 xl:grid-cols-3">
                    {product.specifications.map((specification, index) => (
                      <div key={`${specification.label}-${index}`} className="bg-white p-4">
                        <p className="font-mono text-[8px] uppercase text-zinc-400">{specification.group}</p>
                        <p className="mt-2 text-xs text-zinc-500">{specification.label}</p>
                        <p className="mt-1 text-sm font-medium text-zinc-950">{specification.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase text-zinc-500">Features</p>
                  <ul className="mt-3 grid gap-2 text-sm leading-5 text-zinc-700">
                    {product.features.map((feature) => <li key={feature} className="border-l-2 border-zinc-200 pl-3">{feature}</li>)}
                  </ul>
                  {product.verificationNotes?.length ? (
                    <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                      {product.verificationNotes.map((note) => <p key={note}>{note}</p>)}
                    </div>
                  ) : null}
                </div>
              </div>
            </details>
          ))}
        </div>
      ) : null}

      {view === "finishes" ? (
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-zinc-200 bg-zinc-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filteredFinishes.map((finish) => (
            <article key={finish.id} className="min-h-52 bg-white">
              {finish.swatch ? (
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                  <Image src={finish.swatch} alt={`${finish.name} finish swatch`} fill sizes="(min-width: 1280px) 14vw, (min-width: 768px) 24vw, 48vw" className="object-cover" />
                </div>
              ) : <div className="aspect-[4/3] bg-[#16362c]" aria-label={`${finish.name} custom finish placeholder`} />}
              <div className="p-4">
                <p className="font-mono text-[8px] uppercase text-zinc-400">{vendorNames.get(finish.vendorId)} / {finish.family}</p>
                <h2 className="mt-3 text-sm font-semibold leading-5 tracking-normal">{finish.name}</h2>
                <p className="mt-2 text-xs text-zinc-500">{finish.variation ? `${finish.variation} variation` : "Custom project finish"}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {view === "slides" ? (
        <div className="overflow-hidden border border-zinc-200 bg-white">
          {filteredSlides.map((slide) => (
            <details key={slide.slide} className="border-b border-zinc-200 last:border-b-0">
              <summary className="grid cursor-pointer list-none gap-4 px-5 py-4 md:grid-cols-[48px_180px_minmax(0,1fr)] md:items-center">
                <span className="font-mono text-xs text-zinc-400">{String(slide.slide).padStart(2, "0")}</span>
                <span className="font-mono text-[9px] uppercase text-zinc-500">{slide.chapter}</span>
                <span><strong className="text-sm font-semibold">{slide.title}</strong><span className="ml-3 text-sm text-zinc-500">{slide.concept}</span></span>
              </summary>
              <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-5 md:pl-[248px]">
                <ul className="grid gap-2 text-sm leading-6 text-zinc-700">{slide.extractedText.map((line) => <li key={line}>{line}</li>)}</ul>
              </div>
            </details>
          ))}
        </div>
      ) : null}

      {view === "sources" ? (
        <div className="grid gap-px overflow-hidden border border-zinc-200 bg-zinc-200 md:grid-cols-2">
          {filteredSources.map((source) => (
            <article key={source.id} className="bg-white p-5">
              <p className="font-mono text-[9px] uppercase text-zinc-400">{source.owner} / {source.kind.replaceAll("-", " ")}</p>
              <h2 className="mt-3 text-base font-semibold tracking-normal">{source.title}</h2>
              {source.notes ? <p className="mt-2 text-sm leading-6 text-zinc-600">{source.notes}</p> : null}
              <div className="mt-5 flex items-center justify-between gap-3 text-xs text-zinc-500">
                <span>Retrieved {source.retrievedAt}</span>
                {source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-zinc-950">Open source <ExternalLink size={13} /></a> : source.localPath ? <a href={source.localPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-medium text-zinc-950">Open file <ExternalLink size={13} /></a> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
