import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
const InteractivePiece = ({ initialPos, targetGridPos, rotation, color, speed, offset, clickCount, isLoggedIn, tabs, completed, isStatic }) => {
    const meshRef = useRef();
    const currentPos = useRef(new THREE.Vector3(...initialPos));
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const force = useRef(new THREE.Vector3(0, 0, 0));
    const target = useRef(new THREE.Vector3(0, 0, 0));
    
    const shape = useMemo(() => createPuzzleShape(tabs || [0,0,0,0]), [tabs]);

    useFrame((state) => {
        if (isStatic) return; // Freeze animation

        const t = state.clock.getElapsedTime();
        if (!meshRef.current) return;

        const effectiveClickCount = isLoggedIn ? clickCount : Math.min(clickCount, 4);
        
        if (isLoggedIn && clickCount >= 5) {
            target.current.set(...targetGridPos);
        } else {
            const focus = 5 / (effectiveClickCount + 1);
            target.current.set(
                Math.sin(t * 0.4 + offset) * focus,
                Math.cos(t * 0.35 + offset) * focus,
                Math.sin(t * 0.3 + offset) * 1.5
            );

            if (!isLoggedIn && clickCount >= 5) {
                target.current.x += (Math.random() - 0.5) * 1.5;
                target.current.y += (Math.random() - 0.5) * 1.5;
            }
        }

        force.current.subVectors(target.current, currentPos.current);
        const strength = (isLoggedIn && clickCount >= 5) ? 0.12 : 0.015 * speed * (clickCount + 1);
        force.current.multiplyScalar(strength);
        velocity.current.add(force.current);

        velocity.current.multiplyScalar((isLoggedIn && clickCount >= 5) ? 0.8 : 0.94);

        currentPos.current.add(velocity.current);
        meshRef.current.position.copy(currentPos.current);

        if (isLoggedIn && clickCount >= 5) {
            meshRef.current.rotation.set(0, 0, 0);
        } else {
            const len = velocity.current.length();
            meshRef.current.rotation.x += 0.005 + (len * 0.06);
            meshRef.current.rotation.y += 0.005 + (len * 0.06);
        }
    });

    // Dramatic shift to Deep Amethyst for absolute contrast and lower emissive to prevent white-out
    const displayColor = completed ? '#6A0DAD' : color;

    return (
        <mesh ref={meshRef} rotation={rotation} castShadow visible={!completed || targetGridPos[2] === 0}>
            <extrudeGeometry args={[shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 6 }]} />
            <meshStandardMaterial 
                color={displayColor} 
                roughness={0.25} 
                metalness={0.7} 
                emissive={displayColor}
                emissiveIntensity={isLoggedIn ? ((isLoggedIn && clickCount >= 5) ? 2 : clickCount * 0.35) : 0} 
            />
        </mesh>
    );
};

const SuccessOrb = ({ visible, isStatic }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!visible || !meshRef.current || isStatic) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
    });

    if (!visible) return null;

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.9, 32, 16]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#ffffff" 
                    emissiveIntensity={3} 
                    transparent 
                    opacity={0.15} 
                />
            </mesh>
            <pointLight intensity={25} color="#ffffff" distance={20} />
        </group>
    );
};

const PuzzleScene = ({ clickCount, isLoggedIn, completed, isStatic }) => {
    const piecesData = useMemo(() => {
        return [
            { id: 0, grid: [-0.435, 0.435, 0], color: '#81D89E', tabs: [0, 1, 1, 0] },
            { id: 1, grid: [0.435, 0.435, 0], color: '#5BC0EB', tabs: [0, 0, 1, -1] },
            { id: 2, grid: [-0.435, -0.435, 0], color: '#AA9AD8', tabs: [-1, 1, 0, 0] },
            { id: 3, grid: [0.435, -0.435, 0], color: '#FFD700', tabs: [-1, 0, 0, -1] },
            
            ...Array.from({ length: 8 }).map((_, i) => ({
                id: i + 4,
                // grid[2] is Z - I'll use it to distinguish core pieces in the mesh 'visible' logic
                grid: [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 12, 10], 
                color: new THREE.Color().setHSL(Math.random(), 0.6, 0.5),
                tabs: [0, Math.random() > 0.5 ? 1 : -1, 0, Math.random() > 0.5 ? 1 : -1] 
            }))
        ].map(p => ({
            ...p,
            initialPos: [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            speed: 0.5 + Math.random() * 0.7,
            offset: Math.random() * 50
        }));
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
            <ambientLight intensity={completed ? 0.3 : 0.6} />
            <pointLight position={[5, 10, 8]} intensity={completed ? 3 : 2} />
            
            {piecesData.map((p) => (
                <InteractivePiece 
                    key={p.id} 
                    {...p} 
                    targetGridPos={p.grid}
                    clickCount={clickCount} 
                    isLoggedIn={isLoggedIn}
                    completed={completed}
                    isStatic={isStatic}
                />
            ))}

            <SuccessOrb visible={completed} isStatic={isStatic} />
            <Environment preset="city" resolution={256} />
            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2} far={6} resolution={256} />
        </>
    );
};

const PuzzleAnimation = () => {
    const { session, userProfile } = useAuth();
    const isLoggedIn = !!session;
    
    const [clickCount, setClickCount] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showBlessing, setShowBlessing] = useState(false);

    const [isGranting, setIsGranting] = useState(false);

    const [hasBlessing, setHasBlessing] = useState(false);

    // Check if user already has the blessing on mount or when userProfile changes
    useEffect(() => {
        const checkBlessing = async () => {
            if (!userProfile?.pl_id) {
                console.log('[Puzzle] Waiting for user profile to check blessing...');
                return;
            }
            
            try {
                console.log(`[Puzzle] Checking if player ${userProfile.pl_id} already has blessing 5...`);
                const { data, error } = await supabase
                    .from('player_blessing')
                    .select('bl_id')
                    .eq('pl_id', userProfile.pl_id)
                    .eq('bl_id', 5)
                    .maybeSingle();
                
                if (data && !error) {
                    console.log('[Puzzle] Player already owns Pattern Lens. Disabling interaction.');
                    setHasBlessing(true);
                    setCompleted(true);
                } else {
                    console.log('[Puzzle] Player does not own blessing 5 yet.');
                    setHasBlessing(false);
                }
            } catch (err) {
                console.error('[Puzzle] Error checking owned blessings:', err);
            }
        };
        checkBlessing();
    }, [userProfile, isLoggedIn]);

    const grantBlessing = async () => {
        if (!userProfile?.pl_id) {
            console.error('[Puzzle] No user profile found to claim blessing.');
            return;
        }
        
        setIsGranting(true);
        try {
            console.log(`[Puzzle] Granting Pattern Lens (ID: 5) to player: ${userProfile.pl_id}`);
            const { error } = await supabase
                .from('player_blessing')
                .upsert([
                    { 
                        pl_id: userProfile.pl_id, 
                        bl_id: 5, 
                        date_obtained: new Date().toISOString().split('T')[0],
                        is_in_deck: false 
                    }
                ], { onConflict: 'pl_id, bl_id' });

            if (error) {
                console.error('Error granting blessing:', error.message);
            } else {
                // VERIFICATION STEP: Ensure it's actually in the DB
                const { data: verify, error: vError } = await supabase
                    .from('player_blessing')
                    .select('bl_id')
                    .eq('pl_id', userProfile.pl_id)
                    .eq('bl_id', 5)
                    .maybeSingle();

                if (verify && !vError) {
                    console.log('Pattern Lens blessing granted and verified successfully!');
                    setHasBlessing(true); // Trigger permanent removal of animation
                    setCompleted(true);
                } else {
                    console.error('Verification failed:', vError);
                }
            }
        } catch (err) {
            console.error('Failed to connect to database for blessing grant:', err);
        } finally {
            setIsGranting(false);
        }
    };

    // Reset puzzle if user logs out
    useEffect(() => {
        if (!isLoggedIn) {
            setClickCount(0);
            setCompleted(false);
            setIsExpanded(false);
            setShowBlessing(false);
        }
    }, [isLoggedIn]);

    // Scroll lock logic
    useEffect(() => {
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isExpanded]);

    const handleContainerClick = () => {
        // Block interaction if already completed OR if they already own the blessing
        if ((completed && isLoggedIn) || hasBlessing) {
            console.log('[Puzzle] Interaction blocked: Blessing already owned or puzzle completed.');
            return;
        }
        
        setClickCount(prev => {
            const next = prev + 1;
            console.log(`[Puzzle] Click count: ${next}/5`);
            if (isLoggedIn && next === 5) {
                setCompleted(true);
                setIsExpanded(true); // Trigger immersion
                
                // Show the blessing card with a slight delay for dramatic effect
                setTimeout(() => setShowBlessing(true), 1200);
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
                height: isExpanded ? '100vh' : '100%',
                position: isExpanded ? 'fixed' : 'absolute',
                inset: 0,
                zIndex: isExpanded ? 9999 : 1,
                pointerEvents: 'auto',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isExpanded 
                    ? (showBlessing 
                        ? 'radial-gradient(circle at center, rgba(16, 45, 30, 0.98) 0%, #050a05 100%)' // Deep green for final state
                        : 'rgba(0, 0, 0, 0.98)') 
                    : (completed && hasBlessing) 
                        ? 'radial-gradient(circle at center, rgba(16, 45, 30, 0.4) 0%, transparent 80%)' // Subtle green if already owned
                        : completed ? 'rgba(0, 0, 0, 0.85)' : 'radial-gradient(circle at center, rgba(139, 181, 214, 0.05) 0%, transparent 80%)',
                cursor: (completed && isLoggedIn) || hasBlessing ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {!hasBlessing && (
                <Canvas shadows gl={{ antialias: false, powerPreference: "high-performance" }} dpr={[1, 1.5]}>
                    <Suspense fallback={null}>
                        <PuzzleScene 
                            clickCount={clickCount} 
                            isLoggedIn={isLoggedIn} 
                            completed={completed} 
                            isStatic={showBlessing} 
                        />
                    </Suspense>
                </Canvas>
            )}

            {isExpanded && (
                <div style={{
                    position: 'absolute',
                    top: '8%', // Moved higher to clear the card
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '10px',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    transition: 'all 0.8s ease',
                    animation: 'fade-in-glow-white 1.5s ease-out forwards',
                    zIndex: 10
                }}>
                    <style>{`
                        @keyframes fade-in-glow-white {
                            0% { opacity: 0; transform: translate(-50%, 20px); filter: blur(10px); }
                            100% { opacity: 1; transform: translate(-50%, 0); filter: blur(0); text-shadow: 0 0 30px rgba(255, 255, 255, 0.9); }
                        }
                    `}</style>
                    Blessing Restored
                </div>
            )}

            {/* Blessing Card Overlay */}
            {showBlessing && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '280px', // Slightly smaller
                    height: '400px',
                    backgroundImage: 'url("/blessingcardmodels/Pattern Lens.png")',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    zIndex: 15,
                    animation: 'card-appear 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    filter: 'drop-shadow(0 0 30px rgba(170, 154, 216, 0.6))'
                }}>
                    <style>{`
                        @keyframes card-appear {
                            0% { opacity: 0; transform: translate(-50%, -30%) scale(0.5) rotateY(90deg); }
                            100% { opacity: 1; transform: translate(-50%, -48%) scale(1) rotateY(0); } // Adjusted target Y
                        }
                    `}</style>
                </div>
            )}

            {isExpanded && (
                <button 
                    onClick={async (e) => {
                        e.stopPropagation();
                        if (isGranting) return;
                        
                        await grantBlessing();
                        setIsExpanded(false);
                        setCompleted(false); // Optional: Reset for next time or keep completed
                        setClickCount(0);
                        setShowBlessing(false); // Reset card visibility
                    }}
                    disabled={isGranting}
                    style={{
                        position: 'absolute',
                        bottom: '15%',
                        padding: '15px 40px',
                        background: isGranting ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        borderRadius: '30px',
                        cursor: isGranting ? 'wait' : 'pointer',
                        fontSize: '0.9rem',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        zIndex: 20
                    }}
                    onMouseEnter={(e) => {
                        if (!isGranting) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                            e.target.style.borderColor = 'white';
                            e.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = isGranting ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    Continue Exploration
                </button>
            )}
        </div>
    );
};

export default PuzzleAnimation;
