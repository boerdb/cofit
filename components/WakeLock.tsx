"use client";

import { useEffect } from "react";

type ScreenWakeLock = { request: (type: "screen") => Promise<WakeLockSentinel> };

function wakeLockApi(): ScreenWakeLock | null {
  if (typeof navigator === "undefined") return null;
  const lock = (navigator as Navigator & { wakeLock?: ScreenWakeLock }).wakeLock;
  return lock ?? null;
}

/** Keeps the tablet screen on while the board is open. */
export function WakeLock() {
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    let pending = false;
    let stopped = false;

    async function request() {
      if (stopped || sentinel || pending) return;
      if (document.visibilityState !== "visible") return;
      const api = wakeLockApi();
      if (!api) return;
      pending = true;
      try {
        const next = await api.request("screen");
        if (stopped) {
          await next.release();
          return;
        }
        sentinel = next;
        next.addEventListener("release", () => {
          if (sentinel === next) sentinel = null;
        });
      } catch {
        // Low Power Mode, or the tablet wants a tap first.
      } finally {
        pending = false;
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible") void request();
    }

    function onPointerDown() {
      void request();
    }

    void request();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pointerdown", onPointerDown);
      const current = sentinel;
      sentinel = null;
      void current?.release().catch(() => undefined);
    };
  }, []);

  return null;
}
