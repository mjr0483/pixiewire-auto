const ET_TIMEZONE = "America/New_York";

export function getTodayET(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function getTodayStartET(): string {
  const todayStr = getTodayET();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIMEZONE,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(new Date());
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  const offsetMatch = offsetPart?.value?.match(/GMT([+-]?\d+)/);
  const offsetHours = offsetMatch ? Number.parseInt(offsetMatch[1], 10) : -5;

  const midnightET = new Date(`${todayStr}T00:00:00.000Z`);
  midnightET.setUTCHours(midnightET.getUTCHours() - offsetHours);
  return midnightET.toISOString();
}

export function getCurrentTimeET(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

export function getScheduledTimestampUTC(timeET: string, dateET?: string): string {
  const today = dateET || getTodayET();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIMEZONE,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(new Date());
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  const offsetMatch = offsetPart?.value?.match(/GMT([+-]?\d+)/);
  const offsetHours = offsetMatch ? Number.parseInt(offsetMatch[1], 10) : -5;

  const dt = new Date(`${today}T${timeET}:00.000Z`);
  dt.setUTCHours(dt.getUTCHours() - offsetHours);
  return dt.toISOString();
}
