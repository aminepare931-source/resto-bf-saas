import { Sun, Moon, Zap } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const THEME_ICONS = {
  light: <Sun className="w-4 h-4" />,
  dark: <Moon className="w-4 h-4" />,
  neon: <Zap className="w-4 h-4" />,
};

const THEME_LABELS = {
  light: "Jour",
  dark: "Nuit",
  neon: "Néon",
};

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gold transition-colors"
      title={`Thème actuel: ${THEME_LABELS[theme]}. Cliquez pour changer.`}
    >
      {THEME_ICONS[theme]}
    </button>
  );
}