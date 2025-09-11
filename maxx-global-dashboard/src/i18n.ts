import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "tr",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  resources: {
    tr: {
      colors: {
        red: "Kırmızı",
        blue: "Mavi",
        green: "Yeşil",
        silver: "Gümüş",
        black: "Siyah",
        yellow: "Sarı",
        pink: "Pembe",
        white: "Beyaz",
        brown: "Kahverengi",
        purple: "Mor",
      },
    },
  },
});

export default i18n;
