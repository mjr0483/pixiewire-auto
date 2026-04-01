"use client";

import dynamic from "next/dynamic";

const XPoster = dynamic(() => import("./components/XPoster"), { ssr: false });

export default function Home() {
  return <XPoster />;
}
