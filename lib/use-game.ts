"use client";

import { useCallback, useRef, useState } from "react";
import { playDiceRoll, playLanding, stopSounds } from "./sounds";
import { LAST_TILE, TILES, type Tile } from "./tiles";

export type MessageKind = "info" | "exercise" | "task" | "special" | "win";

export type GameMessage = {
  title?: string;
  text: string;
  kind: MessageKind;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useGame() {
  const [position, setPosition] = useState(0);
  const [dice, setDice] = useState(1);
  const [rollCount, setRollCount] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [skipTurn, setSkipTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [inspected, setInspected] = useState<number | null>(null);
  const [message, setMessage] = useState<GameMessage>({
    text: "Tik op de dobbelsteen of op Gooien om te beginnen.",
    kind: "info",
  });

  const gen = useRef(0);
  const rollCountRef = useRef(0);

  const inspect = useCallback((index: number | null) => {
    setInspected(index);
  }, []);

  const reset = useCallback(() => {
    gen.current += 1;
    stopSounds();
    setPosition(0);
    setDice(1);
    setRollCount(0);
    rollCountRef.current = 0;
    setRolling(false);
    setSkipTurn(false);
    setGameOver(false);
    setInspected(null);
    setMessage({
      text: "Spel gereset. Gooi de dobbelsteen om opnieuw te beginnen.",
      kind: "info",
    });
  }, []);

  const landOn = useCallback(async (pos: number, myGen: number, depth = 0) => {
    setPosition(pos);
    setInspected(null);
    await wait(480);
    if (gen.current !== myGen) return;

    if (depth > 8) {
      setRolling(false);
      return;
    }

    const tile: Tile = TILES[pos];
    if (tile.type === "exercise") {
      setMessage({ title: `Oefening · vakje ${tile.num}`, text: tile.text, kind: "exercise" });
      setRolling(false);
      return;
    }
    if (tile.type === "task") {
      setMessage({
        title: `Opdracht · vakje ${tile.num}`,
        text: tile.text || "Leeg vakje — even rusten.",
        kind: "task",
      });
      setRolling(false);
      return;
    }
    if (tile.type === "start") {
      setMessage({ title: "Start", text: "Je bent bij de start.", kind: "info" });
      setRolling(false);
      return;
    }

    const rule = tile.rule;
    if (!rule) {
      setRolling(false);
      return;
    }

    switch (rule.action) {
      case "back":
        setMessage({ title: `Vakje ${tile.num}`, text: rule.msg, kind: "special" });
        await wait(700);
        if (gen.current !== myGen) return;
        await landOn(Math.max(0, pos - rule.value), myGen, depth + 1);
        return;
      case "forward":
        setMessage({ title: `Vakje ${tile.num}`, text: rule.msg, kind: "special" });
        await wait(700);
        if (gen.current !== myGen) return;
        await landOn(Math.min(LAST_TILE, pos + rule.value), myGen, depth + 1);
        return;
      case "goto":
        setMessage({ title: `Vakje ${tile.num}`, text: rule.msg, kind: "special" });
        await wait(700);
        if (gen.current !== myGen) return;
        await landOn(rule.value, myGen, depth + 1);
        return;
      case "skip":
        setSkipTurn(true);
        setMessage({ title: `Vakje ${tile.num}`, text: rule.msg, kind: "special" });
        setRolling(false);
        return;
      case "reroll":
        setMessage({ title: `Vakje ${tile.num}`, text: rule.msg, kind: "special" });
        setRolling(false);
        return;
      case "win":
        setGameOver(true);
        setMessage({
          title: "Gewonnen!",
          text: `${rule.msg} Je deed er ${rollCountRef.current} worpen over.`,
          kind: "win",
        });
        setRolling(false);
        return;
      default:
        setRolling(false);
    }
  }, []);

  const rollDice = useCallback(async () => {
    if (rolling || gameOver) return;
    playDiceRoll();
    const myGen = gen.current;
    setRolling(true);
    setInspected(null);

    if (skipTurn) {
      setSkipTurn(false);
      rollCountRef.current += 1;
      setRollCount(rollCountRef.current);
      setMessage({
        title: "Beurt overgeslagen",
        text: "Deze beurt telt niet. Nu mag je weer gooien!",
        kind: "special",
      });
      await wait(1100);
      if (gen.current === myGen) setRolling(false);
      return;
    }

    for (let i = 0; i < 10; i++) {
      if (gen.current !== myGen) return;
      setDice(Math.floor(Math.random() * 6) + 1);
      await wait(70);
    }

    const value = Math.floor(Math.random() * 6) + 1;
    setDice(value);
    rollCountRef.current += 1;
    setRollCount(rollCountRef.current);

    let next = position + value;
    if (next > LAST_TILE) {
      next = LAST_TILE - (next - LAST_TILE);
      setMessage({
        title: `Je gooit ${value}`,
        text: "Voorbij het eind! Je stuitert terug.",
        kind: "special",
      });
      await wait(400);
    } else {
      setMessage({ title: `Je gooit ${value}`, text: "Onderweg…", kind: "info" });
    }

    if (gen.current !== myGen) return;
    playLanding(value);
    await landOn(next, myGen);
  }, [gameOver, landOn, position, rolling, skipTurn]);

  const currentTile = TILES[position];
  const inspectedTile = inspected != null ? TILES[inspected] : null;

  return {
    position,
    dice,
    rollCount,
    rolling,
    skipTurn,
    gameOver,
    message,
    currentTile,
    inspected,
    inspectedTile,
    inspect,
    rollDice,
    reset,
  };
}
