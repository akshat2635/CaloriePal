import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Default to dark mode
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, default to dark if not found
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) {
        return saved === "dark";
      }
    }
    return true; // Default to dark mode
  });

  useEffect(() => {
    // Apply theme immediately on mount and when it changes
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
