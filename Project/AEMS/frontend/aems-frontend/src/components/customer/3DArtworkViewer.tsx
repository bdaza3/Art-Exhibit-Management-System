import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei";
import React, { Suspense } from "react";
import type { FC } from "react";

type ModelProps = {
  url: string;
};

function Model({ url }: ModelProps) {
  const gltf = useGLTF(url);
  const scene = (gltf as any).scene || (gltf as any).scenes?.[0] || gltf;
  return <primitive object={scene} scale={1} />;
}

type ArtViewer3DProps = {
  modelUrl: string;
  height?: number;
};

const ArtViewer3D: FC<ArtViewer3DProps> = ({ modelUrl, height }) => {
  if (!modelUrl) return null;

  return (
    <div style={{ width: "100%", height: height ? `${height}px` : "500px" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />

        <Suspense fallback={<Html center>Loading 3D model…</Html>}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls enableZoom />
      </Canvas>
    </div>
  );
};

export default ArtViewer3D;