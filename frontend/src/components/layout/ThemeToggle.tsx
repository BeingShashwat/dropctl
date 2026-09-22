import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/theme-context";
import { IconButton } from "../ui/IconButton";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton
      icon={isDark ? Sun : Moon}
      variant="secondary"
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    />
  );
}
