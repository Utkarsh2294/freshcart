# Freshcart motion plans

Audit baseline: `8cfa817`. All three plans are implemented and reviewed. Each plan records its verification and remaining physical-device limitation.

| Plan                                                                | Severity | Status |
| ------------------------------------------------------------------- | -------- | ------ |
| [001 Modal surfaces](001-modal-surfaces.md)                         | Medium   | DONE   |
| [002 Feedback and notifications](002-feedback.md)                   | Medium   | DONE   |
| [003 Motion cleanup and accessibility](003-motion-accessibility.md) | High     | DONE   |

## Opportunity filter

| Location                                       | Purpose             | Frequency    | Selected treatment                                                                                     |
| ---------------------------------------------- | ------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `Dialog.jsx` / sidebar, swaps, recommendations | Spatial consistency | Occasional   | Modal scale .96 + opacity, 200ms; menu from left edge, 250ms; drawer curve `cubic-bezier(.32,.72,0,1)` |
| `Toast.jsx`                                    | State indication    | Occasional   | TranslateY(8px) + opacity, enter 200ms, exit 160ms, `cubic-bezier(.23,1,.32,1)`                        |
| Shared buttons                                 | Feedback            | Tens per day | Scale(.97), 100ms on pointer press; instant for keyboard                                               |
| Notification switches                          | State indication    | Occasional   | Transform translateX(24px), 160ms; instant under reduced motion                                        |

Rejected: product-card hover travel (frequent browsing), route transitions (functional navigation), recipe text entrances (reading), animated totals (functional comparison). No stagger, bounce, blur, per-frame React state, or animation dependency is needed.

The audit found inactive toast classes, missing reduced-motion handling in the imported stylesheet, broad transitions, and unused CSS advertising an unavailable animation library. The fixes below address those causes.
