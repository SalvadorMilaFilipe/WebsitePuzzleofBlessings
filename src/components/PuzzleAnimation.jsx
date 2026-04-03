import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';

// Helper to create unique puzzle piece shapes with specific tabs
// tabs: [top, right, bottom, left], where 0=flat, 1=out, -1=in
const createPuzzleShape = (tabs) => {
    const s = new THREE.Shape();
    const size = 0.45;
    const h = 0.16; // hole/tab radius

    // Start Top-Left
    s.moveTo(-size, size);

    // Top Side
    if (tabs[0] === 1) { s.lineTo(-h, size); s.absarc(0, size, h, Math.PI, 0, false); }
    else if (tabs[0] === -1) { s.lineTo(-h, size); s.absarc(0, size, h, Math.PI, 0, true); }
    s.lineTo(size, size);

    // Right Side
    if (tabs[1] === 1) { s.lineTo(size, h); s.absarc(size, 0, h, Math.PI / 2, -Math.PI / 2, true); }
    else if (tabs[1] === -1) { s.lineTo(size, h); s.absarc(size, 0, h, Math.PI / 2, -Math.PI / 2, false); }
    s.lineTo(size, -size);

    // Bottom Side
    if (tabs[2] === 1) { s.lineTo(h, -size); s.absarc(0, -size, h, 0, Math.PI, false); }
    else if (tabs[2] === -1) { s.lineTo(h, -size); s.absarc(0, -size, h, 0, Math.PI, true); }
    s.lineTo(-size, -size);

    // Left Side
    if (tabs[3] === 1) { s.lineTo(-size, -h); s.absarc(-size, 0, h, -Math.PI / 2, Math.PI / 2, true); }
    else if (tabs[3] === -1) { s.lineTo(-size, -h); s.absarc(-size, 0, h, -Math.PI / 2, Math.PI / 2, false); }
    s.lineTo(-size, size);

    return s;
};

// New internal component for handled movement logic
const InteractivePiece = ({ initialPos, targetGridPos, rotation, color, speed, offset, clickCount, isLoggedIn, tabs }) => {
    const meshRef = useRef();
    const currentPos = useRef(new THREE.Vector3(...initialPos));
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    
    // Shape logic unique to each piece
    const shape = useMemo(() => createPuzzleShape(tabs || [0,0,0,0]), [tabs]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (!meshRef.current) return;

        const effectiveClickCount = isLoggedIn ? clickCount : Math.min(clickCount, 4);
        
        let target;
        if (isLoggedIn && clickCount >= 5) {
            target = new THREE.Vector3(...targetGridPos);
        } else {
            const focus = 5 / (effectiveClickCount + 1);
            target = new THREE.Vector3(
                Math.sin(t * 0.4 + offset) * focus,
                Math.cos(t * 0.35 + offset) * focus,
                Math.sin(t * 0.3 + offset) * 1.5
            );

            if (!isLoggedIn && clickCount >= 5) {
                target.x += (Math.random() - 0.5) * 1.5;
                target.y += (Math.random() - 0.5) * 1.5;
            }
        }

        const force = new THREE.Vector3().subVectors(target, currentPos.current);
        const strength = (isLoggedIn && clickCount >= 5) ? 0.12 : 0.015 * speed * (clickCount + 1);
        force.multiplyScalar(strength);
        velocity.current.add(force);

        velocity.current.multiplyScalar((isLoggedIn && clickCount >= 5) ? 0.8 : 0.94);

        currentPos.current.add(velocity.current);
        meshRef.current.position.copy(currentPos.current);

        if (isLoggedIn && clickCount >= 5) {
            meshRef.current.rotation.set(0, 0, 0); // Perfect rotation snap
        } else {
            meshRef.current.rotation.x += 0.005 + (velocity.current.length() * 0.06);
            meshRef.current.rotation.y += 0.005 + (velocity.current.length() * 0.06);
        }
    });

    return (
        <mesh ref={meshRef} rotation={rotation} castShadow>
            <extrudeGeometry args={[shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04 }]} />
            <meshStandardMaterial 
                color={color} 
                roughness={0.15} 
                metalness={0.8} 
                emissive={color}
                emissiveIntensity={(isLoggedIn && clickCount >= 5) ? 4 : clickCount * 0.35} 
            />
        </mesh>
    );
};

const SuccessOrb = ({ visible }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!visible || !meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
    });

    if (!visible) return null;

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.8, 48, 32]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#81D89E" 
                    emissiveIntensity={2} 
                    transparent 
                    opacity={0.15} 
                />
            </mesh>
            <pointLight intensity={18} color="#81D89E" distance={15} />
        </group>
    );
};

const PuzzleScene = ({ clickCount, isLoggedIn }) => {
    const piecesData = useMemo(() => {
        // Specific 2x2 interlocking logic
        // tabs: [top, right, bottom, left], 1=out, -1=in
        return [
            { id: 0, grid: [-0.435, 0.435, 0], color: '#81D89E', tabs: [0, 1, 1, 0] },     // TL: Out Right, Out Bottom
            { id: 1, grid: [0.435, 0.435, 0], color: '#5BC0EB', tabs: [0, 0, 1, -1] },    // TR: In Left, Out Bottom
            { id: 2, grid: [-0.435, -0.435, 0], color: '#AA9AD8', tabs: [-1, 1, 0, 0] },   // BL: In Top, Out Right
            { id: 3, grid: [0.435, -0.435, 0], color: '#FFD700', tabs: [-1, 0, 0, -1] },   // BR: In Top, In Left
            
            // Background filler pieces (reduced to 7)
            ...Array.from({ length: 7 }).map((_, i) => ({
                id: i + 4,
                grid: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 4],
                color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5),
                tabs: [0, Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1] 
            }))
        ].map(p => ({
            ...p,
            initialPos: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            speed: 0.5 + Math.random() * 0.7,
            offset: Math.random() * 50
        }));
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 10, 8]} intensity={2} />
            
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
            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2} far={6} />
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
