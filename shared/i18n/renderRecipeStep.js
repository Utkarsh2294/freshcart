import { culinaryDictionary } from './culinaryDictionary.js';

const templates = {
  en: ({ action, target, detail, duration, temperature }) =>
    `${action} ${target}: ${detail}${temperature ? ` (${temperature})` : ''}${duration ? ` for ${duration}` : ''}.`,
  hi: ({ action, target, detail, duration, temperature }) =>
    `${target} ${action}: ${detail}${temperature ? ` (${temperature})` : ''}${duration ? ` - ${duration}` : ''}।`,
  hinglish: ({ action, target, detail, duration, temperature }) =>
    `${target} ${action}: ${detail}${temperature ? ` (${temperature})` : ''}${duration ? ` - ${duration}` : ''}.`,
};

function formatDuration(seconds, language) {
  if (!seconds) return '';
  const minutes = Math.round(Number(seconds) / 60);
  if (language === 'hi') return `${minutes} मिनट`;
  if (language === 'hinglish') return `${minutes} min`;
  return `${minutes} min`;
}

function translateFragment(value, language, onUnmatchedTerm) {
  if (!value || language === 'en') return value || '';

  return String(value).split(/\b/).map((part) => {
    const lower = part.toLowerCase();
    const match = culinaryDictionary.terms[lower] || culinaryDictionary.units[lower];
    if (match?.[language]) return match[language];
    if (/^[a-z]{4,}$/i.test(part)) onUnmatchedTerm?.({ language, term: part });
    return part;
  }).join('');
}

export function renderRecipeStep(step, language = 'en', { onUnmatchedTerm } = {}) {
  if (typeof step === 'string') return step;
  if (!step || typeof step !== 'object') return '';

  const normalizedLanguage = ['en', 'hi', 'hinglish'].includes(language) ? language : 'en';
  const actionLabel = normalizedLanguage === 'en'
    ? step.action
    : culinaryDictionary.actions[step.action]?.[normalizedLanguage] || step.action;

  return templates[normalizedLanguage]({
    action: actionLabel,
    target: translateFragment(step.target, normalizedLanguage, onUnmatchedTerm),
    detail: translateFragment(step.detail, normalizedLanguage, onUnmatchedTerm),
    duration: formatDuration(step.duration_seconds, normalizedLanguage),
    temperature: translateFragment(step.temperature, normalizedLanguage, onUnmatchedTerm),
  });
}
