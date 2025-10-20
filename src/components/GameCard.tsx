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

const colorClassMap = {
  blue: "bg-game-blue",
  red: "bg-game-red",
  green: "bg-game-green",
  gray: "bg-game-gray",
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
        relative w-64 h-64 rounded-3xl shadow-2xl transition-all duration-300
        flex flex-col items-center justify-center gap-4 p-6
        ${colorClassMap[color]}
        ${onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""}
        ${isAnimating ? "animate-wiggle" : ""}
      `}
    >
      <img
        src={characterMap[color]}
        alt={`${color} character`}
        className={`w-32 h-32 object-contain ${color === "blue" ? "animate-bounce" : ""}`}
      />
      {children && (
        <div className="text-white font-bold text-lg text-center">
          {children}
        </div>
      )}
    </div>
  );
};
