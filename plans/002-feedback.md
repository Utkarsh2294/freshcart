# 002 — Repair transient feedback

- Status: DONE
- Commit: 8cfa817
- Severity: MEDIUM
- Category: Interruptibility and state indication
- Scope: `frontend/src/components/common/Toast.jsx`, `frontend/src/store/uiStore.js`, notification switch markup and tailwind.css

## Problem

Toast entry references `animate-in slide-in-from-right`, which are undefined in the loaded CSS. Its inline callback restarts timers when the parent rerenders. `Date.now()` can generate duplicate toast IDs in a batch. Switch transforms need explicit duration and reduced-motion treatment.

## Target and steps

1. Use `crypto.randomUUID()` for toast IDs and bound the visible list to five notifications.
2. Give the toast region polite live announcements and each error an alert role. Use the stable store removal function plus ID rather than passing a new inline callback into the timer effect.
3. CSS transitions: opacity and `translateY(8px)` to none, 200ms with `cubic-bezier(0.23,1,0.32,1)`. Dismiss via closing state, opacity 0 and the same translation for 160ms, then remove from the store. Use `@starting-style` for mount entry.
4. Pause timers during hover, focus, and document invisibility; resume the remaining duration. Clean up timers and listeners on unmount. Keep text wrapping and close controls usable at 320px.
5. Switch thumb moves with the full transform string `translateX(24px)` or `translateX(0)` over 160ms. With reduced motion, change thumb position instantly.

## Boundaries and verification

Keep existing toast callers and store shape. No Sonner dependency is necessary. Test rapid notifications, close/reopen, short and long errors, timer pause/resume, and keyboard close. Run the existing full tests, lint, and production build.

Completed: three automated queue regressions pass (unique IDs, five-item bound, selective dismissal). Edge verifies batched notifications and hover pause/resume. Lint, the full runnable test suite, and production build pass.
