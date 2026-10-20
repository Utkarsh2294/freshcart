# 003 — Enforce motion restraint and mobile placement

- Status: DONE
- Commit: 8cfa817
- Severity: HIGH
- Category: Performance and accessibility
- Scope: imported tailwind.css, App.jsx input modality, unused global.css/animations.css, notification prompt and voice button placement

## Problem

Reduced-motion rules only exist in an unimported CSS file. The same file includes perpetual decorative animation, broad transitions, and an import for a missing dependency. Mobile floating controls must clear both navigation and the home-indicator inset.

## Target and steps

1. Verify that `main.jsx` imports only `styles/tailwind.css` and that the latter imports variables.css. Delete global.css and animations.css after checking for references.
2. Add keyboard/pointer modality listeners in App.jsx. Use `document.documentElement.dataset.inputMode` to disable motion for keyboard-triggered actions, without suppressing focus indicators.
3. Add `.press-feedback` transform scale(.97) on pointer press, duration 100ms using `--ease-smooth`, with immediate release. Apply only to explicit buttons. No card hover travel or route transitions.
4. Reduced motion removes transform travel, spinner/pulse repetition, and smooth scrolling. Preserve opacity feedback and static loading labels.
5. Position `.voice-button` and `.notification-prompt` above `calc(4rem + env(safe-area-inset-bottom) + 1.5rem)` under 1024px; desktop uses 1.5rem. Toasts clear navigation and the voice button.

## Boundaries and verification

No `will-change`, blur, layout animations, rAF, or new dependency. Verify from the production bundle that no `transition:all` or unused animation-library reference remains. Check motion with reduced-motion emulation, fine/coarse pointer configurations, and keyboard navigation; profile real-device frame timing separately.

Completed: inactive stylesheets removed after reference checks; reduced-motion drawer, keyboard dismissal, touch-emulated landscape layout, and production fixture exclusion pass. Final review approved; no high-priority motion findings remain. Physical-device frame timing remains explicitly unverified.
