"use client";

import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
  color: string;
}

const COLORS = [
  "rgb(79 70 229)",
  "rgb(99 102 241)",
  "rgb(124 58 237)",
  "rgb(139 92 246)",
  "rgb(168 85 247)",
  "rgb(192 38 211)",
  "rgb(217 70 239)",
  "rgb(236 72 153)",
  "rgb(59 130 246)",
  "rgb(14 165 233)",
];

function generateBubbles(): Bubble[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 180) + 40,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.floor(Math.random() * 20) + 30,
    delay: Math.random() * -30,
    moveX: Math.floor(Math.random() * 1200) - 600,
    moveY: Math.floor(Math.random() * 1200) - 600,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

export default function AuthBubbleAnimation() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(generateBubbles());
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            background: bubble.color,
            boxShadow: "1px 1px 1px #ffffff",
            animation: `auth-bubble ${bubble.duration}s ease-in-out ${bubble.delay}s infinite`,

            ["--move-x" as string]: `${bubble.moveX}px`,
            ["--move-y" as string]: `${bubble.moveY}px`,
          }}
        />
      ))}
    </div>
  );
}
