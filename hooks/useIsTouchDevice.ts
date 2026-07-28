"use client";

import { useState } from "react";

export function useIsTouchDevice(): boolean {
  const [isTouch] = useState(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  return isTouch;
}
