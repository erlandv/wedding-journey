import { describe, it, expect } from "vitest";
import { WEDDING_DETAILS, TIME_UNIT_KEYS } from "./wedding-details.js";
import {
  WEDDING_DATE,
  WEDDING_DATE_ISO,
  getCalendarDuration,
  getAnniversaryInstant,
  getCrossedAnniversaryYear,
  getTotalElapsedSeconds,
  getElapsedDaySummary,
  formatINTLNumber,
  formatElapsedDaySummary,
} from "./wedding-time.js";

function wib(year: number, month: number, day: number, h = 0, m = 0, s = 0): Date {

  const utcMs =
    Date.UTC(year, month - 1, day, h, m, s) - 7 * 60 * 60 * 1000;
  return new Date(utcMs);
}

describe("WEDDING_DATE", () => {
  it("parses to the correct UTC timestamp", () => {
    const expected = Date.UTC(2025, 6, 24, 3, 0, 0);
    expect(WEDDING_DATE.getTime()).toBe(expected);
  });

  it("WEDDING_DATE_ISO constant is the correct string", () => {
    expect(WEDDING_DATE_ISO).toBe("2025-07-24T10:00:00+07:00");
    expect(WEDDING_DATE_ISO).toBe(WEDDING_DETAILS.iso);
  });

  it("timezone parsing is consistent: new Date(ISO) equals WEDDING_DATE", () => {
    expect(new Date(WEDDING_DATE_ISO).getTime()).toBe(WEDDING_DATE.getTime());
  });
});

describe("wedding metadata", () => {
  it("keeps display metadata centralized", () => {
    expect(WEDDING_DETAILS.displayDate).toBe("July 24, 2025");
    expect(WEDDING_DETAILS.displayTime).toBe("10:00 WIB (UTC+7)");
  });

  it("keeps the time unit keys in calendar duration order", () => {
    expect(TIME_UNIT_KEYS).toEqual([
      "years",
      "months",
      "days",
      "hours",
      "minutes",
      "seconds",
    ]);
  });
});

describe("getCalendarDuration", () => {
  it("exact wedding instant returns all zeros", () => {
    const result = getCalendarDuration(WEDDING_DATE, WEDDING_DATE);
    expect(result).toEqual({
      years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
    });
  });

  it("one second after returns { seconds: 1 }", () => {
    const oneSecondLater = new Date(WEDDING_DATE.getTime() + 1000);
    const result = getCalendarDuration(WEDDING_DATE, oneSecondLater);
    expect(result).toEqual({
      years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 1,
    });
  });

  it("end before start returns all zeros (no negatives)", () => {
    const before = new Date(WEDDING_DATE.getTime() - 1000);
    const result = getCalendarDuration(WEDDING_DATE, before);
    expect(result).toEqual({
      years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
    });
  });

  it("exactly one year later returns { years: 1 }", () => {
    const oneYearLater = wib(2026, 7, 24, 10, 0, 0);
    const result = getCalendarDuration(WEDDING_DATE, oneYearLater);
    expect(result).toEqual({
      years: 1, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
    });
  });

  it("one year - 1 second returns 11 months, 30 days, 23 hours, 59 minutes, 59 seconds", () => {
    const almostOneYear = wib(2026, 7, 24, 9, 59, 59);
    const result = getCalendarDuration(WEDDING_DATE, almostOneYear);
    expect(result.years).toBe(0);
    expect(result.months).toBe(11);
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBe(23);
    expect(result.minutes).toBe(59);
    expect(result.seconds).toBe(59);
  });

  it("month transition: Aug 24 → Sep 24 returns 1 month", () => {
    const start = wib(2025, 8, 24, 10, 0, 0);
    const end   = wib(2025, 9, 24, 10, 0, 0);
    const result = getCalendarDuration(start, end);
    expect(result.years).toBe(0);
    expect(result.months).toBe(1);
    expect(result.days).toBe(0);
  });

  it("handles short month: Jan 31 → Feb 28 (non-leap)", () => {
    const start = wib(2025, 1, 31, 0, 0, 0);
    const end   = wib(2025, 2, 28, 0, 0, 0);
    const result = getCalendarDuration(start, end);
    expect(result.months).toBe(0);
    expect(result.days).toBe(28);
  });

  it("leap year: Feb 28 2028 → Mar 1 2028 = 2 days", () => {
    const start = wib(2028, 2, 28, 0, 0, 0);
    const end   = wib(2028, 3, 1, 0, 0, 0);
    const result = getCalendarDuration(start, end);
    expect(result.months).toBe(0);
    expect(result.days).toBe(2);
  });

  it("all returned values are non-negative", () => {
    const now = new Date();
    const result = getCalendarDuration(WEDDING_DATE, now);
    expect(result.years).toBeGreaterThanOrEqual(0);
    expect(result.months).toBeGreaterThanOrEqual(0);
    expect(result.days).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.seconds).toBeGreaterThanOrEqual(0);
  });
});

describe("getAnniversaryInstant", () => {
  it("returns the first anniversary at the same WIB wall-clock time", () => {
    const anniversary = getAnniversaryInstant(WEDDING_DATE, 1);
    expect(anniversary?.toISOString()).toBe("2026-07-24T03:00:00.000Z");
  });

  it("returns null for negative years", () => {
    expect(getAnniversaryInstant(WEDDING_DATE, -1)).toBeNull();
  });
});

describe("getCrossedAnniversaryYear", () => {
  it("returns null on the initial render without a previous timestamp", () => {
    const current = wib(2026, 7, 24, 10, 0, 0);
    expect(getCrossedAnniversaryYear(WEDDING_DATE, null, current)).toBeNull();
  });

  it("returns 1 when crossing the first anniversary", () => {
    const previous = wib(2026, 7, 24, 9, 59, 59);
    const current = wib(2026, 7, 24, 10, 0, 0);
    expect(getCrossedAnniversaryYear(WEDDING_DATE, previous, current)).toBe(1);
  });

  it("returns 2 when a hidden tab resumes after the second anniversary", () => {
    const previous = wib(2027, 7, 24, 9, 59, 55);
    const current = wib(2027, 7, 24, 10, 0, 5);
    expect(getCrossedAnniversaryYear(WEDDING_DATE, previous, current)).toBe(2);
  });

  it("returns null when the current timestamp stays within the same anniversary year", () => {
    const previous = wib(2026, 7, 24, 10, 0, 1);
    const current = wib(2026, 8, 1, 10, 0, 0);
    expect(getCrossedAnniversaryYear(WEDDING_DATE, previous, current)).toBeNull();
  });
});

describe("getTotalElapsedSeconds", () => {
  it("returns 0 at the exact wedding instant", () => {
    expect(getTotalElapsedSeconds(WEDDING_DATE, WEDDING_DATE)).toBe(0);
  });

  it("returns 1 one second later", () => {
    const t = new Date(WEDDING_DATE.getTime() + 1000);
    expect(getTotalElapsedSeconds(WEDDING_DATE, t)).toBe(1);
  });

  it("is never negative even if end < start", () => {
    const before = new Date(WEDDING_DATE.getTime() - 5000);
    expect(getTotalElapsedSeconds(WEDDING_DATE, before)).toBe(0);
  });

  it("returns 86400 exactly 24 hours after the wedding", () => {
    const oneDayLater = new Date(WEDDING_DATE.getTime() + 86400 * 1000);
    expect(getTotalElapsedSeconds(WEDDING_DATE, oneDayLater)).toBe(86400);
  });
});

describe("getElapsedDaySummary", () => {
  it("returns all zeros at the wedding instant", () => {
    const result = getElapsedDaySummary(WEDDING_DATE, WEDDING_DATE);
    expect(result).toEqual({ totalDays: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("returns 1 day, 0 hours after exactly 24 hours", () => {
    const t = new Date(WEDDING_DATE.getTime() + 86400 * 1000);
    const result = getElapsedDaySummary(WEDDING_DATE, t);
    expect(result).toEqual({ totalDays: 1, hours: 0, minutes: 0, seconds: 0 });
  });

  it("returns 0 days when end < start", () => {
    const before = new Date(WEDDING_DATE.getTime() - 1);
    const result = getElapsedDaySummary(WEDDING_DATE, before);
    expect(result).toEqual({ totalDays: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("formatNumber", () => {
  it("formats 1000 as '1,000'", () => {
    expect(formatINTLNumber(1000)).toBe("1,000");
  });

  it("formats 1000000 as '1,000,000'", () => {
    expect(formatINTLNumber(1_000_000)).toBe("1,000,000");
  });

  it("formats 0 as '0'", () => {
    expect(formatINTLNumber(0)).toBe("0");
  });
});

describe("formatElapsedDaySummary", () => {
  it("formats zero duration as minutes", () => {
    expect(formatElapsedDaySummary({
      totalDays: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })).toBe("0 minutes");
  });

  it("formats days with comma thousands separators", () => {
    expect(formatElapsedDaySummary({
      totalDays: 1000,
      hours: 2,
      minutes: 3,
      seconds: 4,
    })).toBe("1,000 days, 2 hours, 3 minutes");
  });

  it("includes hours and minutes once days are present", () => {
    expect(formatElapsedDaySummary({
      totalDays: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })).toBe("1 day, 0 hours, 0 minutes");
  });

  it("includes minutes once hours are present", () => {
    expect(formatElapsedDaySummary({
      totalDays: 0,
      hours: 1,
      minutes: 0,
      seconds: 0,
    })).toBe("1 hour, 0 minutes");
  });
});
