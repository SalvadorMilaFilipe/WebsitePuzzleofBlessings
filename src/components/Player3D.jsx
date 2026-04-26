import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useFBX, OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url }) {
  const fbx = useFBX(url)
  const groupRef = useRef()

  // Apply some material polishing if needed
  useEffect(() => {
    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        // If the model looks too dark or loses texture, we can adjust here
        if (child.material) {
          child.material.roughness = 0.4
          child.material.metalness = 0.2
        }
      }
    })
  }, [fbx])

  // Soft auto-rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  return (
    <primitive 
      ref={groupRef}
      object={fbx} 
      scale={0.015} 
      position={[0, -2.8, 0]} 
      dispose={null} 
    />
  )
}

const Player3D = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '450px', 
      cursor: 'grab', 
      position: 'relative',
      zIndex: 1 
    }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
          
          {/* Studio Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#baaae8" />
          <spotLight 
            position={[0, 10, 0]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            castShadow 
          />
          
          <Model url="/playermodel/player.fbx" />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={5} 
            maxDistance={15}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.6}
            autoRotate={false}
          />
          
          {/* Subtle Environment for Reflections */}
          <Environment preset="night" />
          
          {/* Premium Contact Shadows */}
          <ContactShadows 
            position={[0, -2.8, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2} 
            far={4} 
            resolution={256}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Player3D
