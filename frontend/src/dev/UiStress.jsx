import { useSearchParams } from "react-router";
import ProductCard from "../components/common/ProductCard";
import Input from "../components/common/Input";

const demo = [
  {
    id: 1,
    name: "Fresh milk",
    brand: "Freshcart",
    unit: "1 litre",
    price: 65,
    inStock: true,
    stockQty: 50,
  },
];
const worst = [
  {
    id: 1,
    name: "Organic Wholegrain Multiseed Sourdough Bread — Family Pack",
    brand: "The Baker’s Table",
    unit: "2 × 800 g",
    price: 2499.99,
    mrp: 2999,
    inStock: true,
    stockQty: 50,
    imageUrl: "/missing-stress-image.png",
  },
  {
    id: 2,
    name: "आशीर्वाद शुद्ध चक्की आटा 🌾",
    brand: "",
    unit: "10 kg",
    price: 450,
    inStock: false,
    stockQty: 0,
  },
  {
    id: 3,
    name: "NaturallyFermentedTraditionalArtisanGreekYogurt",
    unit: "1 kg",
    price: 99999999.99,
    inStock: true,
    stockQty: 1,
  },
  {
    id: 4,
    name: "王秀英",
    unit: "1 piece",
    price: 0.01,
    inStock: true,
    stockQty: 2,
  },
];

export default function UiStress() {
  const [params, setParams] = useSearchParams();
  const mode = params.get("data") || "demo";
  const page = Math.max(1, Math.min(42, Number(params.get("page")) || 1));
  const products =
    mode === "empty"
      ? []
      : mode === "one"
        ? worst.slice(0, 1)
        : mode === "worst"
          ? worst
          : mode === "large"
            ? Array.from({ length: page === 42 ? 16 : 24 }, (_, index) => ({
                ...worst[index % 4],
                id: (page - 1) * 24 + index + 1,
              }))
            : demo;
  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold">
        UI stress fixtures · development only
      </h1>
      <p className="text-sm">
        Product names are limited to 200 characters, units to 50, prices to
        NUMERIC(10,2), and cart quantities to 50. Large mode represents 1,000
        records with a 24-record page.
      </p>
      <Input
        label="Long delivery address"
        defaultValue="Apartment 1804, Tower Magnolia, Prestige Lakeside Habitat, Varthur–Whitefield Road, Bengaluru"
      />
      <div
        dir={params.get("rtl") === "true" ? "rtl" : "ltr"}
        className="product-grid"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!products.length && (
        <p role="status" className="rounded-xl border p-6">
          No products found. Try another search.
        </p>
      )}
      {mode === "large" && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="min-h-11 border px-4"
            disabled={page === 1}
            onClick={() => setParams({ data: mode, page: String(page - 1) })}
          >
            Previous
          </button>
          <span>Page {page} of 42 · 1,000 records</span>
          <button
            className="min-h-11 border px-4"
            disabled={page === 42}
            onClick={() => setParams({ data: mode, page: String(page + 1) })}
          >
            Next
          </button>
        </div>
      )}
      <div
        role="group"
        aria-label="Stress fixture data"
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+8px)] left-4 right-4 z-40 flex gap-1 overflow-x-auto rounded-xl bg-gray-200 p-1 text-[14px] text-gray-900 lg:bottom-4"
      >
        {["demo", "worst", "empty", "one", "large"].map((value) => (
          <button
            key={value}
            aria-pressed={mode === value}
            onClick={() => setParams({ data: value })}
            className={`min-h-[44px] shrink-0 rounded-lg px-[12px] capitalize ${mode === value ? "bg-white shadow-sm" : ""}`}
          >
            {value === "demo"
              ? "Demo data"
              : value === "worst"
                ? "Worst case"
                : value}
          </button>
        ))}
      </div>
    </div>
  );
}
