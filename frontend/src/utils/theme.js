export function resolveInitialDarkMode(storedTheme, prefersDark) {
  return storedTheme ? storedTheme === 'dark' : prefersDark;
}
