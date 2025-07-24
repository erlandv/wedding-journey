type SecondTickerOptions = {
  onTick: () => void;
  getCurrentTimeMs?: () => number;
};

export function startSecondTicker({
  onTick,
  getCurrentTimeMs = () => Date.now(),
}: SecondTickerOptions): void {
  onTick();

  const msUntilNextSecond = 1000 - (getCurrentTimeMs() % 1000);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const timeoutId = setTimeout(() => {
    onTick();
    intervalId = setInterval(onTick, 1000);
  }, msUntilNextSecond);

  const handleVisibility = (): void => {
    if (document.visibilityState === "visible") {
      onTick();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);

  window.addEventListener(
    "beforeunload",
    () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    },
    { once: true },
  );
}

export function runWhenDomReady(callback: () => void): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}
