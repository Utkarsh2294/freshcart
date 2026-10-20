const CATEGORY_STYLES = [
  {
    test: /milk|dahi|curd|cheese|butter|egg|dairy/i,
    label: "Dairy",
    color: "#6366F1",
    accent: "#EEF2FF",
  },
  {
    test: /banana|apple|mango|grape|fruit/i,
    label: "Fruit",
    color: "#22C55E",
    accent: "#ECFDF5",
  },
  {
    test: /onion|tomato|potato|chilli|coriander|vegetable|paneer/i,
    label: "Fresh",
    color: "#16A34A",
    accent: "#F0FDF4",
  },
  {
    test: /chips|kurkure|biscuit|cookie|bhujia|chocolate|noodle|snack/i,
    label: "Snack",
    color: "#F97316",
    accent: "#FFF7ED",
  },
  {
    test: /juice|drink|tea|coffee|water|cola|pepsi|beverage/i,
    label: "Drink",
    color: "#3B82F6",
    accent: "#EFF6FF",
  },
  {
    test: /atta|rice|dal|oil|salt|sugar|staple/i,
    label: "Staple",
    color: "#A16207",
    accent: "#FEFCE8",
  },
  {
    test: /soap|shampoo|toothpaste|lotion|care/i,
    label: "Care",
    color: "#EC4899",
    accent: "#FDF2F8",
  },
];

const escapeSvg = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const getProductImage = (product = {}) => {
  if (product.imageUrl || product.image_url)
    return product.imageUrl || product.image_url;

  const text = `${product.name || ""} ${product.category || ""}`;
  const style = CATEGORY_STYLES.find((item) => item.test.test(text)) || {
    label: "Fresh",
    color: "#8B5CF6",
    accent: "#F7F8FA",
  };
  const initials = (product.name || "Freshcart")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      [
        ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          part,
        ),
      ][0]?.segment.toUpperCase(),
    )
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <rect width="320" height="320" rx="36" fill="${style.accent}"/>
      <circle cx="236" cy="78" r="42" fill="${style.color}" opacity="0.16"/>
      <circle cx="82" cy="238" r="56" fill="${style.color}" opacity="0.12"/>
      <rect x="86" y="82" width="148" height="160" rx="28" fill="#FFFFFF" stroke="${style.color}" stroke-width="5"/>
      <path d="M116 116h88M116 144h88M116 172h56" stroke="${style.color}" stroke-width="10" stroke-linecap="round" opacity="0.28"/>
      <circle cx="160" cy="224" r="35" fill="${style.color}"/>
      <text x="160" y="235" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">${escapeSvg(initials)}</text>
      <text x="160" y="282" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="${style.color}">${escapeSvg(style.label)}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
