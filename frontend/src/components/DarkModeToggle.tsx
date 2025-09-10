"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && ((theme === "dark") || (theme === "system" && resolvedTheme === "dark"));

  return (
    <button
      className="rounded border px-3 py-1 text-sm border-gray-300 dark:border-neutral-800"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
    >
      {mounted ? (isDark ? "Light" : "Dark") : "Theme"} Mode
    </button>
  );
}
