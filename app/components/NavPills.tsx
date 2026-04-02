"use client";

import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/", label: "Auto-Poster" },
  { href: "/log", label: "Log" },
  { href: "/analytics", label: "Analytics" },
  { href: "/breaking", label: "Breaking" },
  { href: "/agent", label: "Agent" },
];

export default function NavPills() {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
      {PAGES.map((p) => {
        const active = pathname === p.href;
        return (
          <a
            key={p.href}
            href={p.href}
            className={active ? "xp-pill xp-pill-active" : "xp-pill"}
          >
            {p.label}
          </a>
        );
      })}
    </div>
  );
}
