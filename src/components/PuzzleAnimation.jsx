import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Component for a single puzzle piece shape
const PuzzlePiece = ({ position, rotation, color, delay, speed }) => {
    const meshRef = useRef();

    // Create a custom puzzle-like shape
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const size = 0.5;
        const tabRadius = 0.15;

        s.moveTo(-size, -size);
        s.lineTo(size, -size);
        s.lineTo(size, -tabRadius);
        s.absarc(size, 0, tabRadius, -Math.PI / 2, Math.PI / 2, false);
        s.lineTo(size, size);
        s.lineTo(tabRadius, size);
        s.absarc(0, size, tabRadius, 0, Math.PI, true);
        s.lineTo(-size, size);
        s.lineTo(-size, -size);
        return s;
    }, []);

    const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 3
    };

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            if (time > delay) {
                meshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.01 * speed);
                meshRef.current.rotation.x += 0.005;
                meshRef.current.rotation.y += 0.005;
            }
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
            </mesh>
        </Float>
    );
};

// Alternative: Floating loose pieces
const FloatingPiece = ({ position, rotation, color, speed }) => {
    const meshRef = useRef();

    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const size = 0.4;
        const r = 0.1;
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
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(t * 0.1 * speed) * 0.3;
            meshRef.current.rotation.y = Math.cos(t * 0.2 * speed) * 0.3;
            meshRef.current.position.y += Math.sin(t * speed) * 0.001;
        }
    });

    return (
        <Float speed={1} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
                <extrudeGeometry args={[shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
            </mesh>
        </Float>
    );
};

const PuzzleScene = ({ type }) => {
    const [repulseTime, setRepulseTime] = React.useState(0);

    // Add global click listener to trigger repulsion
    React.useEffect(() => {
        const handleClick = () => {
            setRepulseTime(state => state + 1);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const pieces = useMemo(() => {
        return Array.from({ length: 18 }).map((_, i) => ({
            id: i,
            // Start in a loose cloud
            initialPos: [
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            ],
            // Target loosely around center
            targetPos: [
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2
            ],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5),
            speed: 0.2 + Math.random() * 0.5,
            offset: Math.random() * 100 // Seed for noise-like movement
        }));
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <spotLight position={[-10, 10, 10]} angle={0.2} intensity={1} />

            {pieces.map((p) => (
                <InteractivePiece key={p.id} {...p} repulseTime={repulseTime} />
            ))}

            <ContactShadows position={[0, -4, 0]} opacity={0.3} scale={20} blur={2} far={4.5} />
            <Environment preset="city" />
        </>
    );
};

// New internal component for handled movement logic
const InteractivePiece = ({ initialPos, targetPos, rotation, color, speed, offset, repulseTime }) => {
    const meshRef = useRef();
    const currentPos = useRef(new THREE.Vector3(...initialPos));
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const lastRepulseTime = useRef(0);

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

        // 1. Center Attraction (The "assemble" force)
        const target = new THREE.Vector3(...targetPos);
        // Add some noise to target to keep them moving
        target.x += Math.sin(t * 0.5 + offset) * 0.5;
        target.y += Math.cos(t * 0.4 + offset) * 0.5;

        const force = new THREE.Vector3().subVectors(target, currentPos.current);
        force.multiplyScalar(0.01 * speed);
        velocity.current.add(force);

        // 2. Click Repulsion
        if (repulseTime !== lastRepulseTime.current) {
            lastRepulseTime.current = repulseTime;
            // Push AWAY from center origin [0,0,0]
            const pushDir = new THREE.Vector3().copy(currentPos.current).normalize();
            // If it's too close to center, give it a random direction
            if (pushDir.length() < 0.1) pushDir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            velocity.current.add(pushDir.multiplyScalar(0.8));
        }

        // Apply friction/damping
        velocity.current.multiplyScalar(0.96);

        // Update position
        currentPos.current.add(velocity.current);
        meshRef.current.position.copy(currentPos.current);

        // Gentle rotation
        meshRef.current.rotation.x += 0.005 + velocity.current.length() * 0.05;
        meshRef.current.rotation.y += 0.005 + velocity.current.length() * 0.05;
    });

    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} rotation={rotation} castShadow>
                <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04 }]} />
                <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
            </mesh>
        </Float>
    );
};

const PuzzleAnimation = ({ type = 'assemble' }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at center, rgba(20,20,30,0) 0%, rgba(10,10,15,0.4) 100%)'
        }}>
            <Canvas
                shadows
                gl={{ alpha: true, antialias: true, stencil: false, depth: true }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <PuzzleScene type={type} />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default PuzzleAnimation;
