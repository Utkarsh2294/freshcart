import { formatPrice } from '../../utils/formatters';

export default function WalletCard({ balance = 0 }) {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-4 shadow-md">
      <p className="text-sm opacity-90">Wallet Balance</p>
      <h3 className="text-2xl font-bold mt-1">{formatPrice(balance)}</h3>
    </div>
  );
}
