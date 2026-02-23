/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment, Float, Stars } from '@react-three/drei';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// ─── CUSTOM SHADERS FOR POST ──────────────────────────────────────────────────

const ChromaticAberrationShader = {
    uniforms: {
        tDiffuse: { value: null },
        uOffset: { value: new THREE.Vector2(0.002, 0.002) }, // Subtle shift
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uOffset;
    varying vec2 vUv;

    void main() {
      vec4 cr = texture2D(tDiffuse, vUv + uOffset);
      vec4 cga = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - uOffset);
      gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
    }
  `,
};

// ─── LIQUID OBSIDIAN MATERIAL (ENHANCED) ──────────────────────────────────────

const LiquidMaterial: React.FC = () => {
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!);

    const onBeforeCompile = (shader: THREE.Shader) => {
        shader.uniforms.uTime = { value: 0 };
        shader.uniforms.uMouse = { value: new THREE.Vector2(0, 0) };

        materialRef.current.userData.shader = shader;

        shader.vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      
      // Simplex Noise (Lightweight)
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.853734720958314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      ${shader.vertexShader}
    `;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
        #include <begin_vertex>
        
        // Accelerated, deeper waves
        float t = uTime * 0.4; // MUCH faster
        
        // Large rolling swells
        float wave1 = snoise(uv * 0.6 + vec2(t * 0.2, t * 0.1));
        
        // Secondary chop
        float wave2 = snoise(uv * 1.8 - vec2(t * 0.5, t * 0.3));
        
        // Micro detail
        float wave3 = snoise(uv * 4.0 + t * 0.8);

        // Combined displacement
        float totalDisp = (wave1 * 2.2) + (wave2 * 0.6) + (wave3 * 0.15);
        
        // Mouse Ripple (Push)
        // float mouseDist = distance(uv * 10.0, uMouse * 10.0 + 5.0); // Rough mapping
        // float mousePush = smoothstep(3.0, 0.0, mouseDist) * 2.0 * sin(uTime * 5.0);
        
        transformed.z += totalDisp;
      `
        );
    };

    useFrame((state) => {
        if (materialRef.current && materialRef.current.userData.shader) {
            materialRef.current.userData.shader.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <meshPhysicalMaterial
            ref={materialRef}
            color="#000000"      // Pure Void
            emissive="#000508"   // Very subtle deep blue glow
            emissiveIntensity={0.2}
            roughness={0.12}
            metalness={1.0}      // Full chrome/mirror
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            iridescence={0.3}    // Oil slick effect
            iridescenceIOR={1.5}
            envMapIntensity={2.5} // High reflection intensity
            onBeforeCompile={onBeforeCompile}
        />
    );
};

// ─── SCENE CONTENT ───────────────────────────────────────────────────────────

const LiquidWall: React.FC = () => {
    return (
        <mesh rotation={[-Math.PI / 6, 0, 0]} position={[0, -2, -6]}>
            {/* Extended geometry to fill peripheral vision */}
            <planeGeometry args={[45, 30, 256, 256]} />
            <LiquidMaterial />
        </mesh>
    );
};

// ─── SMOKE LAYER ─────────────────────────────────────────────────────────────
// Procedural smoke using billboarding planes
const SmokeLayer: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const count = 15;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Shader for smoke
    const smokeMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color('#1a2a4a') } // Deep blue smoke
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
                uniform vec3 uColor;
                varying vec2 vUv;
                
                // Simple noise
                float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
                float noise(vec2 p) {
                    vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
                    return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
                }
                float fbm(vec2 p) {
                    float v = 0.0; float a = 0.5;
                    for(int i=0; i<4; i++) { v += a*noise(p); p*=2.0; a*=0.5; }
                    return v;
                }
                
                void main() {
                    // Moving smoke
                    vec2 uv = vUv;
                    float n = fbm(uv * 3.0 - vec2(0.0, uTime * 0.15));
                    
                    // Radial mask (soft edges)
                    float d = distance(uv, vec2(0.5));
                    float mask = smoothstep(0.5, 0.0, d);
                    
                    float alpha = n * mask * 0.4; // 40% max opacity
                    gl_FragColor = vec4(uColor, alpha);
                }
            `
        });
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        smokeMaterial.uniforms.uTime.value = t;

        // Slowly drift the planes
        for (let i = 0; i < count; i++) {
            const z = 2 + Math.sin(i * 1.1 + t * 0.1) * 2; // Oscillate depth
            const x = Math.sin(i * 0.5 + t * 0.05) * 8;
            dummy.position.set(x, -5 + i * 0.5, z);
            dummy.scale.set(12, 12, 1);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0, 0, 0]}>
            <planeGeometry />
            <primitive object={smokeMaterial} attach="material" />
        </instancedMesh>
    );
};

// ─── INTERACTIVE EMBERS ──────────────────────────────────────────────────────

const FloatingEmbers: React.FC = () => {
    const count = 80;
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Store particle data: velocity, position
    const particles = useMemo(() => Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            Math.random() * 10
        ),
        vel: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.05 + 0.01, // Always up
            0
        ),
        scale: Math.random() * 0.08 + 0.02,
        phase: Math.random() * Math.PI * 2
    })), []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const mouse = new THREE.Vector3(
            (state.pointer.x * state.viewport.width) / 2,
            (state.pointer.y * state.viewport.height) / 2,
            0
        );

        particles.forEach((p, i) => {
            // Apply Velocity
            p.pos.add(p.vel);

            // Mouse Repulsion
            const dist = p.pos.distanceTo(mouse);
            if (dist < 4.0) {
                const dir = p.pos.clone().sub(mouse).normalize();
                p.pos.add(dir.multiplyScalar(0.1)); // Push
            }

            // Loop Bounds
            if (p.pos.y > 10) p.pos.y = -10;

            // Wiggle
            const wiggle = Math.sin(t + p.phase) * 0.02;

            dummy.position.copy(p.pos);
            dummy.position.x += wiggle;
            dummy.rotation.set(t * 0.5, t * 0.3, 0);

            // Pulsate size
            const s = p.scale * (1 + Math.sin(t * 3.0 + p.phase) * 0.3);
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
                color="#b8e0ff"
                emissive="#4488ff"
                emissiveIntensity={2}
                toneMapped={false}
            />
        </instancedMesh>
    );
};


const Scene: React.FC = () => {
    return (
        <>
            <Environment preset="city" />
            <ambientLight intensity={0.1} />

            {/* Dynamic Moving Lights */}
            <MovingLights />

            <LiquidWall />
            <SmokeLayer />
            <FloatingEmbers />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <Effects />
        </>
    );
};

const MovingLights: React.FC = () => {
    const ref1 = useRef<THREE.SpotLight>(null!);
    const ref2 = useRef<THREE.SpotLight>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (ref1.current) {
            ref1.current.position.x = Math.sin(t * 0.5) * 20;
            ref1.current.position.z = Math.cos(t * 0.5) * 10 + 10;
        }
        if (ref2.current) {
            ref2.current.position.x = Math.sin(t * 0.3 + 2.0) * -20;
        }
    });

    return (
        <>
            <spotLight ref={ref1} position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={800} color="#aaddff" />
            <spotLight ref={ref2} position={[-10, 0, 10]} angle={0.6} penumbra={1} intensity={600} color="#5500ff" />
        </>
    );
};

const Effects: React.FC = () => {
    const { gl, scene, camera, size } = useThree();
    const composer = useRef<EffectComposer>();

    useEffect(() => {
        composer.current = new EffectComposer(gl);
        composer.current.addPass(new RenderPass(scene, camera));

        // Bloom - High threshold so only the "glints" on the obsidian glow
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height),
            0.5,  // Intensity (lower, subtle)
            0.8,  // Radius (broad)
            0.6   // Threshold (high - only reflections glow)
        );
        composer.current.addPass(bloomPass);

        // Chromatic Aberration - The "Lens" feel
        const chromaticAb = new ShaderPass(ChromaticAberrationShader);
        composer.current.addPass(chromaticAb);

        const outputPass = new OutputPass();
        composer.current.addPass(outputPass);

        return () => composer.current?.dispose();
    }, [gl, scene, camera, size]);

    useFrame(() => {
        composer.current?.render();
    }, 1);

    return null;
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

const HeroCinematic: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#020202]">
            <Canvas
                shadows
                camera={{ position: [0, 0, 6], fov: 40 }} // Cinematic FOV (approx 50mm lens)
                dpr={[1, 1.5]} // Optimize for performance
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    preserveDrawingBuffer: true
                }}
            >
                <Scene />
            </Canvas>

            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] opacity-80" />
        </div>
    );
};

export default HeroCinematic;
