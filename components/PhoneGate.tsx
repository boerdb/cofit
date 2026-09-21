"use client";

import { useEffect, useState } from "react";
import { isPhoneDevice } from "@/lib/pwa";

export function PhoneGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isPhoneDevice());
  }, []);

  if (!show) return null;

  return (
    <div className="phone-gate" role="dialog" aria-modal="true" aria-labelledby="phone-gate-title">
      <div className="phone-gate-card">
        <div className="phone-gate-icon" aria-hidden>
          ▦
        </div>
        <h2 id="phone-gate-title">Open op een tablet</h2>
        <p>
          Dit ganzenbord is gemaakt voor tablet in landscape — niet voor telefoon.
        </p>
        <p className="phone-gate-url">
          Open op je tablet:
          <br />
          <strong>cofit.clvs.nl</strong>
        </p>
      </div>
    </div>
  );
}
