import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "1CG | Commercial Glass, Glazing & Facade Systems",
  description:
    "Commercial glazing, curtain wall, storefront, window wall, interior glass, and facade systems across the Southeast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
