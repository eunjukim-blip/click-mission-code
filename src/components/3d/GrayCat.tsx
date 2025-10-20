import { useRef } from "react";
import { Group } from "three";

export const GrayCat = () => {
  const catRef = useRef<Group>(null);

  return (
    <group ref={catRef}>
      {/* Body */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Left Ear (Triangle) */}
      <mesh position={[-0.3, 1.1, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.2, 0.4, 3]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Right Ear (Triangle) */}
      <mesh position={[0.3, 1.1, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.2, 0.4, 3]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Closed Left Eye */}
      <mesh position={[-0.2, 0.7, 0.4]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Closed Right Eye */}
      <mesh position={[0.2, 0.7, 0.4]} rotation={[0, 0, -0.2]}>
        <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.5, 0.48]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.2, 0.4]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, -0.3, -0.6]} rotation={[0.8, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Pink Cheeks */}
      <mesh position={[-0.35, 0.55, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fca5a5" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0.35, 0.55, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fca5a5" opacity={0.6} transparent />
      </mesh>
    </group>
  );
};
