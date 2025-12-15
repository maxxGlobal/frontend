import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  getPreferredLanguage,
  normalizeLanguage,
} from "./utils/language";

const initialLang = getPreferredLanguage();
document.documentElement.lang = initialLang;

const resources = {
  tr: {
    translation: {
      common: {
        language: "Dil",
        turkish: "Türkçe",
        english: "İngilizce",
        searchPlaceholder: "Ürün Ara...",
        search: "Ara",
        logout: "Çıkış Yap",
      },
      header: {
        notifications: {
          title: "Bildirimler",
          markAllTitle: "Tümünü Oku?",
          markAllBody:
            "Tüm bildirimleri okundu olarak işaretlemek istiyor musunuz?",
          confirm: "Evet",
          cancel: "Vazgeç",
          success: "Tüm bildirimler okundu.",
          error: "İşlem başarısız",
          loading: "Yükleniyor…",
          empty: "Bildirim yok",
          viewAll: "Tüm Bildirimleri Gör",
          viewAllHint:
            "Tüm bildiriminizi görüntülemek için yukarıdaki butona tıklayın.",
          timeAgo: {
            justNow: "az önce",
            minutes: "{{count}} dk",
            hours: "{{count}} sa",
            days: "{{count}} gün",
          },
          timeAgoSuffix: "önce",
        },
      },
      drawer: {
        tabs: {
          categories: "Kategoriler",
          menu: "Ana Menü",
        },
        searchPlaceholder: "Ürün Ara...",
        search: "Ara",
        all: "Tümü",
        home: "AnaSayfa",
        products: "Ürünlerimiz",
        about: "Hakkımızda",
        contact: "İletişim",
        orders: "Sipariş Geçmişi",
        noCategories: "Kategori bulunamadı.",
      },
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
  en: {
    translation: {
      common: {
        language: "Language",
        turkish: "Turkish",
        english: "English",
        searchPlaceholder: "Search product...",
        search: "Search",
        logout: "Logout",
      },
      header: {
        notifications: {
          title: "Notifications",
          markAllTitle: "Mark all as read?",
          markAllBody: "Do you want to mark every notification as read?",
          confirm: "Yes",
          cancel: "Cancel",
          success: "All notifications are read.",
          error: "Operation failed",
          loading: "Loading…",
          empty: "No notifications",
          viewAll: "View all notifications",
          viewAllHint: "Tap the button above to browse every notification.",
          timeAgo: {
            justNow: "just now",
            minutes: "{{count}} min",
            hours: "{{count}} hr",
            days: "{{count}} day",
          },
          timeAgoSuffix: "ago",
        },
      },
      drawer: {
        tabs: {
          categories: "Categories",
          menu: "Main Menu",
        },
        searchPlaceholder: "Search product...",
        search: "Search",
        all: "All",
        home: "Home",
        products: "Products",
        about: "About",
        contact: "Contact",
        orders: "Order History",
        noCategories: "No categories found.",
      },
      colors: {
        red: "Red",
        blue: "Blue",
        green: "Green",
        silver: "Silver",
        black: "Black",
        yellow: "Yellow",
        pink: "Pink",
        white: "White",
        brown: "Brown",
        purple: "Purple",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  lng: initialLang,
  fallbackLng: "tr",
  interpolation: { escapeValue: false },
  resources,
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = normalizeLanguage(lng);
});

export default i18n;
