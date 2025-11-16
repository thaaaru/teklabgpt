import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TekLab AI - Cybersecurity Intelligence Platform",
  description: "Advanced AI-powered cybersecurity intelligence platform for threat analysis and security research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
