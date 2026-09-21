"use client";

const FACES: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [28, 72],
    [72, 28],
    [72, 72],
  ],
  5: [
    [28, 28],
    [28, 72],
    [50, 50],
    [72, 28],
    [72, 72],
  ],
  6: [
    [28, 24],
    [28, 50],
    [28, 76],
    [72, 24],
    [72, 50],
    [72, 76],
  ],
};

type Props = {
  value: number;
  rolling?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function Dice({ value, rolling, disabled, onClick }: Props) {
  const dots = FACES[value] ?? FACES[1];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Dobbelsteen, ${value}. Tik om te gooien.`}
      className={`relative h-[88px] w-[88px] shrink-0 rounded-[18px] border-[3px] border-[#1c1c1c] bg-white shadow-[2px_4px_0_#1c1c1c] transition-transform active:translate-y-[2px] active:shadow-none disabled:opacity-60 ${
        rolling ? "animate-dice-shake" : "hover:scale-[1.04]"
      }`}
    >
      {dots.map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-[13px] w-[13px] rounded-full bg-[#1c1c1c]"
          style={{ left: `calc(${x}% - 6.5px)`, top: `calc(${y}% - 6.5px)` }}
        />
      ))}
    </button>
  );
}
