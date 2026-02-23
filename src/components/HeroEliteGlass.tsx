import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float, OrthographicCamera, useAspect } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '../hooks/useIsMobile';

// Our core abstract shape - a beautifully smoothed geometric form
function GlassSculpture({ isMobile }: { isMobile: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<any>(null!);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();

        // Gentle floating rotation
        meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.2;
        meshRef.current.rotation.y += 0.005;

        // Mouse tracking for physical interaction (the lens looks towards the mouse)
        const { pointer } = state;
        const targetX = (pointer.x * Math.PI) / 8;
        const targetY = (pointer.y * Math.PI) / 8;

        meshRef.current.rotation.y += 0.05 * (targetX - meshRef.current.rotation.y);
        meshRef.current.rotation.x += 0.05 * (-targetY - meshRef.current.rotation.x);
    });

    return (
        <Float floatIntensity={isMobile ? 1 : 2} rotationIntensity={isMobile ? 0.5 : 1} speed={isMobile ? 1 : 1.5}>
            <mesh ref={meshRef} position={[0, 0, 0]} scale={2.5}>
                {/* icosahedronGeometry detail reduced on mobile (6 -> 3 or 4) */}
                <icosahedronGeometry args={[1.5, isMobile ? 3 : 6]} />
                <MeshTransmissionMaterial
                    ref={materialRef}
                    background={new THREE.Color('#010103')}
                    transmission={1}
                    roughness={isMobile ? 0.1 : 0.05}
                    thickness={2.5}
                    ior={1.33}
                    chromaticAberration={0.15}
                    anisotropy={isMobile ? 0.1 : 0.3}
                    distortion={isMobile ? 0 : 0.1}
                    distortionScale={isMobile ? 0 : 0.5}
                    temporalDistortion={isMobile ? 0 : 0.2}
                    clearcoat={1}
                    attenuationDistance={1}
                    attenuationColor="#ffffff"
                    color="#ffffff"
                    samples={isMobile ? 4 : 16} // Drastically reduce samples on mobile
                    resolution={isMobile ? 256 : 1024} // Lower resolution for refraction buffer
                />
            </mesh>
        </Float>
    );
}

// Background Elements to refract through the glass.
function BackgroundOrbs({ isMobile }: { isMobile: boolean }) {
    const { width, height } = useThree((state) => state.viewport);
    const orb1Ref = useRef<THREE.Mesh>(null!);
    const orb2Ref = useRef<THREE.Mesh>(null!);
    const orb3Ref = useRef<THREE.Mesh>(null!);

    // Reduce sphere segments on mobile
    const segments = isMobile ? 16 : 32;

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * 0.5;

        // Slow, haunting orbits in the deep background
        if (orb1Ref.current) {
            orb1Ref.current.position.x = Math.sin(t) * (width * 0.3);
            orb1Ref.current.position.y = Math.cos(t * 0.8) * (height * 0.3);
        }
        if (orb2Ref.current) {
            orb2Ref.current.position.x = Math.cos(t * 1.2) * (width * 0.4);
            orb2Ref.current.position.y = Math.sin(t * 0.5) * (height * 0.4);
        }
        if (orb3Ref.current) {
            orb3Ref.current.position.x = Math.sin(t * 0.7) * (width * 0.2);
            orb3Ref.current.position.y = Math.cos(t * 1.1) * (height * 0.2);
        }
    });

    return (
        <group position={[0, 0, -5]}>
            {/* Orb 1: Vercel/Nextjs Electric Cyan */}
            <mesh ref={orb1Ref}>
                <sphereGeometry args={[1.5, segments, segments]} />
                <meshBasicMaterial color="#00e5ff" toneMapped={false} />
            </mesh>

            {/* Orb 2: Deep Purple/Magenta */}
            <mesh ref={orb2Ref}>
                <sphereGeometry args={[2.5, segments, segments]} />
                <meshBasicMaterial color="#651fff" toneMapped={false} />
            </mesh>

            {/* Orb 3: Brilliant White/Silver core */}
            <mesh ref={orb3Ref}>
                <sphereGeometry args={[0.8, segments, segments]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
        </group>
    );
}

export default function HeroEliteGlass() {
    const isMobile = useIsMobile();

    return (
        <div className="absolute inset-0 z-0 bg-[#010102] overflow-hidden mix-blend-screen">
            <Canvas
                dpr={isMobile ? 1 : [1, 2]}
                gl={{ antialias: !isMobile, alpha: false, powerPreference: 'high-performance' }}
            >
                {/* We use an Orthographic camera for a more architectural, graphic design look */}
                <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={isMobile ? 70 : 100} />

                {/* The beautiful studio lighting environment for the glass to reflect */}
                <Environment preset="city" />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={2} />
                <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#00e5ff" />

                <BackgroundOrbs isMobile={isMobile} />

                {/* The main piece */}
                <GlassSculpture isMobile={isMobile} />
            </Canvas>

            {/* Extreme luxury vignettes to blend perfectly into the black page body */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(1,1,2,0.95)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        </div>
    );
}
