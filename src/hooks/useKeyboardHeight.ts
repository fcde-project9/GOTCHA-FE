"use client";

import { useState, useEffect } from "react";
import { isNativeApp } from "@/utils/platform";

export function useKeyboardHeight(enabled = true) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setKeyboardHeight(0);
      return;
    }

    if (isNativeApp()) {
      let cancelled = false;
      let showListener: { remove: () => void | Promise<void> } | undefined;
      let hideListener: { remove: () => void | Promise<void> } | undefined;

      (async () => {
        try {
          const { Keyboard } = await import("@capacitor/keyboard");
          if (cancelled) return;

          showListener = await Keyboard.addListener("keyboardWillShow", (info) => {
            setKeyboardHeight(info.keyboardHeight);
          });
          hideListener = await Keyboard.addListener("keyboardWillHide", () => {
            setKeyboardHeight(0);
          });
        } catch (error) {
          console.error("Failed to setup keyboard listeners:", error);
          setKeyboardHeight(0);
        }
      })();

      return () => {
        cancelled = true;
        showListener?.remove();
        hideListener?.remove();
      };
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const height = window.innerHeight - viewport.height;
      setKeyboardHeight(height > 0 ? height : 0);
    };

    viewport.addEventListener("resize", handleResize);
    return () => viewport.removeEventListener("resize", handleResize);
  }, [enabled]);

  return keyboardHeight;
}
