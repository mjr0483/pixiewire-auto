import type { Metadata } from "next";
import LoginGate from "./components/LoginGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixieWire Auto",
  description: "PixieWire automation dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f5f0e8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LoginGate>{children}</LoginGate>
      </body>
    </html>
  );
}
