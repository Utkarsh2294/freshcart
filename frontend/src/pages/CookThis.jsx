import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  Mic,
  Sparkles,
  Type,
} from "lucide-react";
import * as cookThisService from "../services/cookThisService";
import * as phase8Service from "../services/phase8Service";
import { featureFlags } from "../utils/featureFlags";

export default function CookThis() {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(searchParams.get("dish") || "");
  const [servings, setServings] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const submitting = useRef(false);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState("");
  useEffect(() => () => recognitionRef.current?.abort(), []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    const dishName = prompt.trim();
    if (!dishName || submitting.current) return;
    submitting.current = true;

    setIsLoading(true);
    setError("");
    setProgress("Preparing your recipe…");
    try {
      const recipe = await cookThisService.generateRecipe(dishName, servings);
      setProgress("Finding ingredients for your cart…");
      const { matches, pantry_note, nutrition } =
        await cookThisService.matchIngredients(
          recipe.ingredients || [],
          servings,
        );
      navigate("/recipe-result", {
        state: {
          dishName,
          servings,
          recipe: { ...recipe, nutrition },
          matches,
          pantryNote: pantry_note,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Couldn't prepare that recipe. Try again or choose another dish.",
      );
    } finally {
      setIsLoading(false);
      submitting.current = false;
    }
  };

  const handleMealPlan = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setIsPlanning(true);
    setError("");
    try {
      const data = await phase8Service.planWeeklyMeals({
        preferences: {
          veg_non_veg: "any",
          cuisine_tags: prompt.trim() ? [prompt.trim()] : [],
        },
        days: 7,
      });
      navigate("/recipe-result", {
        state: {
          dishName: "Weekly meal plan",
          servings: 14,
          recipe: {
            title: "7-day Freshcart meal plan",
            steps: (data.recipes || []).map(
              (recipe) => `Day ${recipe.day}: ${recipe.title}`,
            ),
            ingredients: data.consolidated_ingredients || [],
          },
          matches: data.matches || [],
          pantryNote: data.pantry_note,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Couldn't build the weekly plan.",
      );
    } finally {
      setIsPlanning(false);
      submitting.current = false;
    }
  };

  const handleVoice = () => {
    if (listening || isLoading || isPlanning) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError(
        "Voice input could not start. Check microphone permission or type your dish.",
      );
    };
    recognition.onresult = (event) => {
      setPrompt(event.results?.[0]?.[0]?.transcript || "");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Voice input is unavailable. Please type your dish.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center space-y-8 p-4">
      <div className="space-y-4 text-center">
        <div className="mb-2 inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 p-4">
          <Sparkles className="h-12 w-12 text-[#EC4899]" />
        </div>
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] md:text-5xl">
          What do you want to{" "}
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#F97316] bg-clip-text text-transparent">
            cook today?
          </span>
        </h1>
        <p className="mx-auto max-w-md text-lg text-[var(--text-secondary)]">
          Tell us what you’re craving. We’ll prepare the recipe and find the
          ingredients for your cart.
        </p>
      </div>

      <div className="mb-8 flex w-full rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] p-2 shadow-sm">
        <label
          htmlFor="dish-name"
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--bg-surface)] py-3 font-semibold text-[var(--text-primary)] shadow-sm"
        >
          <Type className="h-5 w-5" />
          <span>Type</span>
        </label>
        <button
          type="button"
          onClick={handleVoice}
          disabled={listening || isLoading || isPlanning}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Mic className="h-5 w-5" />
          <span>{listening ? "Listening…" : "Speak"}</span>
        </button>
      </div>

      <form onSubmit={handleGenerate} className="w-full space-y-6">
        <div className="group relative">
          <div className="relative flex items-center rounded-3xl bg-[var(--bg-card)] p-2 shadow-sm">
            <input
              type="text"
              id="dish-name"
              aria-label="Dish to cook"
              maxLength={200}
              enterKeyHint="go"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. paneer butter masala"
              className="min-w-0 flex-1 rounded-2xl border-none bg-transparent px-3 sm:px-6 py-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading || isPlanning}
              aria-label="Generate recipe"
              className="rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] p-4 text-white transition-opacity disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ArrowRight className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 font-medium text-[var(--text-secondary)]">
          <span>Servings:</span>
          <div className="flex rounded-xl bg-[var(--bg-surface)] p-1">
            {[1, 2, 4, 6].map((num) => (
              <button
                key={num}
                type="button"
                aria-pressed={servings === num}
                onClick={() => setServings(num)}
                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
                  servings === num
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "hover:bg-[var(--bg-card)]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <p
            role="status"
            aria-live="polite"
            className="text-center text-sm text-[var(--text-secondary)]"
          >
            {progress}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </form>

      {featureFlags.weeklyMealPlanner && (
        <button
          type="button"
          onClick={handleMealPlan}
          disabled={isPlanning || isLoading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-3 font-bold text-[var(--text-primary)] shadow-sm disabled:opacity-60"
        >
          {isPlanning ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CalendarDays className="h-5 w-5 text-[#14B8A6]" />
          )}
          Build 7-day meal cart
        </button>
      )}
    </div>
  );
}
