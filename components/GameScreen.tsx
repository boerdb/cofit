"use client";

import { Board } from "@/components/Board";
import { GamePanel } from "@/components/GamePanel";
import { PhoneGate } from "@/components/PhoneGate";
import { useGame } from "@/lib/use-game";
import { durationSeconds } from "@/lib/tiles";

export function GameScreen() {
  const game = useGame();
  const clockSeconds =
    game.rolling || game.gameOver ? null : durationSeconds(game.currentTile);

  return (
    <main className="game-shell">
      <div className="board-frame">
        <Board
          position={game.position}
          inspected={game.inspected}
          clockSeconds={clockSeconds}
          onInspect={game.inspect}
        >
          <GamePanel
            dice={game.dice}
            rolling={game.rolling}
            gameOver={game.gameOver}
            rollCount={game.rollCount}
            position={game.position}
            message={game.message}
            currentTile={game.currentTile}
            inspectedTile={game.inspectedTile}
            onRoll={game.rollDice}
            onReset={game.reset}
            onClearInspect={() => game.inspect(null)}
          />
        </Board>
      </div>

      <div className="brand-credit" aria-label="Fysiotherapie en Training">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-fysioharlingen.png?v=3"
          alt="Fysiotherapie en Training"
          width={92}
          height={36}
        />
        <span>© 2026 V 0.1.1</span>
      </div>

      <div className="rotate-hint">
        <div className="rotate-card">
          <div className="text-4xl">↻</div>
          <h2>Draai je tablet</h2>
          <p>Dit ganzenbord is gemaakt voor landscape.</p>
        </div>
      </div>

      <PhoneGate />
    </main>
  );
}
