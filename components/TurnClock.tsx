"use client";

import { useEffect, useRef, useState } from "react";
import { playClockDone, primeAudio } from "@/lib/sounds";

type Props = {
  seconds: number;
};

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function TurnClock({ seconds }: Props) {
  const [left, setLeft] = useState(seconds);
  const [fraction, setFraction] = useState(0);
  const [running, setRunning] = useState(false);
  const leftRef = useRef(seconds);

  useEffect(() => {
    leftRef.current = left;
  }, [left]);

  useEffect(() => {
    if (!running) return;
    const totalMs = seconds * 1000;
    const end = Date.now() + leftRef.current * 1000;
    let frame = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const ms = Math.max(0, end - Date.now());
      setLeft(ms === 0 ? 0 : Math.ceil(ms / 1000));
      setFraction(1 - ms / totalMs);
      if (ms <= 0) {
        setRunning(false);
        playClockDone();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
    };
  }, [running, seconds]);

  const finished = left === 0;
  const hand = fraction * 360;

  function start() {
    if (running) return;
    primeAudio();
    if (finished) {
      setLeft(seconds);
      setFraction(0);
      leftRef.current = seconds;
    }
    setRunning(true);
  }

  return (
    <div className="turn-clock" data-testid="turn-clock">
      <svg viewBox="0 0 100 100" className="turn-clock-face" aria-hidden>
        <circle cx="50" cy="50" r="46" fill="#fffdf6" stroke="#161616" strokeWidth="5" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="50"
            y1="10"
            x2="50"
            y2={i % 3 === 0 ? 18 : 15}
            stroke="#161616"
            strokeWidth={i % 3 === 0 ? 3 : 2}
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <line
          x1="50"
          y1="54"
          x2="50"
          y2="22"
          stroke="#e06c3a"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hand} 50 50)`}
        />
        <circle cx="50" cy="50" r="4" fill="#161616" />
      </svg>
      <div className="turn-clock-time" aria-live="polite">
        {formatTime(left)}
      </div>
      <button
        type="button"
        onClick={start}
        disabled={running}
        className="turn-clock-start"
      >
        {running ? "Loopt" : finished ? "Opnieuw" : "Start"}
      </button>
    </div>
  );
}
