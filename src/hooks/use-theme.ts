import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "neon";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme;
      return saved || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "neon";
      return "light";
    });
  };

  const value = { theme, setTheme, toggleTheme };

  return React.createElement(ThemeContext.Provider, { value: value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.remove("theme-light", "theme-dark", "theme-neon");
  root.classList.add(`theme-${theme}`);
}