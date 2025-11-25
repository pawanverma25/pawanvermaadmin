"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") {
    return "dark";
  }
  const savedTheme = localStorage.getItem("theme") as
    | "light"
    | "dark"
    | null;
  const initialTheme = savedTheme || "dark";
  document.documentElement.className = initialTheme;
  return initialTheme;
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-accent/50 hover:bg-accent/10 hover:border-accent"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

