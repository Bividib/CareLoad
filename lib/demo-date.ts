const DEMO_TIME_ZONE = "Europe/London";

export function currentDemoDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEMO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function addDemoDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function demoDateRange(now = new Date(), length = 14) {
  const rangeStart = currentDemoDate(now);
  return {
    rangeStart,
    rangeEnd: addDemoDays(rangeStart, length - 1),
  };
}
