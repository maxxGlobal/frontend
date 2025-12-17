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

const languages: {
  code: SupportedLanguage;
  labelKey: string;
  flagSrc: string;
}[] = [
  {
    code: "tr",
    labelKey: "common.turkish",
    flagSrc: "/assets/images/Flag_of_Turkey.png",
  },
  {
    code: "en",
    labelKey: "common.english",
    flagSrc: "/assets/images/Flag_of_the_United_Kingdom.png",
  },
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
              aria-pressed={isActive}
              className={`px-3 py-1 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-qh2-green text-white"
                  : "text-qblack hover:bg-gray-100"
              }`}
            >
              <img
                src={item.flagSrc}
                alt={t(item.labelKey)}
                className="h-5 w-7 rounded-sm border border-qgray-border object-cover"
              />
              <span className="sr-only">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
