import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, Billboard } from "@react-three/drei"
import * as THREE from "three"
import type { PaipanLine } from "@liuyao/shared"

interface HexagramRingProps {
  lines: PaipanLine[]
  className?: string
}

function Pillar({
  angle,
  radius,
  index,
  line,
}: {
  angle: number
  radius: number
  index: number
  line: PaipanLine
}) {
  const isYang = line.yao_type === "yang"
  const isChanging = line.changing
  const height = 1.8
  const pillarRadius = 0.12

  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  return (
    <group position={[x, 0, z]}>
      {isYang ? (
        /* Solid pillar for yang */
        <mesh>
          <cylinderGeometry args={[pillarRadius, pillarRadius, height, 32]} />
          <meshStandardMaterial
            color={isChanging ? "#f6bc4f" : "#d4a030"}
            metalness={0.7}
            roughness={0.3}
            emissive={isChanging ? "#f6bc4f" : "#000000"}
            emissiveIntensity={isChanging ? 0.6 : 0}
          />
        </mesh>
      ) : (
        /* Split pillar for yin */
        <>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[pillarRadius, pillarRadius, height * 0.35, 32]} />
            <meshStandardMaterial
              color={isChanging ? "#f6bc4f" : "#b8891e"}
              metalness={0.7}
              roughness={0.3}
              emissive={isChanging ? "#f6bc4f" : "#000000"}
              emissiveIntensity={isChanging ? 0.5 : 0}
            />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[pillarRadius, pillarRadius, height * 0.35, 32]} />
            <meshStandardMaterial
              color={isChanging ? "#f6bc4f" : "#b8891e"}
              metalness={0.7}
              roughness={0.3}
              emissive={isChanging ? "#f6bc4f" : "#000000"}
              emissiveIntensity={isChanging ? 0.5 : 0}
            />
          </mesh>
        </>
      )}

      {/* Position number */}
      <Billboard position={[0, -1.15, 0]}>
        <Text
          fontSize={0.2}
          color="#a09888"
          anchorX="center"
          anchorY="middle"
        >
          {`${line.position}`}
        </Text>
      </Billboard>

      {/* Changing indicator */}
      {isChanging && (
        <mesh position={[0, isYang ? 0 : 0, 0]}>
          <ringGeometry args={[pillarRadius + 0.08, pillarRadius + 0.12, 32]} />
          <meshBasicMaterial color="#f6bc4f" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

function Ring({ lines }: { lines: PaipanLine[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const radius = 2.2

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.1, 0.03, 16, 100]} />
        <meshBasicMaterial color="#6b6058" transparent opacity={0.2} />
      </mesh>

      {/* Pillars */}
      {lines.map((line, i) => {
        const angle = (i / lines.length) * Math.PI * 2 - Math.PI / 2
        return (
          <Pillar
            key={line.position}
            angle={angle}
            radius={radius}
            index={i}
            line={line}
          />
        )
      })}

      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#d4a030"
          metalness={0.8}
          roughness={0.2}
          emissive="#d4a030"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

export default function HexagramRing({ lines, className = "" }: HexagramRingProps) {
  return (
    <div className={`w-full h-[350px] md:h-[450px] ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={0.7} />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} />
        <pointLight position={[0, 2, 0]} intensity={0.5} color="#f6bc4f" />

        <Ring lines={lines} />
      </Canvas>
    </div>
  )
}
