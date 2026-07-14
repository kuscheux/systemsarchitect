"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoIntro } from "@/components/logo-intro";
import { SessionRecorder } from "@/components/session-recorder";

const nav = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Markets", "/markets"],
  ["Project Pins", "/project-pins"],
  ["Facility", "/facility"],
  ["Precon", "/send-plans"],
];

const offices = [
  {
    city: "Charlotte HQ + Fabrication",
    address: "620 Radiator Road, Building #4, Indian Trail, NC 28079",
    phone: "704 291 7711",
    tel: "+17042917711",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=620%20Radiator%20Road%2C%20Building%204%2C%20Indian%20Trail%2C%20NC%2028079",
  },
  {
    city: "Charleston Office",
    address: "62 Brigade Street, Charleston, SC 29403",
    phone: "843 459 7711",
    tel: "+18434597711",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=62%20Brigade%20Street%2C%20Charleston%2C%20SC%2029403",
  },
  {
    city: "Atlanta Office",
    address: "4830 Fulton Industrial Blvd. SW, Atlanta, GA 30336",
    phone: "404 446 3555",
    tel: "+14044463555",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=4830%20Fulton%20Industrial%20Blvd%20SW%2C%20Atlanta%2C%20GA%2030336",
  },
];

const footerLinks = [
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Project Pins", "/project-pins"],
  ["Markets", "/markets"],
  ["Facility", "/facility"],
  ["Submit Plans", "/send-plans"],
  ["Careers", "/careers"],
  ["Contact", "/contact"],
  ["Client Account", "/account"],
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const hasDarkHero =
    pathname === "/" ||
    pathname === "/facility" ||
    pathname.startsWith("/projects/");
  const useDarkTop = hasDarkHero && !isScrolled && !isOpen;
  const showSurface = isScrolled || isOpen || !hasDarkHero;
  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 transition-all duration-300 sm:px-5 lg:px-8">
      <nav
        className={`pointer-events-auto mx-auto mt-4 w-full max-w-[1400px] transition-all duration-300 ${
          showSurface
            ? "rounded-full border border-border bg-background/95 shadow-[0_24px_80px_rgba(10,12,16,0.12)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-14 items-center gap-5 px-4 transition-all duration-300 sm:px-6 lg:px-7">
          <Link href="/" className="group flex shrink-0 items-center">
            <Image
              src="/logo/1cg-line.svg"
              alt="1CG"
              width={120}
              height={72}
              priority
              className={`h-auto w-[76px] transition duration-300 ${
                useDarkTop ? "brightness-0 invert" : "brightness-0"
              }`}
            />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
            {nav.slice(1).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`group relative text-sm transition ${
                  useDarkTop
                    ? "text-white/76 hover:text-white"
                    : isActive(href)
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                }`}
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <div className="hidden shrink-0 items-center lg:flex">
            <Link
              href="/start-project"
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                useDarkTop
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-foreground text-background hover:opacity-80"
              }`}
            >
              Start a Project <ArrowRight size={15} />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className={`ml-auto lg:hidden ${useDarkTop ? "text-white" : "text-foreground"}`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[-1] bg-background transition-all duration-500 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-center gap-7 px-8">
          {nav.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`text-5xl font-semibold tracking-[-0.065em] transition-all duration-500 ${
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: isOpen ? `${index * 55}ms` : "0ms" }}
            >
              {href === "/send-plans" ? "Precon" : label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="noise-overlay relative overflow-hidden border-t border-white/10 bg-[#070707] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_42%)]" />
      <div className="relative mx-auto max-w-[1500px] px-6 py-16 md:px-12 lg:px-16 lg:py-20">
        <div className="grid gap-10 border-b border-white/12 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <Image
              src="/logo/1cg-line.svg"
              alt="1CG"
              width={180}
              height={108}
              className="h-auto w-[112px] brightness-0 invert"
            />
            <h2 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.075em] md:text-7xl">
              Glass, glazing, and façade execution across the Southeast.
            </h2>
          </div>
          <div className="lg:max-w-xl lg:justify-self-end">
            <Link
              href="/start-project"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/88"
            >
              Start a Project <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 border-b border-white/12 py-12 lg:grid-cols-[0.55fr_1.45fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/44">
              Contact
            </p>
            <div className="mt-6 grid gap-3">
              <a
                href="tel:+17042917711"
                className="group inline-flex items-center gap-3 text-2xl font-semibold tracking-[-0.045em] text-white"
              >
                <Phone size={19} className="text-white/42" />
                704 291 7711
              </a>
              <a
                href="mailto:estimating@glass1st.net"
                className="inline-flex items-center gap-3 text-sm text-white/68 transition hover:text-white"
              >
                <Mail size={16} />
                estimating@glass1st.net
              </a>
              <a
                href="mailto:accountspayable@glass1st.net"
                className="inline-flex items-center gap-3 text-sm text-white/68 transition hover:text-white"
              >
                <Mail size={16} />
                accountspayable@glass1st.net
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {offices.map((office, index) => (
              <article
                key={office.city}
                className="rounded-[18px] border border-white/12 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.20)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/42">
                      0{index + 1} / Office
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold leading-none tracking-[-0.055em]">
                      {office.city}
                    </h3>
                  </div>
                  <Building2 size={18} className="mt-1 text-white/36" />
                </div>
                <p className="mt-5 min-h-12 text-sm leading-6 text-white/58">
                  {office.address}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={`tel:${office.tel}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/16"
                  >
                    <Phone size={13} />
                    {office.phone}
                  </a>
                  <a
                    href={office.directions}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-white/86"
                  >
                    <MapPin size={13} />
                    Directions
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-[1fr_1fr_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/44">
              Navigate
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/62">
              {footerLinks.map(([label, href]) => (
                <Link key={href} href={href} className="transition hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/44">
              Proof
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["100,000", "sq. ft. facility"],
                ["72", "featured projects"],
                ["3", "office markets"],
                ["2025", "facility opened"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-3xl font-semibold tracking-[-0.065em]">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-white/42">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/12 bg-white/[0.035] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/44">
              Best first step
            </p>
            <p className="mt-4 text-2xl font-semibold leading-[1.02] tracking-[-0.055em]">
              Send the drawings and give estimating a clean first look.
            </p>
            <Link
              href="/send-plans"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white"
            >
              Submit plans <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/12 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
          <span>© 2026 1CG. Commercial glazing and façade systems.</span>
          <span>Charlotte · Charleston · Atlanta</span>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionRecorder />
      <LogoIntro />
      <Header />
      {children}
      <Footer />
    </>
  );
}
