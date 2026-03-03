import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, MeshDistortMaterial } from '@react-three/drei';

const ThreeTest = () => {
    return (
        <div style={{ width: '100%', height: '400px', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Box args={[1, 1, 1]}>
                    <MeshDistortMaterial color="#4d94ff" speed={2} distort={0.5} />
                </Box>
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
};

export default ThreeTest;
