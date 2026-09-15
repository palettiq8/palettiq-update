"use client";

import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/store/useGlobalStore";
import { Button } from "../ui/Button";

export default function ThemeToggle() {
  const theme = useGlobalState((state) => state.theme);
  const setTheme = useGlobalState((state) => state.setTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    function resolve() {
      if (theme === "dark") {
        setIsDark(true);
      } else if (theme === "light") {
        setIsDark(false);
      } else {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    }

    resolve();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", resolve);
      return () => mediaQuery.removeEventListener("change", resolve);
    }
  }, [theme]);

  return (
    <Button
      icon={isDark ? Moon : Sun}
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
}
