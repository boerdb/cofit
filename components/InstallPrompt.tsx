"use client";

import { useEffect, useState } from "react";
import { isAndroidDevice, isIosDevice, isStandaloneMode } from "@/lib/pwa";

const DISMISS_KEY = "cofit-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | null;

export function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => Promise.all(regs.map((r) => r.unregister())))
          .catch(() => undefined);
      }
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if (isStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (isIosDevice()) {
        setPlatform("ios");
        setOpen(true);
      } else if (isAndroidDevice()) {
        setPlatform("android");
        setOpen(true);
      }
    }, 1800);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "1");
      setOpen(false);
    }
  };

  if (!open || !platform) return null;

  return (
    <div className="install-overlay" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <div className="install-card">
        <p className="install-kicker">{platform === "ios" ? "iPhone / iPad" : "Android"}</p>
        <h2 id="install-title">Installeer COFIT op je beginscherm</h2>
        <p className="install-lead">
          Dan open je het ganzenbord als app, zonder browserbalk — handig op de tablet.
        </p>

        {platform === "ios" ? (
          <ol className="install-steps">
            <li>
              Tik op <strong>Delen</strong> (vierkant met pijl omhoog) in Safari
            </li>
            <li>
              Scroll en kies <strong>Zet op beginscherm</strong>
            </li>
            <li>
              Tik op <strong>Voeg toe</strong>
            </li>
          </ol>
        ) : (
          <ol className="install-steps">
            {deferredPrompt ? (
              <li>Tik op <strong>Installeren</strong> hieronder</li>
            ) : (
              <>
                <li>
                  Tik op het <strong>menu</strong> (⋮) rechtsboven in Chrome
                </li>
                <li>
                  Kies <strong>App installeren</strong> of <strong>Toevoegen aan startscherm</strong>
                </li>
              </>
            )}
          </ol>
        )}

        <div className="install-actions">
          {platform === "android" && deferredPrompt ? (
            <button type="button" className="install-btn-primary" onClick={installAndroid}>
              Installeren
            </button>
          ) : null}
          <button type="button" className="install-btn-secondary" onClick={dismiss}>
            Begrepen
          </button>
        </div>
      </div>
    </div>
  );
}
