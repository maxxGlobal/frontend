export type SupportedLanguage = "tr" | "en";

const STORAGE_KEY = "preferredLanguage";

export function normalizeLanguage(lang?: string | null): SupportedLanguage {
  const value = (lang ?? "").toLowerCase();

  if (value.startsWith("en")) return "en";
  return "tr";
}

export function getPreferredLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "tr";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return normalizeLanguage(stored);

  return normalizeLanguage(navigator.language || navigator.languages?.[0]);
}

export function setPreferredLanguage(lang: SupportedLanguage) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

export function getAcceptLanguageHeader(lang?: string | null): string {
  return normalizeLanguage(lang) === "en" ? "en-US" : "tr-TR";
}
