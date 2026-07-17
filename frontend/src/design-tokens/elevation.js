// Freshcart Design Tokens — Elevation & Shadow
// Shared by: product cards, bottom sheets, drawers, toasts, modals, dropdowns.
// Always use these — never define ad-hoc box-shadows in component CSS.

export const elevation = {
  0:      'none',
  1:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',   // product card at rest
  2:      '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)',   // search dropdown, chip hover
  3:      '0 10px 20px rgba(0,0,0,0.09), 0 4px 8px rgba(0,0,0,0.06)', // sticky header, cart drawer
  4:      '0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)', // bottom sheet, toast
  modal:  '0 32px 64px rgba(0,0,0,0.18), 0 16px 32px rgba(0,0,0,0.10)', // dialogs, full modals
};

// Usage map — which elevation level each UI layer uses
export const elevationUsage = {
  productCard:        elevation[1],
  productCardHover:   elevation[2],
  searchDropdown:     elevation[3],
  stickyHeader:       elevation[3],
  cartDrawer:         elevation[4],
  bottomSheet:        elevation[4],
  swapSheet:          elevation[4],
  toast:              elevation[4],
  installBanner:      elevation[2],
  modal:              elevation.modal,
  navbar:             elevation[3],
};

export default elevation;
