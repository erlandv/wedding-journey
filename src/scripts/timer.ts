import confetti from "canvas-confetti";
import { TIME_UNIT_KEYS } from "../lib/wedding-details.js";
import {
  WEDDING_DATE,
  getCalendarDuration,
  getCrossedAnniversaryYear,
} from "../lib/wedding-time.js";
import { runWhenDomReady, startSecondTicker } from "./second-ticker.js";

type TimerRuntimeOptions = {
  forceCelebrate: boolean;
  getNow: () => Date;
};

function getElement(id: string): HTMLElement | null {
  return document.getElementById(`time-val-${id}`);
}

function update(now: Date): void {
  const duration = getCalendarDuration(WEDDING_DATE, now);

  for (const key of TIME_UNIT_KEYS) {
    const el = getElement(key);
    if (el) {
      const value = String(duration[key]);
      el.textContent = value;
      el.setAttribute("aria-label", `${key}: ${value}`);
    }
  }
}

function getRuntimeOptions(): TimerRuntimeOptions {
  const searchParams = new URLSearchParams(window.location.search);
  const simulatedNow = parseSimulatedNow(searchParams.get("now"));
  const forceCelebrate = isTruthyParam(searchParams.get("celebrate"));

  if (simulatedNow === null) {
    return {
      forceCelebrate,
      getNow: () => new Date(),
    };
  }

  const startedAtMs = Date.now();
  return {
    forceCelebrate,
    getNow: () => new Date(simulatedNow.getTime() + (Date.now() - startedAtMs)),
  };
}

function isTruthyParam(value: string | null): boolean {
  if (value === null) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseSimulatedNow(value: string | null): Date | null {
  if (value === null) return null;

  const candidates = [
    value,
    value.replace(/ (\d{2}:\d{2})$/, "+$1"),
  ];

  for (const candidate of candidates) {
    const parsedMs = Date.parse(candidate);
    if (!Number.isNaN(parsedMs)) {
      return new Date(parsedMs);
    }
  }

  return null;
}

function launchAnniversaryConfetti(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const burst = (originX: number, angle: number, particleCount: number): void => {
    confetti({
      angle,
      spread: 68,
      startVelocity: 42,
      particleCount,
      gravity: 0.92,
      ticks: 220,
      scalar: 0.95,
      origin: { x: originX, y: 0.14 },
      colors: ["#4f46e5", "#e11d48", "#f59e0b", "#ffffff"],
    });
  };

  burst(0.18, 62, 90);
  burst(0.82, 118, 90);

  window.setTimeout(() => {
    burst(0.28, 74, 60);
    burst(0.72, 106, 60);
  }, 180);
}

function startTimer(): void {
  const { forceCelebrate, getNow } = getRuntimeOptions();
  let previousNow: Date | null = null;
  let forcedCelebrationShown = false;

  const tick = (): void => {
    const now = getNow();
    update(now);

    if (forceCelebrate && !forcedCelebrationShown) {
      launchAnniversaryConfetti();
      forcedCelebrationShown = true;
    } else if (getCrossedAnniversaryYear(WEDDING_DATE, previousNow, now) !== null) {
      launchAnniversaryConfetti();
    }

    previousNow = now;
  };

  startSecondTicker({ onTick: tick });
}

if (typeof window !== "undefined") {
  runWhenDomReady(startTimer);
}
