import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';


// New internal component for handled movement logic
const InteractivePiece = ({ initialPos, targetGridPos, rotation, color, speed, offset, clickCount }) => {
    const meshRef = useRef();
    const currentPos = useRef(new THREE.Vector3(...initialPos));
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    
    // Shape logic (standard puzzle piece)
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const size = 0.45;
        const r = 0.12;
        s.moveTo(-size, -size);
        s.lineTo(size, -size);
        s.lineTo(size, -r);
        s.absarc(size, 0, r, -Math.PI / 2, Math.PI / 2, false);
        s.lineTo(size, size);
        s.lineTo(r, size);
        s.absarc(0, size, r, 0, Math.PI, true);
        s.lineTo(-size, size);
        s.lineTo(-size, -size);
        return s;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (!meshRef.current) return;

        // Determine target based on click count
        let target;
        if (clickCount >= 5) {
            // Final fusion: move to precise grid position (forming a 2x2 or similar block)
            target = new THREE.Vector3(...targetGridPos);
        } else {
            // Loose cloud: attraction increases with each click
            const attractionStrength = 0.1 + (clickCount * 0.2);
            target = new THREE.Vector3(
                Math.sin(t * 0.5 + offset) * (4 / (clickCount + 1)),
                Math.cos(t * 0.4 + offset) * (4 / (clickCount + 1)),
                Math.sin(t * 0.3 + offset) * 1.5
            );
        }

        const force = new THREE.Vector3().subVectors(target, currentPos.current);
        const strength = clickCount >= 5 ? 0.08 : 0.01 * speed * (clickCount + 1);
        force.multiplyScalar(strength);
        velocity.current.add(force);

        // Apply friction
        velocity.current.multiplyScalar(clickCount >= 5 ? 0.85 : 0.95);

        // Update position
        currentPos.current.add(velocity.current);
        meshRef.current.position.copy(currentPos.current);

        // Rotation logic: converge to flat rotation on 5th click
        if (clickCount >= 5) {
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
        } else {
            meshRef.current.rotation.x += 0.005 + (velocity.current.length() * 0.05);
            meshRef.current.rotation.y += 0.005 + (velocity.current.length() * 0.05);
        }
    });

    return (
        <mesh ref={meshRef} rotation={rotation} castShadow>
            <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04 }]} />
            <meshStandardMaterial 
                color={color} 
                roughness={0.1} 
                metalness={0.9} 
                emissive={color}
                emissiveIntensity={clickCount >= 5 ? 2 : clickCount * 0.2} 
            />
        </mesh>
    );
};

const SuccessOrb = ({ visible }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!visible || !meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(t * 5) * 0.2);
    });

    if (!visible) return null;

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.5, 32, 23]} />
                <meshStandardMaterial 
                    color="#81D89E" 
                    emissive="#81D89E" 
                    emissiveIntensity={5} 
                    transparent 
                    opacity={0.3} 
                />
            </mesh>
            <pointLight intensity={10} color="#81D89E" />
        </group>
    );
};

const PuzzleScene = ({ onComplete }) => {
    const [clickCount, setClickCount] = useState(0);

    const handleSceneClick = () => {
        if (clickCount < 5) {
            setClickCount(prev => {
                const next = prev + 1;
                if (next === 5 && onComplete) setTimeout(onComplete, 500);
                return next;
            });
        }
    };

    const piecesData = useMemo(() => {
        // Create 4 main pieces that will form a central square
        return [
            { id: 0, grid: [-0.5, 0.5, 0], color: '#81D89E' },
            { id: 1, grid: [0.5, 0.5, 0], color: '#5BC0EB' },
            { id: 2, grid: [-0.5, -0.5, 0], color: '#AA9AD8' },
            { id: 3, grid: [0.5, -0.5, 0], color: '#FFD700' },
            // Add some smaller decoration pieces
            ...Array.from({ length: 12 }).map((_, i) => ({
                id: i + 4,
                grid: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2],
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
            }))
        ].map(p => ({
            ...p,
            initialPos: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 5],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            speed: 0.3 + Math.random() * 0.7,
            offset: Math.random() * 10
        }));
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            
            {/* Click Plane - transparent plane to capture clicks globally in the canvas */}
            <mesh position={[0, 0, 0]} onClick={handleSceneClick} visible={false}>
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {piecesData.map((p) => (
                <InteractivePiece 
                    key={p.id} 
                    {...p} 
                    targetGridPos={p.grid}
                    clickCount={clickCount} 
                />
            ))}

            <SuccessOrb visible={clickCount >= 5} />
            <Environment preset="city" />
            <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={4} />
        </>
    );
};

const PuzzleAnimation = ({ type = 'assemble' }) => {
    const [isWebGLSupported] = useState(() => {
        if (typeof window === 'undefined') return true;
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) { return false; }
    });

    const [completed, setCompleted] = useState(false);

    if (!isWebGLSupported) {
        // Simple fallback remains for non-Chrome/non-WebGL browsers
        return <div style={{ position: 'absolute', inset: 0, background: '#0a0a0f' }} />;
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'auto',
            background: 'radial-gradient(circle at center, rgba(139, 181, 214, 0.05) 0%, transparent 80%)',
            cursor: completed ? 'default' : 'pointer'
        }}>
            <Canvas shadows gl={{ antialias: true }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <PuzzleScene onComplete={() => setCompleted(true)} />
                </Suspense>
            </Canvas>
            
            {completed && (
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#81D89E',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    animation: 'fade-in-up 1s ease-out forwards'
                }}>
                    <style>{`
                        @keyframes fade-in-up {
                            from { opacity: 0; transform: translate(-50%, 20px); }
                            to { opacity: 1; transform: translate(-50%, 0); }
                        }
                    `}</style>
                    Blessing Fragment Restored
                </div>
            )}
        </div>
    );
};

export default PuzzleAnimation;
