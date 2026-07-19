import { useState, useEffect } from 'react';
import * as searchService from '../services/searchService';

export const useSearch = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchService.getSuggestions(query);
          setSuggestions(Array.isArray(data) ? data : data.suggestions || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  return { suggestions, isLoading };
};
