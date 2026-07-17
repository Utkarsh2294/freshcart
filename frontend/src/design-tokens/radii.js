// Freshcart Design Tokens — Corner Radii
// Consistent rounding creates cohesion. Use semantic names, not raw values.

export const radii = {
  none: '0px',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  '2xl':'28px',
  full: '9999px',
};

// Semantic radius aliases — use these in components
export const radiusUsage = {
  button:          radii.full,     // pill-shaped CTAs
  buttonSecondary: radii.md,       // outlined/ghost buttons
  card:            radii.lg,       // product cards, recipe cards
  chip:            radii.full,     // category chips, filter chips
  input:           radii.md,       // search bar, text inputs
  badge:           radii.full,     // stock badge, AI confidence dot
  bottomSheet:     radii.xl,       // top corners of bottom sheet
  modal:           radii.xl,       // modal dialog
  toast:           radii.lg,       // toast notifications
  avatar:          radii.full,     // user avatars, brand logos
  image:           radii.md,       // product images
  carousel:        radii.lg,       // banner carousel items
  swapCard:        radii.lg,       // swap option cards
};

export default radii;
