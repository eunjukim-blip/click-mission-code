import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

export const RedFox = () => {
  const foxRef = useRef<Group>(null);

  useFrame((state) => {
    if (foxRef.current) {
      foxRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      foxRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.3;
    }
  });

  return (
    <group ref={foxRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#fb923c" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fb923c" />
      </mesh>

      {/* Left Ear (Triangle) */}
      <mesh position={[-0.25, 1.4, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.2, 0.5, 3]} />
        <meshStandardMaterial color="#fb923c" />
      </mesh>

      {/* Right Ear (Triangle) */}
      <mesh position={[0.25, 1.4, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.2, 0.5, 3]} />
        <meshStandardMaterial color="#fb923c" />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 0.6, 0.4]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#fed7aa" />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.15, 0.9, 0.42]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.15, 0.9, 0.42]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.6, 0.62]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.2, -0.6]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#fb923c" />
      </mesh>

      {/* Pink Cheeks */}
      <mesh position={[-0.35, 0.75, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fca5a5" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0.35, 0.75, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fca5a5" opacity={0.6} transparent />
      </mesh>
    </group>
  );
};
