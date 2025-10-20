import { useState, useEffect, useRef } from "react";
import characterBlue from "@/assets/character-blue.png";
import characterRed from "@/assets/character-red.png";
import characterGreen from "@/assets/character-green.png";
import characterGray from "@/assets/character-gray.png";

type GameColor = "blue" | "red" | "green" | "gray";

interface GameCardProps {
  color: GameColor;
  onClick?: () => void;
  onRedVisible?: () => void;
  children?: React.ReactNode;
}

const characterMap = {
  blue: characterBlue,
  red: characterRed,
  green: characterGreen,
  gray: characterGray,
};

export const GameCard = ({ color, onClick, onRedVisible, children }: GameCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload character images to avoid decode jank
  useEffect(() => {
    Object.values(characterMap).forEach((src) => {
      const img = new Image();
      img.src = src as string;
    });
  }, []);

  // Fire callback when red image is actually visible (post-paint)
  useEffect(() => {
    if (color === "red" && imgRef.current) {
      if (imgRef.current.complete) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onRedVisible?.();
          });
        });
      }
    }
  }, [color, onRedVisible]);

  useEffect(() => {
    if (color === "red") {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [color]);

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-4
        ${onClick ? "cursor-pointer hover:scale-110 active:scale-95" : ""}
        ${isAnimating ? "animate-wiggle" : ""}
      `}
    >
      <img
        ref={imgRef}
        src={characterMap[color]}
        alt={`${color} character`}
        className={`w-64 h-64 object-contain drop-shadow-2xl transition-all duration-200 ${
          color === "blue" ? "animate-bounce" : ""
        }`}
        style={{ imageRendering: 'crisp-edges' }}
        onLoad={() => {
          if (color === "red") {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                onRedVisible?.();
              });
            });
          }
        }}
      />
      {children && (
        <div className="text-foreground font-bold text-2xl text-center bg-white/90 px-6 py-3 rounded-full shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};
