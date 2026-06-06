import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Text3D } from "@react-three/drei"
import * as THREE from "three"

function Coin({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(delay)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    timeRef.current += delta
    // Gentle floating rotation
    meshRef.current.rotation.y += delta * 0.8
    meshRef.current.rotation.x = Math.sin(timeRef.current * 0.5 + delay) * 0.2
    meshRef.current.position.y = position[1] + Math.sin(timeRef.current * 1.2 + delay) * 0.15
  })

  // Chinese coin geometry: torus-like with square hole
  const coinGeo = useMemo(() => {
    const shape = new THREE.Shape()
    const outerR = 1
    const innerSize = 0.25 // square hole half-size

    shape.moveTo(-outerR, -outerR)
    shape.lineTo(outerR, -outerR)
    shape.lineTo(outerR, outerR)
    shape.lineTo(-outerR, outerR)
    shape.closePath()

    // Square hole
    const hole = new THREE.Path()
    hole.moveTo(-innerSize, -innerSize)
    hole.lineTo(innerSize, -innerSize)
    hole.lineTo(innerSize, innerSize)
    hole.lineTo(-innerSize, innerSize)
    hole.closePath()
    shape.holes.push(hole)

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 5,
    })
  }, [])

  return (
    <mesh
      ref={meshRef}
      geometry={coinGeo}
      position={position}
      rotation={[Math.PI * 0.3, 0, 0]}
    >
      <meshStandardMaterial
        color="#d4a030"
        metalness={0.85}
        roughness={0.3}
        envMapIntensity={0.6}
      />
    </mesh>
  )
}

export default function CoinTossAnimation() {
  return (
    <div className="w-full h-[320px] md:h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.4} color="#f6bc4f" />

        <Coin position={[-2, 0.2, 0]} delay={0} />
        <Coin position={[0, -0.1, 0.5]} delay={1.5} />
        <Coin position={[2, 0.3, -0.3]} delay={3.0} />

        {/* Subtle particles */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={[-1.5, 1.8, -2]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#f6bc4f" transparent opacity={0.6} />
          </mesh>
        </Float>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.7}>
          <mesh position={[1.8, -1.5, -1.5]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#f6bc4f" transparent opacity={0.4} />
          </mesh>
        </Float>
      </Canvas>
    </div>
  )
}
