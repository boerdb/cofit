"use client";

import {
  CELLS,
  CENTER_BOX,
  RIBBON_PATH,
  START_ARROW,
  VIEW_H,
  VIEW_W,
  pawnPosition,
} from "@/lib/board-geometry";
import { TILES, wrapLabel } from "@/lib/tiles";

type Props = {
  position: number;
  inspected: number | null;
  onInspect: (index: number | null) => void;
  children: React.ReactNode;
};

export function Board({ position, inspected, onInspect, children }: Props) {
  const pawn = pawnPosition(position);

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full select-none"
        style={{ fontFamily: "inherit" }}
        role="img"
        aria-label="COFIT ganzenbord"
      >
        <defs>
          <filter id="boardShadow" x="-4%" y="-4%" width="108%" height="112%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodOpacity="0.18" />
          </filter>
          <filter id="cellGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#e06c3a" floodOpacity="0.85" />
          </filter>
        </defs>

        <path
          d={RIBBON_PATH}
          fill="#fbf7ea"
          stroke="#161616"
          strokeWidth="11"
          strokeLinejoin="round"
          filter="url(#boardShadow)"
        />

        <g onClick={() => onInspect(inspected === 0 ? null : 0)} className="cursor-pointer">
          <path
            d={START_ARROW.path}
            fill={TILES[0].fill}
            stroke={position === 0 ? "#e06c3a" : "#161616"}
            strokeWidth={position === 0 ? 7 : 5.5}
            strokeLinejoin="round"
            filter={position === 0 ? "url(#cellGlow)" : undefined}
          />
          <text
            x={START_ARROW.textAt.x}
            y={START_ARROW.textAt.y + 9}
            textAnchor="middle"
            fill="#fff"
            fontSize="26"
            fontWeight="800"
            letterSpacing="1.4"
          >
            START
          </text>
        </g>

        {CELLS.map((cell) => {
          const tile = TILES[cell.index];
          const isCurrent = cell.index === position;
          const isInspected = cell.index === inspected;
          const lines = wrapLabel(tile.short, 10);
          const numberY = cell.centroid.y - (lines.length ? 13 : -6);
          const labelStart = cell.centroid.y + (lines.length === 1 ? 15 : 10);

          return (
            <g
              key={cell.index}
              onClick={() => onInspect(isInspected ? null : cell.index)}
              className="cursor-pointer"
            >
              <path
                d={cell.path}
                fill={tile.fill}
                stroke={isCurrent ? "#e06c3a" : "#161616"}
                strokeWidth={isCurrent ? 7 : 5.5}
                strokeLinejoin="round"
                filter={isCurrent ? "url(#cellGlow)" : undefined}
              />
              <text
                x={cell.centroid.x}
                y={numberY}
                textAnchor="middle"
                fill="#161616"
                fontSize={tile.type === "special" ? 23 : 19}
                fontWeight="800"
              >
                {tile.num}
              </text>
              {lines.map((line, i) => (
                <text
                  key={`${cell.index}-${i}`}
                  x={cell.centroid.x}
                  y={labelStart + i * 13}
                  textAnchor="middle"
                  fill="#161616"
                  fontSize="12"
                  fontWeight="700"
                >
                  {line}
                </text>
              ))}
              {isInspected && !isCurrent && (
                <path d={cell.path} fill="none" stroke="#2fbe80" strokeWidth="4" />
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="pawn"
        style={{
          left: `${(pawn.x / VIEW_W) * 100}%`,
          top: `${(pawn.y / VIEW_H) * 100}%`,
        }}
      />

      <div
        className="absolute flex items-center justify-center overflow-hidden p-1"
        style={{
          left: `${CENTER_BOX.left}%`,
          top: `${CENTER_BOX.top}%`,
          width: `${CENTER_BOX.width}%`,
          height: `${CENTER_BOX.height}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
