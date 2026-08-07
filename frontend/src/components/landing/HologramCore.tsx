import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const HologramCore = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);
  const ring5Ref = useRef<THREE.Mesh>(null);

  // Generate particle coordinate arrays procedural style
  const particleData = useMemo(() => {
    const count = 950;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color('#06b6d4');
    const emerald = new THREE.Color('#10b981');
    const purple = new THREE.Color('#a855f7');

    // Stateless, immutable sine hash based on seed index to satisfy ESLint purity and immutability rules
    const hashRandom = (idx: number) => {
      const val = Math.sin(idx * 12.9898 + 78.233) * 43758.5453123;
      return val - Math.floor(val);
    };

    for (let i = 0; i < count; i++) {
      // Position particles on concentric orbit shells
      const r = 2.2 + hashRandom(i * 3) * 2.5;
      const theta = hashRandom(i * 3 + 1) * Math.PI * 2;
      const phi = Math.acos((hashRandom(i * 3 + 2) * 2) - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Procedural color mapping (Cyan dominant, emerald middle, low-opacity purple accent)
      const colorRand = hashRandom(i * 3 + 3);
      let color = cyan;
      if (colorRand > 0.88) {
        color = purple;
      } else if (colorRand > 0.65) {
        color = emerald;
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Read pointer coordinate offset for interactive mouse feedback
    const mx = state.pointer.x * 0.28;
    const my = state.pointer.y * 0.28;

    // Slow independent rotation movements + mouse pointer translation offsets
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.055 + mx;
      pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.12 + my;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.15 + mx * 0.5;
      ring1Ref.current.rotation.y = time * 0.08 + my * 0.5;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.1 + mx * 0.4;
      ring2Ref.current.rotation.x = time * 0.05 + my * 0.4;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = -time * 0.06 + mx * 0.3;
      ring3Ref.current.rotation.z = time * 0.04 + my * 0.3;
    }

    if (ring4Ref.current) {
      ring4Ref.current.rotation.x = -time * 0.12 + mx * 0.6;
      ring4Ref.current.rotation.z = time * 0.08 + my * 0.6;
    }

    if (ring5Ref.current) {
      ring5Ref.current.rotation.y = time * 0.03 + mx * 0.2;
      ring5Ref.current.rotation.z = -time * 0.02 + my * 0.2;
    }

    // Centered glass core floating animation + mouse inertia
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(time * 1.5) * 0.08 + my * 0.05;
      coreRef.current.rotation.y = time * 0.25 + mx * 0.6;
    }

    // Energy pulse scale animations
    if (pulseRef.current) {
      const pScale = 0.95 + Math.sin(time * 4.0) * 0.06;
      pulseRef.current.scale.set(pScale, pScale, pScale);
      pulseRef.current.rotation.y = -time * 0.4 + mx * 0.5;
    }
  });

  return (
    <group>
      {/* 1. Large Cyan Ambient directional point light directly inside the Core */}
      <pointLight position={[0, 0, 0]} intensity={22.0} color="#22d3ee" distance={25} decay={1.2} />
      <pointLight position={[2, 2, 2]} intensity={10.0} color="#a855f7" distance={20} decay={1.1} />

      {/* Volumetric circular holographic energy fields under the orb */}
      <group position={[0, -0.8, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.01, 0.8, 64]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent={true}
            opacity={0.095}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.01, 0.6, 64]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent={true}
            opacity={0.075}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.01, 0.95, 64]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent={true}
            opacity={0.055}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. Glass Donut (Torus Core - refractive and translucent) */}
      <mesh ref={coreRef}>
        <torusGeometry args={[0.85, 0.28, 32, 64]} />
        <meshPhysicalMaterial
          color="#0891b2"
          roughness={0.08}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.85}
          thickness={1.5}
          transparent={true}
          opacity={0.65}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Donut central inner halo core */}
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent={true}
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Orbiting Network Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 4. Concentric Orbital Grid Rings */}
      
      {/* Ring 1 (Inner Track) */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent={true}
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ring 2 (Middle Track) */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <ringGeometry args={[2.2, 2.215, 64]} />
        <meshBasicMaterial
          color="#10b981"
          transparent={true}
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ring 3 (Outer Sphere border Track) */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[2.8, 2.81, 64]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent={true}
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ring 4 (Technical Inner Guide) */}
      <mesh ref={ring4Ref} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <ringGeometry args={[1.1, 1.105, 64]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent={true}
          opacity={0.22}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ring 5 (Technical Outer Guide) */}
      <mesh ref={ring5Ref} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <ringGeometry args={[3.4, 3.405, 64]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent={true}
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Energy Pulse holographic outline */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent={true}
          opacity={0.15}
          wireframe={true}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Intersecting technical guidelines linking Core to background schema */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[0.05, 5.5, 2, 1]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent={true}
          opacity={0.07}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[0.05, 5.5, 2, 1]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent={true}
          opacity={0.07}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.05, 5.5, 2, 1]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent={true}
          opacity={0.04}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <ringGeometry args={[0.05, 5.5, 2, 1]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent={true}
          opacity={0.04}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default HologramCore;
