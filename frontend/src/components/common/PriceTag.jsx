export default function PriceTag({ price, mrp, className = '' }) {
  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p);
  
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-bold text-gray-900 dark:text-white">{formatPrice(price)}</span>
      {mrp > price && (
        <span className="text-sm text-gray-400 line-through">{formatPrice(mrp)}</span>
      )}
    </div>
  );
}
