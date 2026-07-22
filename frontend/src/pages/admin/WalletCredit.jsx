import { useState } from 'react';
import api from '../../services/api';
import { useUiStore } from '../../store/uiStore';

export default function WalletCredit() {
  const { addToast } = useUiStore();
  const [form, setForm] = useState({ user_id: '', amount: '', note: 'Manual goodwill credit' });
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/admin/wallet/credit', {
        user_id: Number(form.user_id),
        amount: Number(form.amount),
        note: form.note,
      });
      addToast({ type: 'success', message: 'Wallet credited.' });
      setForm({ user_id: '', amount: '', note: 'Manual goodwill credit' });
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error || 'Could not credit wallet.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Goodwill wallet credit</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          value={form.user_id}
          onChange={event => setForm(prev => ({ ...prev, user_id: event.target.value }))}
          placeholder="User ID"
          className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3"
        />
        <input
          value={form.amount}
          onChange={event => setForm(prev => ({ ...prev, amount: event.target.value }))}
          placeholder="Amount"
          className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3"
        />
        <input
          value={form.note}
          onChange={event => setForm(prev => ({ ...prev, note: event.target.value }))}
          placeholder="Note"
          className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3"
        />
        <button disabled={isSaving} className="w-full rounded-xl bg-[#111827] py-3 font-bold text-white disabled:opacity-60">
          Credit wallet
        </button>
      </form>
    </div>
  );
}
