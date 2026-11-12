"use client";

import { useEffect, useRef, useState } from "react";
import { createNeuralBackdrop, type NeuralBackdropController } from "./neural-backdrop";

/** Frozen sprite of the reference network, used before hydration, with JS
 * disabled, for reduced motion and on compact viewports. */
const nodes = [[45, 100], [135, 60], [190, 165], [80, 230], [245, 280], [330, 220], [400, 330], [290, 420], [470, 450], [590, 370], [690, 420], [770, 330], [860, 390], [930, 260], [840, 180], [730, 120], [630, 190], [540, 100], [450, 160], [960, 70], [50, 470], [160, 410]];
const connections = [[0, 1], [0, 3], [1, 2], [2, 3], [2, 4], [4, 5], [4, 7], [5, 6], [5, 18], [6, 7], [6, 8], [8, 9], [9, 10], [9, 16], [10, 11], [11, 12], [11, 14], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [13, 19], [20, 21], [21, 7], [3, 21]];

export function TechnicalBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"static" | "animated">("static");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 47.99rem)");
    const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)");
    let controller: NeuralBackdropController | null = null;

    const update = () => {
      const animate = !reducedMotion.matches && !compactViewport.matches && !coarsePointer.matches;
      if (animate && !controller) {
        controller = createNeuralBackdrop({ canvas, window });
        if (controller) {
          controller.start();
          setMode("animated");
        }
      } else if (!animate && controller) {
        controller.destroy();
        controller = null;
        setMode("static");
      }
    };

    update();
    reducedMotion.addEventListener("change", update);
    compactViewport.addEventListener("change", update);
    coarsePointer.addEventListener("change", update);

    return () => {
      reducedMotion.removeEventListener("change", update);
      compactViewport.removeEventListener("change", update);
      coarsePointer.removeEventListener("change", update);
      controller?.destroy();
    };
  }, []);

  return <div className="technical-backdrop" data-backdrop={mode} aria-hidden="true">
    <svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth=".6">{connections.map(([a, b]) => <path key={`${a}-${b}`} d={`M${nodes[a].join(" ")}L${nodes[b].join(" ")}`} />)}</g>
      <g fill="currentColor">{nodes.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />)}</g>
    </svg>
    <canvas ref={canvasRef} className="technical-canvas" aria-hidden="true" />
  </div>;
}
