import { WEDDING_DETAILS } from "./wedding-details.js";

export const WEDDING_DATE_ISO = WEDDING_DETAILS.iso;
export const WEDDING_DATE = new Date(WEDDING_DATE_ISO);
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const ZERO_DURATION: CalendarDuration = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

export type CalendarDuration = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type ElapsedDaySummary = {
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type WibDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
};

export function getCalendarDuration(start: Date, end: Date): CalendarDuration {
  if (end <= start) {
    return { ...ZERO_DURATION };
  }

  const s = toWibParts(start);
  const e = toWibParts(end);

  let years = e.year - s.year;
  let months = e.month - s.month;
  let days = e.day - s.day;

  if (days < 0) {
    months -= 1;
    days += daysInPreviousMonth(e);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let hours = e.hour - s.hour;
  let minutes = e.minute - s.minute;
  let seconds = e.second - s.second;

  if (seconds < 0) {
    minutes -= 1;
    seconds += 60;
  }
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  if (hours < 0) {
    days -= 1;
    hours += 24;

    if (days < 0) {
      months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      days += daysInPreviousMonth(e);
    }
  }

  return { years, months, days, hours, minutes, seconds };
}

export function getAnniversaryInstant(start: Date, years: number): Date | null {
  if (!Number.isInteger(years) || years < 0) {
    return null;
  }

  const wib = toWibParts(start);
  return fromWibParts({
    year: wib.year + years,
    month: wib.month,
    day: wib.day,
    hour: wib.hour,
    minute: wib.minute,
    second: wib.second,
    ms: wib.ms,
  });
}

export function getCrossedAnniversaryYear(
  start: Date,
  previousEnd: Date | null,
  currentEnd: Date,
): number | null {
  if (previousEnd === null || currentEnd <= previousEnd || currentEnd <= start) {
    return null;
  }

  const previousYears = getCalendarDuration(start, previousEnd).years;
  const currentYears = getCalendarDuration(start, currentEnd).years;

  if (currentYears <= 0 || currentYears === previousYears) {
    return null;
  }

  const anniversaryInstant = getAnniversaryInstant(start, currentYears);
  if (anniversaryInstant === null) {
    return null;
  }

  return previousEnd < anniversaryInstant && currentEnd >= anniversaryInstant
    ? currentYears
    : null;
}

export function getTotalElapsedSeconds(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / SECOND_MS));
}

export function getElapsedDaySummary(start: Date, end: Date): ElapsedDaySummary {
  if (end <= start) {
    return { totalDays: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / DAY_MS);
  const remainderMs = diffMs - totalDays * DAY_MS;
  const hours = Math.floor(remainderMs / HOUR_MS);
  const minutes = Math.floor((remainderMs % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((remainderMs % MINUTE_MS) / SECOND_MS);
  return { totalDays, hours, minutes, seconds };
}

export function formatINTLNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatElapsedDaySummary(summary: ElapsedDaySummary): string {
  const parts: string[] = [];

  if (summary.totalDays > 0) {
    parts.push(formatDurationPart(summary.totalDays, "day", true));
  }
  if (summary.hours > 0) {
    parts.push(formatDurationPart(summary.hours, "hour"));
  }
  if (summary.minutes > 0 || parts.length === 0) {
    parts.push(formatDurationPart(summary.minutes, "minute"));
  }

  return parts.join(", ");
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function daysInPreviousMonth(parts: WibDateParts): number {
  const month = parts.month === 1 ? 12 : parts.month - 1;
  const year = parts.month === 1 ? parts.year - 1 : parts.year;
  return daysInMonth(year, month);
}

function formatDurationPart(value: number, unit: string, formatNumber = false): string {
  const displayValue = formatNumber ? formatINTLNumber(value) : String(value);
  return `${displayValue} ${value === 1 ? unit : `${unit}s`}`;
}

function toWibParts(d: Date): WibDateParts {
  const utc = d.getTime() + WIB_OFFSET_MS;
  const t = new Date(utc);
  return {
    year: t.getUTCFullYear(),
    month: t.getUTCMonth() + 1,
    day: t.getUTCDate(),
    hour: t.getUTCHours(),
    minute: t.getUTCMinutes(),
    second: t.getUTCSeconds(),
    ms: t.getUTCMilliseconds(),
  };
}

function fromWibParts(parts: WibDateParts): Date {
  const utcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.ms,
  ) - WIB_OFFSET_MS;
  return new Date(utcMs);
}
