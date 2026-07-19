import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Loader2, Mic, Sparkles, Type } from 'lucide-react';
import * as cookThisService from '../services/cookThisService';

export default function CookThis() {
  const [prompt, setPrompt] = useState('');
  const [servings, setServings] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    const dishName = prompt.trim();
    if (!dishName) return;

    setIsLoading(true);
    setError('');
    try {
      const recipe = await cookThisService.generateRecipe(dishName, servings);
      const { matches } = await cookThisService.matchIngredients(recipe.ingredients || []);
      navigate('/recipe-result', {
        state: {
          dishName,
          servings,
          recipe,
          matches,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't prepare that recipe. Try a simpler dish name.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      setPrompt(event.results?.[0]?.[0]?.transcript || '');
    };
    recognition.start();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center space-y-8 p-4">
      <div className="space-y-4 text-center">
        <div className="mb-2 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 p-4">
          <Sparkles className="h-12 w-12 text-[#EC4899]" />
        </div>
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] md:text-5xl">
          What do you want to <span className="bg-gradient-to-r from-[#8B5CF6] to-[#F97316] bg-clip-text text-transparent">cook today?</span>
        </h1>
        <p className="mx-auto max-w-md text-lg text-[var(--text-secondary)]">
          Enter a dish, generate a recipe, match every ingredient to your catalog, then add the selected packs to cart.
        </p>
      </div>

      <div className="mb-8 flex w-full rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-2 shadow-sm">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] py-3 font-semibold text-[var(--text-primary)] shadow-sm">
          <Type className="h-5 w-5" />
          <span>Type</span>
        </button>
        <button
          type="button"
          onClick={handleVoice}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Mic className="h-5 w-5" />
          <span>Speak</span>
        </button>
      </div>

      <form onSubmit={handleGenerate} className="w-full space-y-6">
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-[#8B5CF6] to-[#F97316] opacity-20 blur transition duration-500 group-hover:opacity-40" />
          <div className="relative flex items-center rounded-3xl bg-[var(--bg-card)] p-2 shadow-sm">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGenerate(e);
                }
              }}
              placeholder="e.g. paneer butter masala"
              className="flex-1 border-none bg-transparent px-6 py-4 text-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-0"
              autoFocus
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] p-4 text-white transition-opacity disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 font-medium text-[var(--text-secondary)]">
          <span>Servings:</span>
          <div className="flex rounded-xl bg-[var(--bg-surface)] p-1">
            {[1, 2, 4, 6].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setServings(num)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  servings === num ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'hover:bg-[var(--bg-card)]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
