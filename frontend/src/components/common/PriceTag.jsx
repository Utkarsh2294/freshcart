import { formatPrice } from "../../utils/formatters";

export default function PriceTag({ price, mrp, className = "" }) {
  return (
    <div className={`money flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className="font-bold text-gray-900 dark:text-white">
        {formatPrice(price)}
      </span>
      {mrp > price && (
        <span className="text-sm text-gray-400 line-through">
          {formatPrice(mrp)}
        </span>
      )}
    </div>
  );
}
