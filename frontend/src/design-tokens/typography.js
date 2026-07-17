// Freshcart Design Tokens — Typography
// Mobile-first type scale. Import Google Font 'Inter' in index.html.

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs:   '11px',  // captions, badges, timestamps
    sm:   '13px',  // secondary labels, meta
    base: '15px',  // body text, list items
    lg:   '17px',  // card titles, subheadings
    xl:   '20px',  // section headings
    '2xl':'24px',  // screen titles
    '3xl':'30px',  // hero / promo numbers
  },
  fontWeight: {
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },
  lineHeight: {
    tight:   1.2,
    snug:    1.35,
    normal:  1.5,
    relaxed: 1.65,
  },
  letterSpacing: {
    tight:  '-0.02em',
    normal: '0',
    wide:   '0.02em',
    wider:  '0.05em',
  },

  // Semantic text styles — use these names in components, not raw values
  styles: {
    displayLg:  { fontSize: '30px', fontWeight: 800, lineHeight: 1.2,  letterSpacing: '-0.02em' },
    displayMd:  { fontSize: '24px', fontWeight: 700, lineHeight: 1.2,  letterSpacing: '-0.02em' },
    headingLg:  { fontSize: '20px', fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.01em' },
    headingMd:  { fontSize: '17px', fontWeight: 600, lineHeight: 1.35 },
    headingSm:  { fontSize: '15px', fontWeight: 600, lineHeight: 1.35 },
    bodyLg:     { fontSize: '17px', fontWeight: 400, lineHeight: 1.5  },
    bodyMd:     { fontSize: '15px', fontWeight: 400, lineHeight: 1.5  },
    bodySm:     { fontSize: '13px', fontWeight: 400, lineHeight: 1.5  },
    label:      { fontSize: '13px', fontWeight: 500, lineHeight: 1.35 },
    labelSm:    { fontSize: '11px', fontWeight: 500, lineHeight: 1.35, letterSpacing: '0.02em' },
    caption:    { fontSize: '11px', fontWeight: 400, lineHeight: 1.5  },
    price:      { fontSize: '17px', fontWeight: 700, lineHeight: 1.2  },
    priceLg:    { fontSize: '24px', fontWeight: 800, lineHeight: 1.2  },
    badge:      { fontSize: '11px', fontWeight: 600, lineHeight: 1,   letterSpacing: '0.02em' },
    button:     { fontSize: '15px', fontWeight: 600, lineHeight: 1,   letterSpacing: '0.01em' },
    buttonSm:   { fontSize: '13px', fontWeight: 600, lineHeight: 1,   letterSpacing: '0.01em' },
  },
};

export default typography;
