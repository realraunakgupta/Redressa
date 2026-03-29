import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Redressa AI - Consumer Redressal Agent",
  description:
    "Agentic consumer redressal workflow that turns messy complaint evidence into grounded, escalation-ready claim packages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
