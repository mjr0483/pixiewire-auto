"use client";

import dynamic from "next/dynamic";

const BreakingView = dynamic(() => import("../components/BreakingView"), { ssr: false });

export default function BreakingPage() {
  return <BreakingView />;
}
