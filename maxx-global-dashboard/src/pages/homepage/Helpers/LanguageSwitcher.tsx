import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPreferredLanguage,
  normalizeLanguage,
  setPreferredLanguage,
  type SupportedLanguage,
} from "../../../utils/language";

type LanguageSwitcherProps = {
  className?: string;
};

const languages: { code: SupportedLanguage; labelKey: string; short: string }[] = [
  { code: "tr", labelKey: "common.turkish", short: "TR" },
  { code: "en", labelKey: "common.english", short: "EN" },
];

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [lang, setLang] = useState<SupportedLanguage>(
    normalizeLanguage(getPreferredLanguage())
  );

  useEffect(() => {
    setLang(normalizeLanguage(i18n.language));
  }, [i18n.language]);

  const handleSelect = (code: SupportedLanguage) => {
    const normalized = normalizeLanguage(code);
    setPreferredLanguage(normalized);
    setLang(normalized);
    i18n.changeLanguage(normalized);
  };

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <span className="text-xs text-qgray whitespace-nowrap">
        {t("common.language")}
      </span>

      <div className="flex overflow-hidden rounded-full border border-qgray-border bg-white">
        {languages.map((item) => {
          const isActive = lang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item.code)}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-qh2-green text-white"
                  : "text-qblack hover:bg-gray-100"
              }`}
            >
              <span className="hidden sm:inline">{t(item.labelKey)}</span>
              <span className="sm:hidden">{item.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
