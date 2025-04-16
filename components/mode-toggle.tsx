"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";

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
      <div className="flex items-center space-x-2 transition-all duration-700 ease-in-out opacity-0">
        <div className="h-[1.2rem] w-[1.2rem]"></div>
        <Switch
          aria-label="Toggle theme"
          className="transition-all duration-700"
        />
        <div className="h-[1.2rem] w-[1.2rem]"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 transition-all duration-700 ease-in-out">
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ${
          resolvedTheme === "dark"
            ? "text-muted-foreground scale-75 rotate-12"
            : "text-foreground scale-100 rotate-0"
        }`}
      />
      <Switch
        checked={resolvedTheme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className="transition-all duration-700 hover:scale-110"
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-700 ${
          resolvedTheme === "light"
            ? "text-muted-foreground scale-75 rotate-12"
            : "text-foreground scale-100 rotate-0"
        }`}
      />
    </div>
  );
}
