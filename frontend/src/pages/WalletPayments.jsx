import { useEffect, useState } from 'react';
import { useWalletStore } from '../store/walletStore';
import { formatPrice, formatDate } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { Wallet, Copy, Share2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { featureFlags } from '../utils/featureFlags';

export default function WalletPayments() {
  const { balance, transactions, referralCode, fetchWallet, fetchReferralCode, redeemCode } = useWalletStore();
  const { addToast } = useUiStore();
  const [redeemInput, setRedeemInput] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    fetchWallet();
    if (featureFlags.referralWallet) fetchReferralCode();
  }, [fetchWallet, fetchReferralCode]);

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      addToast({ type: 'success', message: 'Code copied to clipboard!' });
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;
    const text = `Use my Freshcart referral code ${referralCode} and we both get wallet credit.`;
    if (navigator.share) {
      await navigator.share({ title: 'Freshcart referral', text });
      return;
    }
    await navigator.clipboard.writeText(text);
    addToast({ type: 'success', message: 'Referral link copied.' });
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemInput) return;
    setIsRedeeming(true);
    try {
      await redeemCode(redeemInput);
      setRedeemInput('');
      addToast({ type: 'success', message: 'Code redeemed successfully!' });
    } catch (err) {
      addToast({ type: 'error', message: 'Invalid or expired code.' });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#F97316] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">💳</div>
          <div className="flex items-center gap-3 mb-6 opacity-90 relative z-10">
            <Wallet className="w-6 h-6" />
            <span className="font-medium">Freshcart Wallet</span>
          </div>
          <p className="text-sm opacity-80 mb-1 relative z-10">Available Balance</p>
          <h2 className="text-4xl font-bold relative z-10">{formatPrice(balance)}</h2>
        </div>

        {featureFlags.referralWallet && <div className="bg-white dark:bg-[#1A1C24] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Refer & Earn</h3>
          <p className="text-sm text-gray-500 mb-4">Share this code with friends to earn <span className="text-[#8B5CF6] font-semibold">{formatPrice(50)}</span> wallet cash!</p>
          <div className="flex flex-col gap-3">
            <div className="bg-gray-50 dark:bg-[#0F111A] border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center font-mono font-bold tracking-wider text-lg text-gray-900 dark:text-white">
              {referralCode || 'LOADING...'}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </button>
              <button onClick={handleShare} className="flex-1 py-2 rounded-xl bg-[#8B5CF6] text-white font-medium hover:bg-[#7C3AED] transition-colors flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </button>
            </div>
          </div>
        </div>}

        {featureFlags.referralWallet && <div className="bg-white dark:bg-[#1A1C24] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Redeem Code</h3>
          <form onSubmit={handleRedeem} className="flex gap-2">
            <input 
              placeholder="Enter code" 
              value={redeemInput} 
              onChange={e => setRedeemInput(e.target.value)}
              className="flex-1 rounded-xl bg-gray-50 dark:bg-[#0F111A] border-none px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#8B5CF6]"
            />
            <button type="submit" disabled={isRedeeming || !redeemInput} className="px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold disabled:opacity-50 transition-colors">
              Redeem
            </button>
          </form>
        </div>}
      </div>

      <div className="md:col-span-2">
        <div className="bg-white dark:bg-[#1A1C24] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800/50">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Transaction History</h3>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {transactions.length > 0 ? transactions.map((tx) => (
              <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#20232C] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.amount > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{tx.type.toLowerCase()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.amount > 0 ? 'text-green-500 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                  </p>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="text-4xl mb-4 opacity-50">🧾</div>
                <p>No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
