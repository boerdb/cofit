export type Point = { x: number; y: number };

export type CellGeom = {
  index: number;
  centroid: Point;
  innerMid: Point;
  path: string;
};

export const VIEW_W = 1600;
export const VIEW_H = 1000;

/** Middle of the straight spine that the whole spiral is offset from. */
const CX = 800;
const CY = 500;
/** Half the length of that spine; the track wraps around both of its ends. */
const SPINE_HALF = 310;
/** Distance from the spine to the outer edge of square 1. */
const START_OFFSET = 462;
/** Lane depth. Every lap steps exactly this far inwards, so laps tile exactly. */
const CELL_DEPTH = 120;
/** Squares per lap, from the outside in. */
const LAP_CELLS = [35, 27];
const LAPS = LAP_CELLS.length;
/**
 * Fraction of a lap spent stepping inwards; the step ends on the lap boundary.
 * Keep it at or below 0.25 so the step stays inside the left cap and the
 * straight stretches remain level.
 */
const STEP_SPAN = 0.17;

const HOLE_OFFSET = START_OFFSET - CELL_DEPTH * LAPS;

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Snap a coordinate onto a fixed grid. `Math.cos` and `Math.sin` are allowed to
 * differ in their last bit between engines, so Node and the browser can arrive
 * at very slightly different numbers for the same square. React reports that as
 * a hydration mismatch, so every point the board is built from is snapped.
 */
function snap(x: number, y: number): Point {
  return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 };
}

/** `Math.sqrt` is exact under IEEE 754 where `Math.hypot` is not, so portable. */
function distance(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function polygon(points: Point[]): string {
  return `M ${points.map((p) => `${r2(p.x)} ${r2(p.y)}`).join(" L ")} Z`;
}

function smoothstep(x: number) {
  const t = x < 0 ? 0 : x > 1 ? 1 : x;
  return t * t * (3 - 2 * t);
}

/**
 * Point that sits `offset` away from the spine, at `station` of one lap. A lap
 * is split into four equal stretches of station: bottom straight, right cap,
 * top straight, left cap. Station marks a fixed place on the track shape rather
 * than a fraction of its length, so two points sharing a station always line up
 * square to the track however far apart their offsets are.
 */
function trackPoint(offset: number, station: number): Point {
  const u = (((station % 1) + 1) % 1) * 4;

  if (u <= 1) {
    return snap(CX - SPINE_HALF + u * 2 * SPINE_HALF, CY + offset);
  }
  if (u <= 2) {
    const a = Math.PI / 2 - (u - 1) * Math.PI;
    return snap(CX + SPINE_HALF + Math.cos(a) * offset, CY + Math.sin(a) * offset);
  }
  if (u <= 3) {
    return snap(CX + SPINE_HALF - (u - 2) * 2 * SPINE_HALF, CY - offset);
  }

  const a = -Math.PI / 2 - (u - 3) * Math.PI;
  return snap(CX - SPINE_HALF + Math.cos(a) * offset, CY + Math.sin(a) * offset);
}

/** Offset of the track centre-line after `progress` laps. */
function centreOffset(progress: number) {
  let steps = 0;
  for (let lap = 1; lap <= LAPS; lap++) {
    steps += smoothstep((progress - lap + STEP_SPAN) / STEP_SPAN);
  }
  return START_OFFSET - CELL_DEPTH / 2 - CELL_DEPTH * steps;
}

function centreAt(progress: number): Point {
  return trackPoint(centreOffset(progress), progress);
}

/**
 * `side` is +1 for the outer edge of the lane, -1 for the inner edge. Measured
 * as an offset from the spine rather than square to the centre-line: because
 * consecutive laps are exactly `CELL_DEPTH` apart, the inner edge of one lap is
 * then the very same curve as the outer edge of the next, so the two laps stay
 * joined even where the track is stepping inwards.
 */
function edgeAt(progress: number, side: number): Point {
  return trackPoint(centreOffset(progress) + (CELL_DEPTH / 2) * side, progress);
}

/** Progress values that cut one lap into `count` squares of equal length. */
function lapCuts(lap: number, count: number): number[] {
  const samples = 2400;
  const cum = [0];
  let prev = centreAt(lap);
  for (let i = 1; i <= samples; i++) {
    const next = centreAt(lap + i / samples);
    cum.push(cum[i - 1] + distance(prev, next));
    prev = next;
  }

  const cuts: number[] = [];
  let j = 0;
  for (let k = 0; k <= count; k++) {
    const target = (cum[samples] * k) / count;
    while (j < samples - 1 && cum[j + 1] < target) j++;
    const span = cum[j + 1] - cum[j] || 1;
    cuts.push(lap + (j + (target - cum[j]) / span) / samples);
  }
  cuts[count] = lap + 1;
  return cuts;
}

const EDGE_STEPS = 5;

function buildCell(index: number, from: number, to: number): CellGeom {
  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let k = 0; k <= EDGE_STEPS; k++) {
    const p = from + ((to - from) * k) / EDGE_STEPS;
    outer.push(edgeAt(p, 1));
    inner.push(edgeAt(p, -1));
  }
  const mid = (from + to) / 2;
  return {
    index,
    centroid: centreAt(mid),
    innerMid: edgeAt(mid, -1),
    path: polygon([...outer, ...inner.reverse()]),
  };
}

export const CELLS: CellGeom[] = (() => {
  const cells: CellGeom[] = [];
  let index = 1;
  for (let lap = 0; lap < LAPS; lap++) {
    const cuts = lapCuts(lap, LAP_CELLS[lap]);
    for (let i = 0; i < LAP_CELLS[lap]; i++) {
      cells.push(buildCell(index++, cuts[i], cuts[i + 1]));
    }
  }
  return cells;
})();

/** Silhouette of the whole ribbon, used for the board plate and its shadow. */
export const RIBBON_PATH = (() => {
  const steps = 400;
  const outer: Point[] = [];
  const inner: Point[] = [];
  for (let k = 0; k <= steps; k++) {
    const p = (LAPS * k) / steps;
    outer.push(edgeAt(p, 1));
    inner.push(edgeAt(p, -1));
  }
  return polygon([...outer, ...inner.reverse()]);
})();

/**
 * Chunky arrow that carries on backwards out of square 1. The inward step at
 * the end of lap 1 lifts the tail of the spiral clear of this band.
 */
export const START_ARROW = (() => {
  const outer = edgeAt(0, 1);
  const inner = edgeAt(0, -1);
  const centre = { x: (outer.x + inner.x) / 2, y: (outer.y + inner.y) / 2 };
  const span = distance(inner, outer) || 1;
  const nx = (outer.x - inner.x) / span;
  const ny = (outer.y - inner.y) / span;
  const fx = ny;
  const fy = -nx;
  const back = (d: number): Point => snap(centre.x - fx * d, centre.y - fy * d);
  const off = (p: Point, s: number): Point => ({ x: p.x + nx * s, y: p.y + ny * s });

  const half = CELL_DEPTH / 2;
  const tailHalf = half * 0.72;
  const headLen = CELL_DEPTH * 0.8;
  const total = CELL_DEPTH * 2.6;
  const tip = back(3);
  const neck = back(headLen);
  const tail = back(total);

  return {
    path: polygon([
      off(tail, tailHalf),
      off(neck, tailHalf),
      off(neck, half),
      tip,
      off(neck, -half),
      off(neck, -tailHalf),
      off(tail, -tailHalf),
    ]),
    textAt: back(total * 0.66),
    centroid: back(headLen * 1.15),
  };
})();

/**
 * Largest comfortable box inside the hole, pushed clear of the spiral tail
 * that pokes in near the bottom-left.
 */
export const CENTER_BOX = (() => {
  const halfH = HOLE_OFFSET * 0.79;
  const reach = SPINE_HALF + Math.sqrt(Math.max(0, HOLE_OFFSET ** 2 - halfH ** 2));
  const top = CY - halfH;
  const bottom = CY + halfH;
  const right = CX + reach;
  let left = CX - reach;

  const samples = 400;
  for (let k = 0; k <= samples; k++) {
    const p = LAPS - 0.35 + (0.35 * k) / samples;
    for (const side of [-1, -0.5, 0, 0.5, 1]) {
      const q = edgeAt(p, side);
      if (q.x < CX && q.y > top && q.y < bottom) left = Math.max(left, q.x + 18);
    }
  }

  return {
    left: r2((left / VIEW_W) * 100),
    top: r2((top / VIEW_H) * 100),
    width: r2(((right - left) / VIEW_W) * 100),
    height: r2(((bottom - top) / VIEW_H) * 100),
  };
})();

export function pawnPosition(index: number): Point {
  if (index === 0) return START_ARROW.centroid;
  const cell = CELLS.find((item) => item.index === index);
  if (!cell) return START_ARROW.centroid;
  return snap(
    cell.centroid.x * 0.42 + cell.innerMid.x * 0.58,
    cell.centroid.y * 0.42 + cell.innerMid.y * 0.58,
  );
}
