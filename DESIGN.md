---
version: 1.0.0
name: Chordisol
description: Playful acoustic chord recognition and gamified ear training for iPhone & iPad.
colors:
  ground: "#f8fafc"
  surface: "#ffffff"
  ink: "#0f172a"
  muted: "#475569"
  primary: "#1674d6"
  primary-light: "#eaf3ff"
  accent-green: "#10b981"
  accent-amber: "#f59e0b"
  accent-rose: "#f43f5e"
  accent-purple: "#8b5cf6"
typography:
  display:
    fontFamily: "var(--font-momo-display), system-ui, sans-serif"
    fontWeight: "800"
    letterSpacing: "-0.03em"
  body:
    fontFamily: "var(--font-momo-sans), system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.6"
  tabular:
    fontFamily: "var(--font-noto-mono), monospace"
rounded:
  sm: "0.5rem"
  md: "0.875rem"
  lg: "1.25rem"
  xl: "1.75rem"
---

# Chordisol Design System & Anti-Slop Contract

## 1. Product Truth & Audience
Chordisol is a native iOS app that turns an iPhone into an attentive practice partner for musicians, learners, and music teachers. You prop the phone on your piano stand, guitar case, or desk; it listens through the mic and immediately identifies every triad, seventh, and inversion in real-time, then reinforces ear memory through playful song puzzles.

**Visual Tone:** Playful, tactile, and human. Think Duolingo's character warmth combined with Flighty's native iOS engineering pride and Citymapper's confident, utilitarian directness.

## 2. Refused AI Defaults (Anti-Slop Rules)
- **NO Centered Template Heros:** No generic floating pill badge + centered H1 + centered subhead + centered buttons. Use purposeful, asymmetrical, or left-aligned layouts that lead with real product UI.
- **NO Monospace as Decorative Chrome:** Monospace is strictly reserved for tabular audio frequencies and latency numbers. Never use mono for standard UI labels, buttons, or category titles.
- **NO All-Caps Tracked-Out Eyebrows:** Avoid adding tracked-out uppercase labels above every heading. When a label is needed, use natural sentence case.
- **NO Low-Contrast Greys:** Secondary text must stay at `#475569` (slate-600) or darker, maintaining at least 5.6:1 contrast against white surfaces (well above WCAG AA 4.5:1).
- **NO Decorative 01/02/03 Markers:** Do not label non-sequential features or cards with numbers.
- **NO Unnecessary Glassmorphism:** Avoid `backdrop-blur` on opaque cards or static backgrounds. Keep blur only where there is genuine layered scrolling underneath.
- **NO Beige Superlatives:** Ban words like "seamless", "cutting-edge", "revolutionary", and "effortless". Use plain, punchy musician language.

## 3. The Mascot Universe
The app's heart is its mascot family (extracted directly from the creator's Figma):
- The **Radio Note** (`mascot-radio.png`): Attentive, listening with an antenna and radio to acoustic instruments.
- The **Puzzle Notes** (`mascot-hill.png`, `mascot-compare.png`, `mascot-duo-1.png`): Friendly characters holding chord blocks (`C`, `F`, `G`, `Am`) on green hills.
- The **Sleeping Note** (`mascot-sleeping.png`): Cozy rest states and practice breaks.

## 4. Components & Elevation
- **Cards:** Crisp 2px borders with soft contrast (`border-2 border-slate-900/10`) and physical 0-blur offset keycap drop shadows (`shadow-[0_4px_0_rgba(15,23,42,0.06)]`).
- **Interactive Buttons:** Tactile 3D press interaction with physical translation (`active:translate-y-0.5 active:shadow-[0_1px_0_rgba(15,23,42,0.1)]`).
- **Real App Previews:** Always showcase the actual native iOS app interface (`chordisol-iphone-mockup.png` and practice screens) rather than fake desktop browser windows.
