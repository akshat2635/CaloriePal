import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label="Toggle theme"
    >
      {/* Sliding circle */}
      <span
        className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-11" : "translate-x-1"
        }`}
      >
        <span className="flex h-full w-full items-center justify-center">
          {isDark ? (
            <Moon className="h-5 w-5 text-gray-800" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-500" />
          )}
        </span>
      </span>
    </button>
  );
}
