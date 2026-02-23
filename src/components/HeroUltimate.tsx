/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ─── SHADERS & MATERIALS ─────────────────────────────────────────────────────

// Custom shader for the background "nebula" layer
const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    // Deep, dark gradient
    vec3 c1 = vec3(0.01, 0.01, 0.02); // Almost black
    vec3 c2 = vec3(0.04, 0.06, 0.15); // Deep blue-violet
    
    // Very subtle noise movement
    float n = random(vUv + uTime * 0.05);
    vec3 color = mix(c1, c2, vUv.y + n * 0.02);
    
    // Adding a "horizon" glow
    float horizon = smoothstep(0.0, 0.4, vUv.y);
    color += vec3(0.02, 0.04, 0.1) * (1.0 - horizon) * 0.5;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// Layer 1: Background Nebula Plane
const BackgroundLayer: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.ShaderMaterial>(null!);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    return (
        <mesh ref={meshRef} position={[0, 0, -10]} scale={[100, 100, 1]}>
            <planeGeometry />
            <shaderMaterial
                ref={materialRef}
                vertexShader={bgVertexShader}
                fragmentShader={bgFragmentShader}
                uniforms={uniforms}
                depthWrite={false}
            />
        </mesh>
    );
};

// Layer 2: The Main Event - Dense Particle Field
// Using InstancedMesh for performance with thousands of objects
const ParticleField: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Configuration
    const countX = 80; // Dense grid
    const countZ = 80;
    const total = countX * countZ;
    const spacing = 0.6; // Tight spacing for "surface" feel

    useFrame((state) => {
        const time = state.clock.getElapsedTime() * 0.4;
        const pointer = state.pointer;

        let i = 0;
        for (let x = 0; x < countX; x++) {
            for (let z = 0; z < countZ; z++) {
                // Calculate position loops
                const xPos = (x - countX / 2) * spacing;
                const zPos = (z - countZ / 2) * spacing;

                // Wave Logic (Simplex-like combination of sins)
                // Distinct layers of motion for complexity
                const y1 = Math.sin(xPos * 0.3 + time) * 1.5;
                const y2 = Math.cos(zPos * 0.2 + time * 1.2) * 1.0;
                const y3 = Math.sin((xPos + zPos) * 0.5 + time * 0.5) * 0.5;

                // Mouse Interaction (Ripple)
                // Simple distance check
                // We project mouse to roughly world space (z=0 check)
                const dx = xPos - (pointer.x * 20); // Scale mouse to grid
                const dz = zPos - (pointer.y * 10); // Perspective skew
                const dist = Math.sqrt(dx * dx + dz * dz * 2.0); // Elliptical influence
                const influence = Math.max(0, 10 - dist) / 10;
                const mouseWave = Math.sin(dist * 2.0 - time * 5.0) * influence * 1.5;

                // Combine
                const y = y1 + y2 + y3 + mouseWave;

                // Scale based on height (peaks are larger/brighter)
                const scale = 0.8 + (y * 0.1);

                dummy.position.set(xPos, y - 5, zPos - 10); // Shift down and back slightly
                dummy.rotation.set(time * 0.1, time * 0.1, 0); // Subtle spin
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(i, dummy.matrix);

                // Optional: We could update color per instance here too if needed,
                // but material color is cheaper.

                i++;
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, total]}>
            {/* Sphere for smooth, glossy look */}
            <sphereGeometry args={[0.2, 16, 16]} />
            {/* 
               MeshPhysicalMaterial for the "Premium" look.
               Clearcoat gives it that "car paint" or "wet" shine.
               Roughness 0.1 makes it glossy but not perfect mirror.
            */}
            <meshPhysicalMaterial
                color="#0a0a0a" // Obsidian black
                emissive="#050510"
                emissiveIntensity={0.2}
                roughness={0.1}
                metalness={0.8}
                clearcoat={1.0}
                clearcoatRoughness={0.1}
                reflectivity={1.0}
            />
        </instancedMesh>
    );
};

// Layer 3: Foreground Dust / Floating Embers
const FloatingDust: React.FC = () => {
    const count = 150;
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 50,
            y: (Math.random() - 0.5) * 30,
            z: (Math.random() - 0.5) * 20 + 5, // Closer to camera
            speed: Math.random() * 0.2 + 0.05,
            offset: Math.random() * Math.PI * 2
        }));
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        particles.forEach((p, i) => {
            // Float upwards slowly
            const y = p.y + Math.sin(time * p.speed + p.offset) * 2.0;
            // Loop vertically
            const yLooped = ((y + 15) % 30) - 15;

            dummy.position.set(p.x, yLooped, p.z);
            const scale = 0.05 * (1 + Math.sin(time + p.offset)); // Twinkle size
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#4a6aff" transparent opacity={0.6} />
        </instancedMesh>
    );
};

// Post Processing Rig setup manually to avoid library issues
const EffectsRig: React.FC = () => {
    const { gl, scene, camera, size } = useThree();
    const composer = useRef<EffectComposer>();

    useEffect(() => {
        composer.current = new EffectComposer(gl);
        composer.current.addPass(new RenderPass(scene, camera));

        // Premium Bloom
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height),
            1.2, // Strength - slightly higher for that "dreamy" look
            0.5, // Radius - mid range
            0.1  // Threshold - only brightest parts glow
        );
        composer.current.addPass(bloomPass);

        const outputPass = new OutputPass();
        composer.current.addPass(outputPass);

        return () => composer.current?.dispose();
    }, [gl, scene, camera, size]);

    useFrame(() => {
        composer.current?.render();
    }, 1);

    return null;
};

// ─── SCENE SETUP ─────────────────────────────────────────────────────────────

const Scene: React.FC = () => {
    const { camera } = useThree();

    // Set initial camera position
    camera.position.set(0, 0, 15);
    // camera.lookAt(0, 0, 0); // Default looks at 0,0,0

    return (
        <>
            {/* Cinematic Lighting Setup */}
            <ambientLight intensity={0.2} color="#0000ff" />

            {/* Key Light (Cool Blue-White) from top-right */}
            <spotLight
                position={[20, 20, 20]}
                angle={0.15}
                penumbra={1}
                intensity={800}
                color="#cceeff"
            />

            {/* Rim Light (Deep Violet) from back-left for contour */}
            <spotLight
                position={[-20, 10, -10]}
                angle={0.3}
                penumbra={1}
                intensity={1200}
                color="#6600ff"
            />

            {/* Fill Light (Soft Blue) from bottom */}
            <pointLight position={[0, -10, 10]} intensity={50} color="#0066ff" />

            {/* Render Layers */}
            <BackgroundLayer />
            <ParticleField />
            <FloatingDust />

            {/* Effects */}
            <EffectsRig />
        </>
    );
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

const HeroUltimate: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 bg-black">
            <Canvas
                dpr={[1, 2]} // High DPI for crisp edges
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true
                }}
            >
                <Scene />
            </Canvas>

            {/* Gradient Overlays for UI Readability */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        </div>
    );
};

export default HeroUltimate;
