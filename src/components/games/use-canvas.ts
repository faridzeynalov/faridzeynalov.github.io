"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A canvas sized to its CSS box at the device pixel ratio, so drawing (in CSS pixels) stays
 * sharp. `size` is the box's width in CSS pixels, 0 until measured.
 */
export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      setSize(width);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return { canvasRef, size };
}

/** A token of the current style and mode (e.g. "--accent", "--font-code"), for canvas drawing. */
export function cssToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#888";
}
