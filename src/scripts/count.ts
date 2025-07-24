import {
  WEDDING_DATE,
  getTotalElapsedSeconds,
  getElapsedDaySummary,
  formatIDNumber,
  formatElapsedDaySummary,
} from "../lib/wedding-time.js";
import { runWhenDomReady, startSecondTicker } from "./second-ticker.js";

function getEl(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function update(): void {
  const now = new Date();

  const totalSeconds = getTotalElapsedSeconds(WEDDING_DATE, now);
  const secondsEl = getEl("count-seconds");
  if (secondsEl) {
    const formattedSeconds = formatIDNumber(totalSeconds);
    secondsEl.textContent = formattedSeconds;
    secondsEl.setAttribute("aria-label", `${formattedSeconds} seconds since the wedding`);
  }

  const summary = getElapsedDaySummary(WEDDING_DATE, now);
  const summaryEl = getEl("count-summary");
  if (summaryEl) {
    summaryEl.textContent = formatElapsedDaySummary(summary);
  }
}

function startTimer(): void {
  startSecondTicker({ onTick: update });
}

if (typeof window !== "undefined") {
  runWhenDomReady(startTimer);
}
