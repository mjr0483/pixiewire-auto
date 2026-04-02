"use client";

import dynamic from "next/dynamic";

const AgentView = dynamic(() => import("../components/AgentView"), { ssr: false });

export default function AgentPage() {
  return <AgentView />;
}
