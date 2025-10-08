// src/assets/js/main.ts
// StrictMode çift mount'a karşı global guard
declare global {
  interface Window {
    __sherahInit?: boolean;
  }
}
if (!window.__sherahInit) window.__sherahInit = false;

export function initMain() {
  if (window.__sherahInit) return;
  window.__sherahInit = true;
  console.log("initMain çalıştı");

  /* Full Screen */
  const fullscreenButton = document.getElementById("sherah-header__full");
  const htmlElement = document.documentElement;
  if (fullscreenButton) {
    fullscreenButton.addEventListener(
      "click",
      () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else htmlElement.requestFullscreen?.();
      },
      { passive: true }
    );
  }

  /* Dark Mode */
  const darkBtn = document.getElementById("sherah-dark-light-button");
  const action = document.querySelectorAll(
    "#sherah-sidebarmenu__dark, #sherah-dark-light"
  );
  if (action.length && localStorage.getItem("isDark") === "true") {
    action.forEach((el) => el.classList.add("active"));
  }
  if (
    darkBtn &&
    action.length &&
    !(darkBtn as HTMLElement).dataset.boundClick
  ) {
    darkBtn.addEventListener("click", () => {
      const willBeDark = !(action[0]?.classList.contains("active") || false);
      action.forEach((el) => el.classList.toggle("active", willBeDark));
      localStorage.setItem("isDark", String(willBeDark));
    });
    (darkBtn as HTMLElement).dataset.boundClick = "true";
  }

  /* Sidebar Toggle */
  const csButtons = document.querySelectorAll(".sherah__sicon");
  const csAction = document.querySelectorAll(
    ".sherah-smenu, .sherah-header, .sherah-adashboard"
  );
  if (csAction.length && localStorage.getItem("iscicon") === "true") {
    csAction.forEach((el) => el.classList.add("sherah-close"));
  }
  const toggleSidebar = () => {
    const next = !csAction[0]?.classList.contains("sherah-close");
    csAction.forEach((el) => el.classList.toggle("sherah-close", next));
    localStorage.setItem("iscicon", String(next));
  };
  if (csButtons.length && csAction.length) {
    csButtons.forEach((btn) => {
      const el = btn as HTMLElement;
      if (el.dataset.boundClick === "true") return;
      el.addEventListener("click", toggleSidebar);
      el.dataset.boundClick = "true";
    });
  }
}
