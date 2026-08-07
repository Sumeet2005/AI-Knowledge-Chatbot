import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HologramCore } from './HologramCore';

export const ThreeCanvas = () => {
  return (
    <div className="w-full h-full min-h-[360px] md:min-h-[500px] flex items-center justify-center relative select-none">
      {/* 3D R3F Canvas Container */}
      <Canvas
        camera={{ position: [0, 0, 1.6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        
        <Suspense fallback={null}>
          <HologramCore />
        </Suspense>

        {/* Orbit Controls restricted to prevent user from getting lost */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI * 2 / 3}
        />
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;
