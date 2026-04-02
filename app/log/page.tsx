"use client";

import dynamic from "next/dynamic";

const LogView = dynamic(() => import("../components/LogView"), { ssr: false });

export default function LogPage() {
  return <LogView />;
}
