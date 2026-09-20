/**
 * NXTQR Empty State System — Deterministic 9x9 Letter Masks & Structural Geometry
 *
 * All coordinates are defined on a logical 9x9 matrix: (row, col) from 0 to 8.
 * Total cells = 81.
 * Grid modules are rounded squares (8x8px with 1.5–2px radius on a 2px gap = 88x88px canvas).
 *
 * Visual hierarchy:
 * - Finder fragment: 3x3 eye at top-left (0,0)..(2,2) with hollow center (1,1).
 * - Structural modules: Sparse QR alignment/boundary modules.
 * - Letter modules: Deterministic initial geometry (opacity ~0.35).
 * - Signal modules: Path of modules that receive the subtle orange pulse.
 * - Signature Amber module: Terminal tail of 'Q' (#FFB83E).
 */

export interface GridCoord {
  r: number;
  c: number;
}

export type ModuleType = "finder" | "structural" | "letter" | "accent";

export interface ResolvedModule {
  id: string;
  r: number;
  c: number;
  type: ModuleType;
  order: number;
  entryX: number;
  entryY: number;
  isSignal: boolean;
  signalStep?: number;
}

// 1. TOP-LEFT FINDER CORNER MOTIF (3x3 outer ring with center hollow)
export const FINDER_FRAGMENT: GridCoord[] = [
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 0, c: 2 },
  { r: 1, c: 0 },
  // (1, 1) is hollow quiet space
  { r: 1, c: 2 },
  { r: 2, c: 0 },
  { r: 2, c: 1 },
  { r: 2, c: 2 },
];

// 2. SPARSE QR STRUCTURAL MODULES (Placed on outer boundaries)
export const STRUCTURAL_MODULES: GridCoord[] = [
  { r: 0, c: 5 },
  { r: 0, c: 8 },
  { r: 1, c: 7 },
  { r: 6, c: 0 },
  { r: 7, c: 0 },
  { r: 8, c: 1 },
  { r: 8, c: 4 },
  { r: 8, c: 6 },
];

// 3. DETERMINISTIC LETTER MASKS (9x9 grid, letters centered within rows 2..7, cols 3..7)
export const LETTER_MASKS: Record<string, GridCoord[]> = {
  // Q — QR Codes (Signature variant with amber tail)
  Q: [
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 3 }, { r: 3, c: 7 },
    { r: 4, c: 3 }, { r: 4, c: 7 },
    { r: 5, c: 3 }, { r: 5, c: 7 },
    { r: 6, c: 4 }, { r: 6, c: 5 }, { r: 6, c: 6 },
    { r: 5, c: 5 }, // Inner node
    { r: 7, c: 7 }, // Tail diagonal
    { r: 8, c: 8 }, // Terminal accent tail
  ],

  // A — Analytics, Approvals, API Keys
  A: [
    { r: 2, c: 5 },
    { r: 3, c: 4 }, { r: 3, c: 6 },
    { r: 4, c: 3 }, { r: 4, c: 7 },
    { r: 5, c: 3 }, { r: 5, c: 4 }, { r: 5, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 7 },
    { r: 6, c: 3 }, { r: 6, c: 7 },
    { r: 7, c: 3 }, { r: 7, c: 7 },
  ],

  // C — Campaigns
  C: [
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 3 },
    { r: 4, c: 3 },
    { r: 5, c: 3 },
    { r: 6, c: 3 },
    { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 },
  ],

  // R — Routes
  R: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 7 },
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 },
    { r: 5, c: 5 },
    { r: 6, c: 6 },
    { r: 7, c: 7 },
  ],

  // G — Guardian
  G: [
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 3 },
    { r: 4, c: 3 },
    { r: 5, c: 3 }, { r: 5, c: 5 }, { r: 5, c: 6 }, { r: 5, c: 7 },
    { r: 6, c: 3 }, { r: 6, c: 7 },
    { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 },
  ],

  // F — Folders, Files
  F: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 },
  ],

  // M — Members
  M: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 3, c: 4 },
    { r: 4, c: 5 },
    { r: 3, c: 6 },
    { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }, { r: 7, c: 7 },
  ],

  // T — Teams, Templates
  T: [
    { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 5 },
    { r: 4, c: 5 },
    { r: 5, c: 5 },
    { r: 6, c: 5 },
    { r: 7, c: 5 },
  ],

  // D — Domains
  D: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 },
    { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
  ],

  // W — Webhooks
  W: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 },
    { r: 7, c: 4 },
    { r: 6, c: 5 },
    { r: 7, c: 6 },
    { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 },
  ],

  // B — Brand Kits
  B: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 7 },
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 },
    { r: 5, c: 7 }, { r: 6, c: 7 },
    { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
  ],

  // E — Experiments
  E: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 },
    { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 },
  ],

  // L — Landing Pages, Locations
  L: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 },
  ],

  // S — Search, Scanability
  S: [
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 3 },
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 },
    { r: 5, c: 7 },
    { r: 6, c: 7 },
    { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
  ],

  // N — Notifications
  N: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 3, c: 4 }, { r: 4, c: 5 }, { r: 5, c: 6 },
    { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }, { r: 7, c: 7 },
  ],

  // V — Versions
  V: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 4 }, { r: 5, c: 4 },
    { r: 6, c: 5 }, { r: 7, c: 5 },
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 7 }, { r: 2, c: 7 },
  ],

  // P — Portals
  P: [
    { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 4, c: 3 }, { r: 5, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 3 },
    { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 },
    { r: 3, c: 7 },
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 },
  ],
};

// 4. SIGNAL PATHS PER LETTER (4–5 key modules defining the pulse sequence)
export const SIGNAL_PATHS: Record<string, GridCoord[]> = {
  Q: [{ r: 2, c: 5 }, { r: 4, c: 7 }, { r: 6, c: 6 }, { r: 7, c: 7 }, { r: 8, c: 8 }],
  A: [{ r: 2, c: 5 }, { r: 3, c: 6 }, { r: 5, c: 5 }, { r: 5, c: 3 }, { r: 7, c: 3 }],
  C: [{ r: 2, c: 6 }, { r: 2, c: 4 }, { r: 4, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 6 }],
  R: [{ r: 2, c: 4 }, { r: 3, c: 7 }, { r: 4, c: 5 }, { r: 5, c: 5 }, { r: 7, c: 7 }],
  G: [{ r: 2, c: 6 }, { r: 4, c: 3 }, { r: 5, c: 5 }, { r: 5, c: 7 }, { r: 7, c: 6 }],
  F: [{ r: 2, c: 4 }, { r: 2, c: 7 }, { r: 3, c: 3 }, { r: 4, c: 5 }, { r: 6, c: 3 }],
  M: [{ r: 7, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 5 }, { r: 3, c: 6 }, { r: 7, c: 7 }],
  T: [{ r: 2, c: 3 }, { r: 2, c: 5 }, { r: 4, c: 5 }, { r: 6, c: 5 }, { r: 7, c: 5 }],
  D: [{ r: 2, c: 3 }, { r: 2, c: 6 }, { r: 4, c: 7 }, { r: 7, c: 6 }, { r: 7, c: 3 }],
  W: [{ r: 2, c: 3 }, { r: 7, c: 4 }, { r: 6, c: 5 }, { r: 7, c: 6 }, { r: 2, c: 7 }],
  B: [{ r: 2, c: 3 }, { r: 3, c: 7 }, { r: 4, c: 5 }, { r: 6, c: 7 }, { r: 7, c: 5 }],
  E: [{ r: 2, c: 6 }, { r: 3, c: 3 }, { r: 4, c: 5 }, { r: 5, c: 3 }, { r: 7, c: 6 }],
  L: [{ r: 2, c: 3 }, { r: 4, c: 3 }, { r: 6, c: 3 }, { r: 7, c: 5 }, { r: 7, c: 7 }],
  S: [{ r: 2, c: 7 }, { r: 3, c: 3 }, { r: 4, c: 5 }, { r: 6, c: 7 }, { r: 7, c: 4 }],
  N: [{ r: 7, c: 3 }, { r: 4, c: 5 }, { r: 2, c: 7 }, { r: 5, c: 7 }, { r: 7, c: 7 }],
  V: [{ r: 2, c: 3 }, { r: 4, c: 4 }, { r: 7, c: 5 }, { r: 4, c: 6 }, { r: 2, c: 7 }],
  P: [{ r: 7, c: 3 }, { r: 2, c: 3 }, { r: 2, c: 6 }, { r: 3, c: 7 }, { r: 4, c: 5 }],
};

/**
 * Deterministically compiles all modules for a given letter monogram.
 * Eliminates duplicates, sorts by flow order, and assigns entry vectors and signal step indices.
 */
export function getMonogramModules(initialLetter: string): ResolvedModule[] {
  const upper = (initialLetter || "Q").toUpperCase();
  const letterCoords = LETTER_MASKS[upper] || LETTER_MASKS["Q"];
  const signalCoords = SIGNAL_PATHS[upper] || SIGNAL_PATHS["Q"];

  const moduleMap = new Map<string, { r: number; c: number; type: ModuleType }>();

  // Add Finder Fragment
  FINDER_FRAGMENT.forEach((pt) => {
    moduleMap.set(`${pt.r},${pt.c}`, { ...pt, type: "finder" });
  });

  // Add Structural Modules (if not occupied by letter or finder)
  STRUCTURAL_MODULES.forEach((pt) => {
    const key = `${pt.r},${pt.c}`;
    if (!moduleMap.has(key)) {
      moduleMap.set(key, { ...pt, type: "structural" });
    }
  });

  // Add Letter Modules
  letterCoords.forEach((pt) => {
    const key = `${pt.r},${pt.c}`;
    const isAccent = upper === "Q" && pt.r === 8 && pt.c === 8;
    moduleMap.set(key, {
      ...pt,
      type: isAccent ? "accent" : "letter",
    });
  });

  // Compile and sort deterministically
  const rawList = Array.from(moduleMap.values());

  // Sort by Manhattan distance from top-left (r + c), breaking ties by col
  rawList.sort((a, b) => {
    const distA = a.r + a.c;
    const distB = b.r + b.c;
    if (distA !== distB) return distA - distB;
    return a.c - b.c;
  });

  return rawList.map((m, index) => {
    // Stepped entry vectors: grid-aligned small displacement (6px to 14px)
    const entryX = m.c < 4 ? -10 : 10;
    const entryY = m.r < 4 ? -8 : 8;

    // Check if this module is on the signal path
    const signalIndex = signalCoords.findIndex((s) => s.r === m.r && s.c === m.c);
    const isSignal = signalIndex !== -1;

    return {
      id: `${upper}-${m.r}-${m.c}`,
      r: m.r,
      c: m.c,
      type: m.type,
      order: index,
      entryX,
      entryY,
      isSignal,
      signalStep: isSignal ? signalIndex : undefined,
    };
  });
}
