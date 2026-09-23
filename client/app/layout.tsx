import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "AI Debate Arena", description: "A platform for structured AI debates." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
