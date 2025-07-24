export const WEDDING_DETAILS = {
  iso: "2025-07-24T10:00:00+07:00",
  displayDate: "July 24, 2025",
  displayDateWithOrdinal: "July 24th, 2025",
  displayTime: "10:00 WIB (UTC+7)",
  timezoneLabel: "WIB (UTC+7)",
  siteUrl: "https://wdt.erland.me",
} as const;

export const TIME_UNITS = [
  { key: "years", label: "Years", featured: true },
  { key: "months", label: "Months", featured: true },
  { key: "days", label: "Days", featured: false },
  { key: "hours", label: "Hours", featured: false },
  { key: "minutes", label: "Minutes", featured: false },
  { key: "seconds", label: "Seconds", featured: false },
] as const;

export type TimeUnit = (typeof TIME_UNITS)[number];
export type TimeUnitKey = TimeUnit["key"];
export type TimeUnitLabel = TimeUnit["label"];

export const TIME_UNIT_KEYS = TIME_UNITS.map((unit) => unit.key) as TimeUnitKey[];
