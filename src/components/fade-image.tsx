"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

interface FadeImageProps extends Omit<ImageProps, "onLoad"> {
  fadeDelay?: number;
}

export function FadeImage({
  alt,
  className,
  fadeDelay = 0,
  ...props
}: FadeImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => setIsVisible(true), fadeDelay);
        observer.disconnect();
      },
      { rootMargin: "80px", threshold: 0.08 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [fadeDelay]);

  return (
    <div ref={ref} className="ai-photo-grade relative h-full w-full">
      <Image
        {...props}
        alt={alt}
        className={`${className ?? ""} transition-all duration-700 ease-out ${
          isVisible && isLoaded ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
