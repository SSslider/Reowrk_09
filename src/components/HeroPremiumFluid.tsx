/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── SHADER ──────────────────────────────────────────────────────────────────

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  
  varying vec2 vUv;

  // ─── NOISE FUNCTIONS ───────────────────────────────────────────────────────
  
  float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Value Noise
  float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Cubic Hermite Curve
    f = f * f * (3.0 - 2.0 * f);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian Motion
  float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    // Loop of octaves
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
  }

  // ─── MAIN ──────────────────────────────────────────────────────────────────

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.x *= uResolution.x / uResolution.y; // Aspect correction
    
    vec3 color = vec3(0.0);
    
    // ─── DOMAIN WARPING ──────────────────────────────────────────────────────
    // The core of the "liquid/smoke" look is recursively applying FBM to coordinates
    
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.00 * uTime);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime );
    r.y = fbm( st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

    float f = fbm(st + r);

    // ─── COLOR PALETTE ───────────────────────────────────────────────────────
    // Mixing deep, rich, dark colors based on the noise value 'f'
    // Deep Black/Blue base -> Midnight Blue -> Subtle Violet -> Highlights

    // Base dark
    vec3 c1 = vec3(0.02, 0.02, 0.05); 
    // Deep Midnight Blue
    vec3 c2 = vec3(0.05, 0.08, 0.20); 
    // Royal Violet/Blue Accent
    vec3 c3 = vec3(0.15, 0.10, 0.35); 
    // Highlight (Silky sheen)
    vec3 c4 = vec3(0.30, 0.40, 0.60); 

    // Mix based on the warped noise value magnitude and length
    color = mix(c1, c2, clamp((f*f)*4.0, 0.0, 1.0));
    color = mix(color, c3, clamp(length(q), 0.0, 1.0));
    color = mix(color, c4, clamp(length(r.x), 0.0, 1.0));

    // ─── MOUSE INTERACTION ───────────────────────────────────────────────────
    // Subtle brightening/disturbance near mouse
    // Normalize mouse to 0-1
    /* 
       Note: uMouse in ThreeJS usually -1 to 1 or pixel coords. 
       Standardizing to UV space in JS before sending or handle here.
       Let's assume normalized 0-1 for simplicity or fix in JS. 
    */
    
    // Add a final very subtle grain to prevent banding
    color += (random(st * uTime) - 0.5) * 0.02;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const FluidPlane: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.ShaderMaterial>(null!);
    const { size, viewport } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uResolution: { value: new THREE.Vector2(size.width, size.height) }, // Pixel size
        }),
        [size]
    );

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

            // Update resolution if resized
            materialRef.current.uniforms.uResolution.value.set(
                state.size.width * state.viewport.dpr,
                state.size.height * state.viewport.dpr
            );

            // Mouse influence
            // Converting pointer (-1 to 1) to whatever the shader likes, 
            // or just passing it raw. Using raw pointer here.
            const p = state.pointer;
            // Smooth lerp for mouse (optional, can do in shader too)
            materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uMouse.value.x, p.x, 0.05
            );
            materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uMouse.value.y, p.y, 0.05
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

const HeroPremiumFluid: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#020204]">
            <Canvas
                camera={{ position: [0, 0, 1], fov: 75 }}
                dpr={[1, 2]}
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    // No tone mapping needed for pure abstract shader usually, 
                    // but keeps colors consistent if we add mixed lights later.
                    toneMapping: THREE.NoToneMapping
                }}
            >
                <FluidPlane />
            </Canvas>

            {/* 
        Optional: Geometric Overlay / Vignette 
        To ground it and make it feel more "Ui" and less "Screensaver"
      */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)'
                }}
            />
        </div>
    );
};

export default HeroPremiumFluid;
