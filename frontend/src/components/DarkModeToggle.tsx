"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  
  useEffect(() => {
    const stored = localStorage.getItem("theme:dark");
    const initial = stored === "true";
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);
  
  return (
    <button
      className="rounded border px-3 py-1 text-sm border-gray-300 dark:border-neutral-800"
      onClick={() => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme:dark", String(next));
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {dark ? "Light" : "Dark"} Mode
    </button>
  );
}
