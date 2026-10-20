import { useState, useEffect } from "react";
import * as searchService from "../services/searchService";

export const useSearch = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const handler = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchService.getSuggestions(query);
          if (active)
            setSuggestions(Array.isArray(data) ? data : data.suggestions || []);
        } catch (e) {
          if (active) setSuggestions([]);
        } finally {
          if (active) setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [query]);

  return { suggestions, isLoading };
};
