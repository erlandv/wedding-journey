# Wedding Time Journey

A personal web app to track how long it has been since my wedding day. Counting years, months, days, and seconds in real time.

Built with Astro, TypeScript, Canvas Confetti.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with links to both counters |
| `/journey` | Tracking the beautiful progression of time from my wedding day onward |
| `/seconds` | A continuous second-by-second countdown starting from my wedding day. |

## Getting Started

```bash
npm install
npm run dev
npm run build
npm run test
```

## Configuration

All date/time settings live in a single file:

```ts
// src/lib/wedding-details.ts
export const WEDDING_DETAILS = {
  iso: "2025-07-24T10:00:00+07:00",
  // ...
} as const;
```

Use ISO 8601 format with an explicit UTC offset (e.g. `+07:00` for UTC+7 Asia/Jakarta).
This is the single source of truth for all calculations.

## Timezone

All calendar calculations (years / months / days) use **UTC+7 (WIB / Asia/Jakarta)** wall-clock time, so anniversary boundaries are correct regardless of the visitor's local timezone.

## Testing Anniversary Confetti

The `/journey` page accepts query parameters for testing:

| Parameter | Effect |
|---|---|
| `?celebrate=1` | Triggers confetti immediately on load |
| `?now=<ISO datetime>` | Simulates a custom clock time |

Examples:

```
/journey?celebrate=1
/journey?now=2026-07-24T09:59:58%2B07:00
/journey?celebrate=1&now=2026-07-24T10:00:00%2B07:00
```
