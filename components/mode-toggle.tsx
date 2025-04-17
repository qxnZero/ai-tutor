"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // Prevent hydration mismatch by not rendering theme-dependent elements until client-side
  if (!mounted) {
    return (
      <button
        className="w-9 h-9 rounded-md flex items-center justify-center opacity-0"
        aria-label="Toggle theme"
        disabled
      >
        <div className="h-5 w-5"></div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
