# 001 — Connect modal surfaces to their entry points

- Status: DONE
- Commit: 8cfa817
- Severity: MEDIUM
- Category: Physicality, accessibility, interruptibility
- Scope: `frontend/src/components/common/Dialog.jsx`, `frontend/src/styles/tailwind.css`, `frontend/src/styles/variables.css`

## Problem

Native dialogs now provide focus trapping, dismissal, and inertness, but visually appear immediately. The sidebar should come from the left; centered modals should stay centered. Existing motion tokens are `--ease-smooth` and `--dur-fast` in variables.css.

## Target and steps

1. Update `--ease-smooth` to `cubic-bezier(0.23, 1, 0.32, 1)`. Add `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
2. In tailwind.css, use opacity and full transform transitions on `.dialog-surface`, 200ms with the existing ease token. Closed state: `opacity:0; transform:translateY(8px) scale(.96)`. Open state: opacity 1 and transform none. Add the closed entry state under `@starting-style`.
3. Use `display 200ms allow-discrete` and `overlay 200ms allow-discrete` so native close can finish its transition. Browsers without this support retain functional native dialogs.
4. Override `.dialog-menu` to `translateX(-100%)` while closed, duration 250ms with the drawer curve; open transform none.
5. For reduced motion, remove transform travel but retain opacity at 160ms. Keyboard interaction skips transitions entirely. Keep the focus and Escape behavior unchanged.

## Boundaries

No new libraries, manual focus traps, gesture handlers, layout-property animation, or changes to business logic.

## Verification

Run lint/build and inspect modal open/close, rapid reversal, Escape, Tab trapping, focus restoration, and backdrop dismissal. Slow transition playback by 5× to confirm the menu enters from the left and centered dialogs stay centered. Emulate reduced motion and verify no transform travel. Real-phone interaction feel requires physical hardware.

Completed: lint/build pass; headless Edge confirms the 250ms drawer curve, native focus containment/background inertness, Escape/focus restoration, and reduced-motion transform removal. A 5× slowed frame was visually inspected. Final motion review approved after the recipe-chevron exception was removed.
