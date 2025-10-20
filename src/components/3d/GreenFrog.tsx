import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

export const GreenFrog = () => {
  const frogRef = useRef<Group>(null);

  useFrame((state) => {
    if (frogRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      frogRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={frogRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.1, 0.5]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#d9f99d" />
      </mesh>

      {/* Left Eye Bulge */}
      <mesh position={[-0.3, 0.6, 0.3]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

      {/* Right Eye Bulge */}
      <mesh position={[0.3, 0.6, 0.3]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

      {/* Left Eye */}
      <mesh position={[-0.3, 0.7, 0.48]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.3, 0.7, 0.48]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, 0.1, 0.65]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Left Arm (up) */}
      <mesh position={[-0.7, 0.3, 0]} rotation={[0, 0, -1]}>
        <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

      {/* Right Arm (up) */}
      <mesh position={[0.7, 0.3, 0]} rotation={[0, 0, 1]}>
        <capsuleGeometry args={[0.1, 0.4, 8, 16]} />
        <meshStandardMaterial color="#86efac" />
      </mesh>

      {/* Pink Cheeks */}
      <mesh position={[-0.5, 0.25, 0.45]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fdba74" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0.5, 0.25, 0.45]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fdba74" opacity={0.6} transparent />
      </mesh>
    </group>
  );
};
