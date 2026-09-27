import { Cormorant_Garamond, Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";

/* Self-hosted at build time. style.css reads these through --serif, --display,
   --sans and --mono, so no stylesheet names a font file directly. */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

export const siteFontVariables = [fraunces, cormorant, instrumentSans, jetbrainsMono].map((f) => f.variable).join(" ");
