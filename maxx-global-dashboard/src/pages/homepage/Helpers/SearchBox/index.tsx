// src/components/SearchBox.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

type SearchBoxProps = {
  className?: string;
  onSearch: (query: string) => void;
};

export default function SearchBox({ className, onSearch }: SearchBoxProps) {
  const [q, setQ] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(q.trim());
  };

  return (
    <div
      className={`w-full h-full flex items-center border border-qgray-border bg-white rounded ${
        className || ""
      }`}
    >
      <form onSubmit={handleSubmit} className="flex-1 flex items-center h-full">
        <input
          type="text"
          className="flex-1 px-3 py-2 outline-none"
          placeholder={t("common.searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 me-1 bg-qh2-green text-white text-sm rounded"
        >
          {t("common.search")}
        </button>
      </form>
    </div>
  );
}
