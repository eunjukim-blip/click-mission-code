import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlueBunny } from "./3d/BlueBunny";
import { RedFox } from "./3d/RedFox";
import { GreenFrog } from "./3d/GreenFrog";
import { GrayCat } from "./3d/GrayCat";

type GameColor = "blue" | "red" | "green" | "gray";

interface GameCard3DProps {
  color: GameColor;
  onClick?: () => void;
  children?: React.ReactNode;
}

const characterComponents = {
  blue: BlueBunny,
  red: RedFox,
  green: GreenFrog,
  gray: GrayCat,
};

const colorClassMap = {
  blue: "bg-game-blue",
  red: "bg-game-red",
  green: "bg-game-green",
  gray: "bg-game-gray",
};

export const GameCard3D = ({ color, onClick, children }: GameCard3DProps) => {
  const CharacterComponent = characterComponents[color];

  return (
    <div
      onClick={onClick}
      className={`
        relative w-80 h-80 rounded-3xl shadow-2xl transition-all duration-300
        flex flex-col items-center justify-center gap-4 p-6
        ${colorClassMap[color]}
        ${onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""}
      `}
    >
      <div className="w-full h-64">
        <Canvas camera={{ position: [0, 1, 4], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />
          <CharacterComponent />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate={color === "blue"}
            autoRotateSpeed={2}
          />
        </Canvas>
      </div>
      {children && (
        <div className="text-white font-bold text-lg text-center">
          {children}
        </div>
      )}
    </div>
  );
};
