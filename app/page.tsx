"use client";

import dynamic from "next/dynamic";

export const fetchCache = "force-no-store";

const XPoster = dynamic(() => import("./components/XPoster"), { ssr: false });

export default function Home() {
  return <XPoster />;
}
