"use client";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import Button from "./ui/Button";
import Icon from "./ui/Icon";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized theme toggle handler
  const handleToggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Determine icon based on current theme
  const iconName = theme === "dark" ? "sun" : "moon";

  return (
    <Button
      variant="secondary"
      onClick={handleToggle}
      className="w-16 h-7 text-sm"
      aria-label="Toggle theme"
    >
      <Icon name={iconName} size={14} />
    </Button>
  );
}
