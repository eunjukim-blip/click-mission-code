import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

export const BlueBunny = () => {
  const bunnyRef = useRef<Group>(null);

  useFrame((state) => {
    if (bunnyRef.current) {
      bunnyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={bunnyRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>

      {/* Left Ear */}
      <mesh position={[-0.25, 1.5, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>

      {/* Right Ear */}
      <mesh position={[0.25, 1.5, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.1, 0.6, 8, 16]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.2, 0.9, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.2, 0.9, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.7, 0.48]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#fca5a5" />
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
