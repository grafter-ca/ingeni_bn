import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className=" w-10 h-10 rounded-full flex items-center justify-center border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:border-blue-500/40 transition cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-yellow-400" />
      ) : (
        <Moon size={16} className="text-blue-600" />
      )}
    </button>
  );
}