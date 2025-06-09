<template>
  <ul class="navbar-nav ml-auto" title="Seleccionar modo de color">
    <li class="nav-item dropdown">
      <button aria-expanded="false"
        class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
        data-bs-toggle="dropdown" type="button">
        <i class="bi theme-icon-active" data-theme-icon-active="bi-sun-fill"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <button class="dropdown-item d-flex align-items-center" data-bs-theme-value="light" type="button">
            <i class="bi bi-sun-fill me-2 opacity-50" data-theme-icon="bi-sun-fill"></i>
            Light
          </button>
        </li>
        <li>
          <button class="dropdown-item d-flex align-items-center" data-bs-theme-value="dark" type="button">
            <i class="bi bi-moon-fill me-2 opacity-50" data-theme-icon="bi-moon-fill"></i>
            Dark
          </button>
        </li>
        <li>
          <button class="dropdown-item d-flex align-items-center" data-bs-theme-value="auto" type="button">
            <i class="bi bi-circle-half me-2 opacity-50" data-theme-icon="bi-circle-half"></i>
            Auto
          </button>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    const storedTheme = localStorage.getItem("theme");

    const getPreferredTheme = () => {
      if (storedTheme) {
        return storedTheme;
      }

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    const setTheme = function (theme) {
      if (
        theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        document.documentElement.setAttribute("data-bs-theme", "dark");
      } else {
        document.documentElement.setAttribute("data-bs-theme", theme);
      }
    };

    setTheme(getPreferredTheme());

    const showActiveTheme = (theme) => {
      const activeThemeIcon = document.querySelector(".theme-icon-active");
      const btnToActive = document.querySelector(
        `[data-bs-theme-value="${theme}"]`
      );
      const iconOfActiveBtn = btnToActive.querySelector("i").dataset.themeIcon;

      document.querySelectorAll("[data-bs-theme-value]").forEach((element) => {
        element.classList.remove("active");
      });

      btnToActive.classList.add("active");
      activeThemeIcon.classList.remove(activeThemeIcon.dataset.themeIconActive);
      activeThemeIcon.classList.add(iconOfActiveBtn);
      activeThemeIcon.dataset.iconActive = iconOfActiveBtn;
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (storedTheme !== "light" || storedTheme !== "dark") {
          setTheme(getPreferredTheme());
        }
      });

    showActiveTheme(getPreferredTheme());

    document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const theme = toggle.getAttribute("data-bs-theme-value");
        localStorage.setItem("theme", theme);
        setTheme(theme);
        showActiveTheme(theme, true);
      });
    });
  },
};
</script>

<style scoped>
/* THEME TOOGLE */
.bi {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  fill: currentcolor;
}

.me-2 {
  margin-right: 0.5rem !important;
}

.opacity-50 {
  opacity: 0.5 !important;
}
</style>