import { useEffect, useRef, useState } from "react";
import Dialog from "./Dialog";
import { Mic, Plus, X } from "lucide-react";
import { featureFlags } from "../../utils/featureFlags";
import * as phase8Service from "../../services/phase8Service";
import { useAuth } from "../../hooks/useAuth";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";

export default function VoiceQuickAdd() {
  const { isAuthenticated } = useAuth();
  const { addItem, fetchCart } = useCartStore();
  const { addToast } = useUiStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [matches, setMatches] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const recognitionRef = useRef(null);
  useEffect(() => () => recognitionRef.current?.abort(), []);

  if (!featureFlags.voiceQuickAdd || !isAuthenticated) return null;

  const startListening = () => {
    if (isListening) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({
        type: "error",
        message: "Voice quick-add is not supported in this browser.",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = async (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      setTranscript(text);
      try {
        const data = await phase8Service.parseVoiceQuickAdd(text);
        setMatches(data.matches || []);
        setIsOpen(true);
      } catch {
        addToast({
          type: "error",
          message: "Could not parse that quick-add request.",
        });
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      addToast({
        type: "error",
        message: "Voice quick-add could not hear that request.",
      });
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      addToast({
        type: "error",
        message: "Voice input could not start. Please try again.",
      });
    }
  };

  const addMatched = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      const selected = matches.filter(
        (match) => match.selected && match.product,
      );
      for (const match of selected) {
        await addItem(match.product.id, match.quantity, "voice_quick_add");
      }
      await fetchCart();
      addToast({
        type: "success",
        message: `${selected.length} quick-add items added.`,
      });
      setIsOpen(false);
      setMatches([]);
    } catch {
      addToast({
        type: "error",
        message:
          "Some items could not be added. Review your cart before trying again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        className={`voice-button fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ${isListening ? "bg-red-500" : "bg-[#0F766E]"}`}
        aria-label="Voice quick add"
      >
        <Mic className="h-6 w-6" />
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        labelledBy="quick-add-title"
        className="dialog-sheet"
      >
        <div className="p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2
                id="quick-add-title"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                Review quick add
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {transcript}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close quick add"
              onClick={() => setIsOpen(false)}
              className="icon-button hover:bg-[var(--bg-surface)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {matches.map((match) => (
              <span
                key={`${match.ingredient.name}-${match.product?.id || "none"}`}
                className="rounded-full border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-primary)]"
              >
                {match.quantity} x{" "}
                {match.product?.name || match.ingredient.name}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={addMatched}
            disabled={
              isAdding ||
              !matches.some((match) => match.selected && match.product)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#14B8A6] py-3 font-bold text-white"
          >
            <Plus className="h-5 w-5" />{" "}
            {isAdding ? "Adding…" : "Add reviewed items"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
