# Freshcart UI quality pass

Audit baseline: `072ac41`. Scope: all customer routes and shared components, their API clients/stores, admin guard, server routes, PWA, and deployment configuration. Admin screens contain legacy demo data and are outside this customer UI pass.

## Priorities and decisions

| Before                                             | After                                             | Why                                                         |
| -------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Catalog squeezed between two sidebars at 1024px    | Cart rail appears only from 1536px                | Keep products usable on laptops and tablets                 |
| Product quantity controls nested in product links  | Separate links and controls                       | Prevent navigation during cart edits                        |
| Tiny, unnamed icon controls                        | Named controls with 44px touch targets            | Touch and keyboard accessibility                            |
| Missing safe areas and dynamic viewport sizing     | Safe-area header/navigation/dialogs and `dvh`     | Keep controls above mobile browser chrome                   |
| Fabricated checkout address and uncharged ₹5 fee   | Required address form and totals matching the API | Avoid misleading order information                          |
| Decorative filters and unbounded catalog rendering | Working price filter, sorting, 24-item pages      | Usable filtering and bounded rendering                      |
| API errors appear as empty successful results      | Explicit error messages and retry actions         | Distinguish network failure from no data                    |
| Sheets lack focus handling                         | Native modal dialogs                              | Focus trap, Escape, background inertness, focus restoration |

## Worst-case field map

| Surface           | Fields / source                                                  | Limits and scenarios                                                                                                         |
| ----------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Catalog and cart  | Product name, brand, unit, image, price, stock from products API | Database/schema product names; long compound and non-Latin names, broken/missing images, zero/large prices, stock 0/1/50     |
| Quantity controls | Cart quantity from cart API                                      | Update schema: 0–50; duplicate mutations and stock exhaustion                                                                |
| Checkout          | Street/city/state/PIN from form                                  | API lengths: 255/100/100/20; UI requires six-digit Indian PIN and nonempty address                                           |
| Search            | Query, category, sort, page, maximum price from URL              | Long unbroken queries, zero/one/page-size results, responses arriving out of order                                           |
| Orders            | ID, created timestamp, total, items, status                      | Empty lists, one item, large totals, lowercase API status values                                                             |
| Wallet            | Balance, transaction amount/type/date, referral code             | Decimal/string amounts, optional metadata, empty/error/loading states                                                        |
| Recipe            | Title, steps, ingredient name/qty/unit, match type, alternatives | Recipe strings are unbounded in the schema; long realistic content, missing optional metadata, no matches, failed generation |
| Notifications     | Boolean preferences, permission, save state                      | Save failure and rapid toggles, unsupported or unconfigured push                                                             |

## Verification method

Production build checked with headless Edge and intercepted API fixtures at 320, 390, 768, 1024, 1440, and 1920px. Fixtures enter through the API boundary. The developer-only stress page adds Demo/Worst/Empty/One/Large states. Real handset keyboard, touch feel, installed-PWA safe areas, and device frame timing require physical hardware; desktop emulation cannot prove those.
