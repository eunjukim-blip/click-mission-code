import { useState, useEffect } from "react";
import characterBlue from "@/assets/character-blue.png";
import characterRed from "@/assets/character-red.png";
import characterGreen from "@/assets/character-green.png";
import characterGray from "@/assets/character-gray.png";

type GameColor = "blue" | "red" | "green" | "gray";

interface GameCardProps {
  color: GameColor;
  onClick?: () => void;
  children?: React.ReactNode;
}

const characterMap = {
  blue: characterBlue,
  red: characterRed,
  green: characterGreen,
  gray: characterGray,
};

export const GameCard = ({ color, onClick, children }: GameCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

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
        transition-all duration-300
        ${onClick ? "cursor-pointer hover:scale-110 active:scale-95" : ""}
        ${isAnimating ? "animate-wiggle" : ""}
      `}
    >
      <img
        src={characterMap[color]}
        alt={`${color} character`}
        className={`w-64 h-64 object-contain drop-shadow-2xl ${
          color === "blue" ? "animate-bounce" : ""
        }`}
      />
      {children && (
        <div className="text-foreground font-bold text-2xl text-center bg-white/90 px-6 py-3 rounded-full shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};
