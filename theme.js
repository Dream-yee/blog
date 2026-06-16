const blogThemes = {
  purple: "#080812",
  blue: "#06101f",
  green: "#061812",
};

const themeLabels = {
  purple: "紫色",
  blue: "深藍",
  green: "深綠",
};

function isKnownTheme(theme) {
  return Object.prototype.hasOwnProperty.call(blogThemes, theme);
}

function getStoredTheme() {
  try {
    const theme = localStorage.getItem("blog-theme");
    return isKnownTheme(theme) ? theme : "purple";
  } catch (error) {
    return "purple";
  }
}

function applyTheme(theme) {
  const selectedTheme = isKnownTheme(theme) ? theme : "purple";
  document.documentElement.dataset.theme = selectedTheme;
  try {
    localStorage.setItem("blog-theme", selectedTheme);
  } catch (error) {
    // The visual switch should still work when storage is unavailable.
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute("content", blogThemes[selectedTheme]);
  }

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    const isActive = button.dataset.themeChoice === selectedTheme;
    button.setAttribute("aria-checked", String(isActive));
  });

  document.querySelectorAll(".theme-trigger").forEach((button) => {
    button.dataset.currentTheme = selectedTheme;
    button.setAttribute("aria-label", `選擇主題色，目前是${themeLabels[selectedTheme]}`);
  });
}

function setThemeMenuOpen(switcher, open) {
  const trigger = switcher.querySelector(".theme-trigger");
  const menu = switcher.querySelector(".theme-menu");
  if (!trigger) return;
  if (menu) {
    menu.hidden = !open;
  }
  switcher.classList.toggle("open", open);
  trigger.setAttribute("aria-expanded", String(open));
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getStoredTheme());

  document.querySelectorAll(".theme-switcher").forEach((switcher) => {
    const trigger = switcher.querySelector(".theme-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      setThemeMenuOpen(switcher, !switcher.classList.contains("open"));
    });
  });

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.themeChoice);
      const switcher = button.closest(".theme-switcher");
      if (switcher) {
        setThemeMenuOpen(switcher, false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".theme-switcher")) return;
    document.querySelectorAll(".theme-switcher.open").forEach((switcher) => {
      setThemeMenuOpen(switcher, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".theme-switcher.open").forEach((switcher) => {
      setThemeMenuOpen(switcher, false);
    });
  });
});
