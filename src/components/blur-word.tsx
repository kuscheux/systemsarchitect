"use client";

import { useEffect, useState } from "react";

const words = ["fabricate", "install", "coordinate", "finish"];

export function BlurWord() {
  const [index, setIndex] = useState(0);
  const word = words[index];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % words.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      key={word}
      className="inline-block whitespace-nowrap animate-[word-reveal_620ms_cubic-bezier(0.22,1,0.36,1)_both]"
    >
      {word}
    </span>
  );
}
