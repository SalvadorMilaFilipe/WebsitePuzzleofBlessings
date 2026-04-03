import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';

// New internal component for handled movement logic
const InteractivePiece = ({ initialPos, targetGridPos, rotation, color, speed, offset, clickCount, isLoggedIn }) => {
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
        s.lineTo(tabRadius, size); // Wait, tabRadius was from previous code, let's use 0 manually
        s.absarc(0, size, r, 0, Math.PI, true);
        s.lineTo(-size, size);
        s.lineTo(-size, -size);
        return s;
    }, []);

    // Simplified shape for robustness
    const simpleShape = useMemo(() => {
        const s = new THREE.Shape();
        const size = 0.45;
        const hole = 0.15;
        s.moveTo(-size, -size);
        s.lineTo(size, -size);
        s.lineTo(size, -hole);
        s.absarc(size, 0, hole, -Math.PI / 2, Math.PI / 2, false);
        s.lineTo(size, size);
        s.lineTo(hole, size);
        s.absarc(0, size, hole, 0, Math.PI, true);
        s.lineTo(-size, size);
        s.lineTo(-size, -size);
        return s;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (!meshRef.current) return;

        const effectiveClickCount = isLoggedIn ? clickCount : Math.min(clickCount, 4);
        
        // Determine target based on click count and login status
        let target;
        if (isLoggedIn && clickCount >= 5) {
            // Final fusion: move to precise grid position
            target = new THREE.Vector3(...targetGridPos);
        } else {
            // Loose cloud configuration
            const focus = 4.5 / (effectiveClickCount + 1);
            target = new THREE.Vector3(
                Math.sin(t * 0.5 + offset) * focus,
                Math.cos(t * 0.4 + offset) * focus,
                Math.sin(t * 0.3 + offset) * 1.5
            );

            // Jitter for guests on 5th click
            if (!isLoggedIn && clickCount >= 5) {
                target.x += (Math.random() - 0.5) * 1.5;
                target.y += (Math.random() - 0.5) * 1.5;
            }
        }

        const force = new THREE.Vector3().subVectors(target, currentPos.current);
        const strength = (isLoggedIn && clickCount >= 5) ? 0.1 : 0.015 * speed * (clickCount + 1);
        force.multiplyScalar(strength);
        velocity.current.add(force);

        velocity.current.multiplyScalar((isLoggedIn && clickCount >= 5) ? 0.82 : 0.94);

        currentPos.current.add(velocity.current);
        meshRef.current.position.copy(currentPos.current);

        if (isLoggedIn && clickCount >= 5) {
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1);
        } else {
            meshRef.current.rotation.x += 0.005 + (velocity.current.length() * 0.06);
            meshRef.current.rotation.y += 0.005 + (velocity.current.length() * 0.06);
        }
    });

    return (
        <mesh ref={meshRef} rotation={rotation} castShadow>
            <extrudeGeometry args={[simpleShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04 }]} />
            <meshStandardMaterial 
                color={color} 
                roughness={0.1} 
                metalness={0.8} 
                emissive={color}
                emissiveIntensity={(isLoggedIn && clickCount >= 5) ? 4 : clickCount * 0.4} 
            />
        </mesh>
    );
};

const SuccessOrb = ({ visible }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!visible || !meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
    });

    if (!visible) return null;

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.7, 32, 23]} />
                <meshStandardMaterial 
                    color="#81D89E" 
                    emissive="#81D89E" 
                    emissiveIntensity={3} 
                    transparent 
                    opacity={0.25} 
                />
            </mesh>
            <pointLight intensity={15} color="#81D89E" distance={10} />
        </group>
    );
};

const PuzzleScene = ({ clickCount, isLoggedIn }) => {
    const piecesData = useMemo(() => {
        return [
            { id: 0, grid: [-0.47, 0.47, 0], color: '#81D89E' },
            { id: 1, grid: [0.47, 0.47, 0], color: '#5BC0EB' },
            { id: 2, grid: [-0.47, -0.47, 0], color: '#AA9AD8' },
            { id: 3, grid: [0.47, -0.47, 0], color: '#FFD700' },
            ...Array.from({ length: 15 }).map((_, i) => ({
                id: i + 4,
                grid: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5],
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
            }))
        ].map(p => ({
            ...p,
            initialPos: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 8],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            speed: 0.4 + Math.random() * 0.8,
            offset: Math.random() * 25
        }));
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={50} />
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 10, 10]} intensity={1.5} />
            
            {piecesData.map((p) => (
                <InteractivePiece 
                    key={p.id} 
                    {...p} 
                    targetGridPos={p.grid}
                    clickCount={clickCount} 
                    isLoggedIn={isLoggedIn}
                />
            ))}

            <SuccessOrb visible={isLoggedIn && clickCount >= 5} />
            <Environment preset="city" />
            <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={5} />
        </>
    );
};

const PuzzleAnimation = () => {
    const { session } = useAuth();
    const isLoggedIn = !!session;
    
    const [clickCount, setClickCount] = useState(0);
    const [completed, setCompleted] = useState(false);

    const handleContainerClick = () => {
        if (completed && isLoggedIn) return;
        
        setClickCount(prev => {
            const next = prev + 1;
            if (isLoggedIn && next === 5) {
                setCompleted(true);
            }
            if (!isLoggedIn && next > 5) return 0;
            return next;
        });
    };

    const [isWebGLSupported] = useState(() => {
        if (typeof window === 'undefined') return true;
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) { return false; }
    });

    if (!isWebGLSupported) {
        return <div style={{ position: 'absolute', inset: 0, background: '#0a0a0f' }} />;
    }

    return (
        <div 
            onClick={handleContainerClick}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'auto',
                background: 'radial-gradient(circle at center, rgba(139, 181, 214, 0.05) 0%, transparent 80%)',
                cursor: completed ? 'default' : 'pointer'
            }}
        >
            <Canvas shadows gl={{ antialias: true }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <PuzzleScene clickCount={clickCount} isLoggedIn={isLoggedIn} />
                </Suspense>
            </Canvas>
            
            {completed && (
                <div style={{
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#81D89E',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '5px',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    animation: 'fade-in-glow 1.2s ease-out forwards'
                }}>
                    <style>{`
                        @keyframes fade-in-glow {
                            0% { opacity: 0; transform: translate(-50%, 20px); filter: blur(10px); }
                            100% { opacity: 1; transform: translate(-50%, 0); filter: blur(0); text-shadow: 0 0 20px rgba(129, 216, 158, 0.8); }
                        }
                    `}</style>
                    Blessing Fragment Restored
                </div>
            )}
        </div>
    );
};

export default PuzzleAnimation;
