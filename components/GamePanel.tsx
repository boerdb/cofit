"use client";

import { Dice } from "@/components/Dice";
import type { GameMessage } from "@/lib/use-game";
import type { Tile } from "@/lib/tiles";

type Props = {
  dice: number;
  rolling: boolean;
  gameOver: boolean;
  rollCount: number;
  position: number;
  message: GameMessage;
  currentTile: Tile;
  inspectedTile: Tile | null;
  onRoll: () => void;
  onReset: () => void;
  onClearInspect: () => void;
};

const KIND_STYLES: Record<GameMessage["kind"], string> = {
  info: "border-[#d5d1c4] bg-white",
  exercise: "border-[#c8c244] bg-[#fffce0]",
  task: "border-[#8fd4d8] bg-[#f3fcfc]",
  special: "border-[#e08a5a] bg-[#fff1e8]",
  win: "border-[#2fbe80] bg-[#e6faf0]",
};

export function GamePanel({
  dice,
  rolling,
  gameOver,
  rollCount,
  position,
  message,
  currentTile,
  inspectedTile,
  onRoll,
  onReset,
  onClearInspect,
}: Props) {
  const shown = inspectedTile
    ? {
        title:
          inspectedTile.type === "start"
            ? "Start"
            : inspectedTile.type === "exercise"
              ? `Oefening · vakje ${inspectedTile.num}`
              : inspectedTile.type === "task"
                ? `Opdracht · vakje ${inspectedTile.num}`
                : `Speciaal · vakje ${inspectedTile.num}`,
        text:
          inspectedTile.rule?.msg ||
          inspectedTile.text ||
          inspectedTile.short ||
          "Leeg vakje",
        kind:
          inspectedTile.type === "exercise"
            ? "exercise"
            : inspectedTile.type === "special"
              ? "special"
              : inspectedTile.type === "task"
                ? "task"
                : "info",
      }
    : message;

  return (
    <div className="flex h-full w-full max-w-[920px] items-center gap-5 px-4 py-2">
      <div className="flex w-[168px] shrink-0 flex-col items-center justify-center gap-3">
        <Dice value={dice} rolling={rolling} disabled={rolling || gameOver} onClick={onRoll} />
        <button
          type="button"
          onClick={onRoll}
          disabled={rolling || gameOver}
          className="w-full rounded-2xl border-2 border-[#1c7a54] bg-[#2fbe80] px-3 py-2.5 text-base font-extrabold text-white shadow-[0_3px_0_#1c7a54] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          Gooien!
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-2xl border-2 border-[#cfc9ba] bg-white px-3 py-2 text-sm font-bold text-[#5b564c]"
        >
          Reset
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
        <div className="text-center">
          <div className="text-[13px] font-extrabold tracking-[0.18em] text-[#2fbe80]">
            COFIT-2020
          </div>
          <div className="text-lg font-extrabold leading-none text-[#161616]">GANZENBORD</div>
        </div>

        <div className={`rounded-2xl border-2 px-4 py-3 text-center ${KIND_STYLES[shown.kind as GameMessage["kind"]]}`}>
          {shown.title && (
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#6b665c]">
              {shown.title}
            </div>
          )}
          <div className="text-[22px] font-extrabold leading-snug text-[#161616]">{shown.text}</div>
          {inspectedTile && (
            <button
              type="button"
              onClick={onClearInspect}
              className="mt-2 text-xs font-bold text-[#2fbe80]"
            >
              Terug naar huidige beurt
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-1 text-sm font-bold text-[#5b564c]">
          <span>
            Vakje:{" "}
            <strong className="text-[#161616]">
              {position === 0 ? "START" : currentTile.num}
            </strong>
          </span>
          <span>
            Worpen: <strong className="text-[#161616]">{rollCount}</strong>
          </span>
        </div>

        <div className="flex justify-center gap-4 text-[11px] font-bold text-[#6b665c]">
          <LegendDot color="#f3ef6a" label="Oefening" />
          <LegendDot color="#fffdf6" label="Opdracht" />
          <LegendDot color="#d2b0ea" label="Speciaal" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3.5 w-3.5 rounded-[3px] border-2 border-[#161616]"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
