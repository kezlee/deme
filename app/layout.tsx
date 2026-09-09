import type { Metadata } from "next";
import { Bebas_Neue, Roboto, Cutive_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-roboto",
});

const cutiveMono = Cutive_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cutive-mono",
});

export const metadata: Metadata = {
  title: "Home",
  description: "HOME",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${roboto.variable} ${cutiveMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
