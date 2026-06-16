// ─── Design Tokens ─────────────────────────────────────────────────────────
// Centralized color constants — replaces `const BLUE/TEAL` scattered across 6+ files

export const COLORS = {
  /** Navy blue primary — sidebar, headings, primary buttons */
  BLUE_PRIMARY: "#1B365D",
  /** Teal accent — active states, links, progress bars */
  TEAL_ACCENT: "#0D9488",
  /** Dark teal — login buttons, active nav items (legacy, consider consolidating with TEAL_ACCENT) */
  TEAL_DARK: "#006b5f",
  /** Deep navy — headings in light backgrounds */
  NAVY_HEADING: "#002046",
  /** Body text dark */
  TEXT_PRIMARY: "#0b1c30",
  /** Body text secondary */
  TEXT_SECONDARY: "#44474e",
  /** Body text muted */
  TEXT_MUTED: "#74777f",
  /** Slate label text */
  TEXT_LABEL: "#64748B",
  /** Slate secondary label */
  TEXT_SLATE: "#94A3B8",
  /** Border default */
  BORDER_DEFAULT: "#c4c6cf",
  /** Border light */
  BORDER_LIGHT: "#E2E8F0",
  /** Surface background */
  SURFACE_BG: "#F1F5F9",
  /** Surface card input */
  SURFACE_INPUT: "#F8FAFC",
  /** Surface light blue */
  SURFACE_BLUE_LIGHT: "#eff4ff",
  /** Green done */
  GREEN_DONE: "#22C55E",
  GREEN_DONE_BORDER: "#16A34A",
  GREEN_BADGE_BG: "#F0FDF4",
  GREEN_BADGE_TEXT: "#16A34A",
  /** Blue badge */
  BLUE_BADGE_BG: "#EFF6FF",
  BLUE_BADGE_TEXT: "#1D4ED8",
  BLUE_BADGE_BORDER: "#BFDBFE",
  /** Amber / gold */
  AMBER_PRIMARY: "#F59E0B",
  AMBER_DARK: "#D97706",
  AMBER_BG: "#FFFBEB",
  AMBER_TEXT: "#92400E",
  AMBER_BORDER: "#FDE68A",
  /** Red destructive */
  RED_BORDER: "#FCA5A5",
  RED_TEXT: "#DC2626",
  /** Locked node */
  LOCKED_BG: "#CBD5E1",
  LOCKED_BORDER: "#94A3B8",
  /** Accent mint (used in branding) */
  MINT_ACCENT: "#71f8e4",
  MINT_LIGHT: "#6df5e1",
} as const;

export type ColorKey = keyof typeof COLORS;
