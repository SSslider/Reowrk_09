/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, Float, MeshTransmissionMaterial, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ─── BACKGROUND GRADIENT SHADER (INTERACTIVE) ────────────────────────────────
const GradientBackground: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null!);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) }, // Added Mouse
            uColorA: { value: new THREE.Color("#02001c") },
            uColorB: { value: new THREE.Color("#130032") },
            uColorC: { value: new THREE.Color("#001a33") }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec2 uMouse;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform vec3 uColorC;
            varying vec2 vUv;
            
            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            void main() {
                float t = uTime * 0.2;
                
                // Interactive Warp
                // Calculate distance to mouse (approximated in UV space)
                // We assume uMouse is in 0..1 range
                float dist = distance(vUv, uMouse);
                float warp = smoothstep(0.5, 0.0, dist) * 0.1;

                vec2 pos = vUv;
                pos.x += sin(pos.y * 3.0 + t) * 0.1 + warp;
                pos.y += cos(pos.x * 3.0 + t * 1.5) * 0.1 + warp;
                
                vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, pos.y + sin(t)*0.2));
                color = mix(color, uColorC, smoothstep(0.0, 1.0, pos.x + cos(t)*0.2));
                
                // Active Pulse near mouse
                color += vec3(0.05, 0.1, 0.2) * smoothstep(0.3, 0.0, dist);

                float n = noise(vUv * 50.0 + t);
                if (n > 0.98) {
                    color += vec3(0.5) * (n - 0.98) * 50.0;
                }
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    }), []);

    useFrame((state) => {
        shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
        // Smooth mouse follow
        const p = state.pointer; // -1 to 1
        // Map to 0..1 for UVs
        const targetX = p.x * 0.5 + 0.5;
        const targetY = p.y * 0.5 + 0.5;

        shaderMaterial.uniforms.uMouse.value.x += (targetX - shaderMaterial.uniforms.uMouse.value.x) * 0.1;
        shaderMaterial.uniforms.uMouse.value.y += (targetY - shaderMaterial.uniforms.uMouse.value.y) * 0.1;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -20]} scale={[100, 100, 1]}>
            <planeGeometry />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};

// ─── GLASS SHARDS (INTERACTIVE) ──────────────────────────────────────────────

const FloatingShards: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null!);
    const count = 16; // Increased count

    // Initial random data
    const shards = useMemo(() => Array.from({ length: count }, (_, i) => ({
        position: new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 6
        ),
        rotation: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        ),
        scale: Math.random() * 1.2 + 0.4,
        speed: Math.random() * 0.5 + 0.2,
    })), []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Mouse parallax
        const mx = state.pointer.x * 2;
        const my = state.pointer.y * 2;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -my * 0.1, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mx * 0.1, 0.1);
    });

    return (
        <group ref={groupRef}>
            {shards.map((shard, i) => (
                <Float key={i} speed={shard.speed} rotationIntensity={1.5} floatIntensity={2.5}>
                    <mesh
                        position={shard.position}
                        rotation={shard.rotation}
                        scale={shard.scale}
                    >
                        <icosahedronGeometry args={[1, 0]} />
                        <MeshTransmissionMaterial
                            backside={true}
                            thickness={1.5}
                            roughness={0}       // Perfectly smooth
                            transmission={1}
                            ior={1.45}          // Glass/Acrylic
                            chromaticAberration={0.15} // Stronger dispersion on edges
                            anisotropicBlur={0.2}
                            distortion={0.4}
                            distortionScale={0.4}
                            temporalDistortion={0.1}
                            color="#eef"
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

// ─── CENTERPIECE (INTERACTIVE) ───────────────────────────────────────────────

const CenterCrystal: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Subtle breathing scale
        const scale = 2.5 + Math.sin(t * 0.5) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);

        // Rotate towards mouse slightly
        const mx = state.pointer.x * 0.5;
        const my = state.pointer.y * 0.5;
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, my, 0.05);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mx + t * 0.2, 0.05);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <torusKnotGeometry args={[1, 0.35, 200, 32]} />
                <MeshTransmissionMaterial
                    backside={true}
                    thickness={3.5}
                    roughness={0.05}     // Tiny bit of roughness for realism
                    transmission={1}
                    ior={1.6}            // Higher index (Crystal)
                    chromaticAberration={0.2}
                    anisotropicBlur={0.3}
                    distortion={0.6}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#ffffff"
                />
            </mesh>
        </Float>
    );
};

// ─── FOREGROUND DUST ─────────────────────────────────────────────────────────

const Dust: React.FC = () => {
    const count = 120;
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => Array.from({ length: count }, () => ({
        pos: new THREE.Vector3((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 25, Math.random() * 15 - 5),
        vel: new THREE.Vector3(0, Math.random() * 0.02, 0)
    })), []);

    useFrame((state) => {
        const mx = state.pointer.x * 5; // Mouse X force

        particles.forEach((p, i) => {
            p.pos.y += p.vel.y;
            // Horizontal drift based on mouse
            p.pos.x += (mx - p.pos.x) * 0.001;

            if (p.pos.y > 12) p.pos.y = -12;
            dummy.position.copy(p.pos);
            const scale = (Math.sin(state.clock.elapsedTime * 2 + i) + 2) * 0.02; // Twinkle faster
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#aaddff" transparent opacity={0.6} />
        </instancedMesh>
    );
};

// ─── POST PROCESSING ─────────────────────────────────────────────────────────

const Effects: React.FC = () => {
    const { gl, scene, camera, size } = useThree();
    const composer = useRef<EffectComposer>();

    useEffect(() => {
        composer.current = new EffectComposer(gl);
        composer.current.addPass(new RenderPass(scene, camera));

        // TUNED BLOOM - Reduced Intensity & Threshold adjustments
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height),
            0.15, // intensity (Was 0.4, -> 0.15 much softer)
            0.6,  // radius
            0.85  // threshold (Only very bright sparks glow)
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

// ─── SCENE ASSEMBLY ──────────────────────────────────────────────────────────

const Scene: React.FC = () => {
    return (
        <>
            <Environment preset="city" />

            <GradientBackground />
            <CenterCrystal />
            <FloatingShards />
            <Dust />

            {/* Rim lights to catch the crystal edges independently of Env */}
            <spotLight position={[15, 15, 10]} angle={0.3} penumbra={1} intensity={300} color="#aaddff" />
            <spotLight position={[-15, -10, 10]} angle={0.3} penumbra={1} intensity={200} color="#aa00ff" />

            <Effects />
        </>
    );
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

const HeroCrystalVoid: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#000000]">
            <Canvas
                shadows
                camera={{ position: [0, 0, 8], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true,
                    alpha: false
                }}
            >
                <Scene />
            </Canvas>

            {/* High-quality overlay vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>
    );
};

export default HeroCrystalVoid;
