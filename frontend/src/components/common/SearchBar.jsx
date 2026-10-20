import { useEffect, useRef, useState } from "react";
import { Mic, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useSearch } from "../../hooks/useSearch";
import api from "../../services/api";

const INPUT_UNDERSTANDING_ENABLED = true; // falls back gracefully if service down

async function understandIntent(query) {
  try {
    const { data } = await api.get("/search/understand", {
      params: { q: query },
      timeout: 2000,
    });
    return data;
  } catch {
    return null;
  }
}

export default function SearchBar() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, isLoading } = useSearch(query);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const recognitionRef = useRef(null);
  const isVoiceSupported = Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition,
  );

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const submitSearch = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Only attempt intent understanding for conversational queries (3+ words or recipe triggers)
    const isConversational =
      trimmed.split(" ").length >= 3 ||
      /\b(cook|make|recipe|prepare|bake)\b/i.test(trimmed);
    if (INPUT_UNDERSTANDING_ENABLED && isConversational) {
      const intent = await understandIntent(trimmed);
      if (intent?.intent === "recipe_suggestion" && intent.query) {
        navigate(`/cook-this?dish=${encodeURIComponent(intent.query)}`);
        setIsOpen(false);
        return;
      }
      if (intent?.intent === "category_browse" && intent.category_hint) {
        navigate(`/search?q=${encodeURIComponent(intent.category_hint)}`);
        setIsOpen(false);
        return;
      }
    }

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitSearch(query);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setQuery(transcript);
      submitSearch(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        <input
          type="search"
          aria-label="Search groceries or a recipe"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && query.length >= 2}
          aria-controls="search-suggestions"
          aria-activedescendant={
            isOpen && activeIndex >= 0
              ? `search-option-${activeIndex}`
              : undefined
          }
          autoComplete="off"
          maxLength={200}
          enterKeyHint="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              setActiveIndex(-1);
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIsOpen(true);
              setActiveIndex((index) =>
                Math.min(index + 1, suggestions.length - 1),
              );
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, -1));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              submitSearch(
                activeIndex >= 0 && isOpen
                  ? suggestions[activeIndex]?.name || query
                  : query,
              );
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] py-3 pl-12 pr-12 text-sm text-[var(--text-primary)] shadow-sm placeholder:text-[var(--text-secondary)] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
          placeholder={'Search for "milk", "bread" or "apple"'}
        />
        <button
          type="button"
          onClick={handleVoiceSearch}
          disabled={!isVoiceSupported}
          title={
            isVoiceSupported
              ? "Voice search"
              : "Voice search is unavailable in this browser"
          }
          aria-label={
            isVoiceSupported ? "Voice search" : "Voice search unavailable"
          }
          className={`absolute inset-y-0 right-0 flex items-center pr-4 transition-colors ${
            isListening
              ? "text-[#EC4899]"
              : "text-[var(--text-secondary)] hover:text-[#6366F1] disabled:cursor-not-allowed disabled:opacity-40"
          }`}
        >
          <Mic className="h-5 w-5" />
        </button>
      </form>

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
              Loading...
            </div>
          ) : suggestions.length > 0 ? (
            <ul
              id="search-suggestions"
              role="listbox"
              aria-label="Search suggestions"
              className="max-h-60 overflow-auto overscroll-contain py-1"
            >
              {suggestions.map((item, index) => (
                <li
                  key={item.id || item.name}
                  id={`search-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`content-wrap cursor-pointer px-4 py-3 text-sm hover:bg-[var(--bg-surface)] ${index === activeIndex ? "bg-[var(--bg-surface)]" : ""}`}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(item.name);
                    submitSearch(item.name);
                  }}
                >
                  <div className="font-semibold text-[var(--text-primary)]">
                    {item.name}
                  </div>
                  {item.category && (
                    <div className="text-xs text-[var(--text-secondary)]">
                      in {item.category}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-[var(--text-secondary)]">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
