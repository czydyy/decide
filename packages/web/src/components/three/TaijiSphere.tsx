import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function TaijiMesh() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      groupRef.current.rotation.x += delta * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main sphere — gold translucent */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#d4a030"
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0.15}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.52, 32, 32]} />
        <meshBasicMaterial
          color="#f6bc4f"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#f6bc4f" transparent opacity={0.2} />
      </mesh>

      {/* Second ring at angle */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.8, 0.015, 16, 100]} />
        <meshBasicMaterial color="#d4a030" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

export default function TaijiSphere({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={0.4} />
        <TaijiMesh />
      </Canvas>
    </div>
  )
}
