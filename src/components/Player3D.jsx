import React, { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useFBX, OrbitControls, PerspectiveCamera, Environment, ContactShadows, Center, Float } from '@react-three/drei'
import * as THREE from 'three'

function Model({ url, onError }) {
  const [fflateLoaded, setFflateLoaded] = useState(false)

  // Load fflate dynamically if not present (required for compressed FBX)
  useEffect(() => {
    if (window.fflate) {
      setFflateLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/fflate@0.8.0/lib/browser.min.js'
    script.onload = () => {
      window.fflate = window.fflate || {} // Ensure it's globally available for THREE.FBXLoader
      setFflateLoaded(true)
    }
    document.head.appendChild(script)
  }, [])

  if (!fflateLoaded) return null

  return <FBXModel url={url} onError={onError} />
}

function FBXModel({ url, onError }) {
  try {
    const loadedFbx = useFBX(url)
    
    useEffect(() => {
      if (loadedFbx) {
        loadedFbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            if (child.material) {
              child.material.roughness = 0.5
              child.material.metalness = 0.3
            }
          }
        })
      }
    }, [loadedFbx])

    return (
      <Center top>
        <primitive 
          object={loadedFbx} 
          scale={0.02} // Increased scale
          dispose={null} 
        />
      </Center>
    )
  } catch (err) {
    console.error("FBX Load Error:", err)
    if (onError) onError(err)
    return null
  }
}

// Fallback component if model fails or is loading
const FallbackBox = () => (
  <group>
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#81D89E" />
    </mesh>
    <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} />
  </group>
)

const Player3D = () => {
  const [hasError, setHasError] = useState(false)

  return (
    <div style={{ 
      width: '600px', 
      height: '450px', 
      cursor: 'grab', 
      position: 'relative',
      zIndex: 100,
      background: 'rgba(255,0,0,0.1)', // Temporary red tint to see the canvas area
      borderRadius: '20px',
      margin: '0 auto'
    }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <Suspense fallback={<FallbackBox />}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
          
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          
          <group position={[0, -1, 0]}>
            {!hasError ? (
              <Model url="/playermodel/player.fbx" onError={() => setHasError(true)} />
            ) : (
              <FallbackBox />
            )}
          </group>

          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5]} />
            <meshBasicMaterial color="lime" />
          </mesh>
          <gridHelper args={[20, 20]} />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={2} 
            maxDistance={15}
          />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Player3D
