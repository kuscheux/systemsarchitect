"use client";

import { useEffect, useState } from "react";

export function LogoIntro() {
  const [svg, setSvg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => setDone(true), 1500);

    fetch("/logo/1cg-line.svg")
      .then((response) => response.text())
      .then((markup) => {
        if (mounted) setSvg(markup);
      })
      .catch(() => {
        if (mounted) setSvg("");
      });

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  if (done) return null;

  return (
    <div className="logo-intro" aria-hidden="true">
      <div className="logo-intro-mark">
        <div className="logo-fill" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="logo-trace" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
    </div>
  );
}
