/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

// ─── SHADERS ─────────────────────────────────────────────────────────────────

const noiseFunctions = `
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.853734720958314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

// The core concept: "Abyssal Threads"
// A massive flow field of thousands of glowing, translucent threads 
// moving through a hypnotic 3D curl noise field, evoking prestige and intelligence.
const FlowFieldParticles: React.FC<{ count: number }> = ({ count }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, randoms, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spawn in a massive volume
      pos[i * 3 + 0] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;

      rand[i] = Math.random();
      // Most particles are extremely fine dust, some are slightly larger structural nodes
      sz[i] = Math.pow(Math.random(), 3.0) * 3.0 + 0.5; // Exponential scale for variance
    }
    return { positions: pos, randoms: rand, sizes: sz };
  }, [count]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();

    // Mouse flow interaction
    const p = state.pointer;
    const tMouse = mat.uniforms.uMouse.value as THREE.Vector2;
    // Massive projection scale for the profound depth, moderately lowered lerp factor for elegant tracking
    tMouse.x = THREE.MathUtils.lerp(tMouse.x, p.x * 20.0, 0.03);
    tMouse.y = THREE.MathUtils.lerp(tMouse.y, p.y * 20.0, 0.03);
  });

  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    
    attribute float aRandom;
    attribute float aSize;
    
    varying float vAlpha;
    varying vec3 vColor;
    varying float vDistanceToCenter;
    
    ${noiseFunctions}
    
    // Curl noise simulation for fluid-like movement
    vec3 curlNoise(vec3 p) {
      const float e = 0.1;
      vec3 dx = vec3(e   , 0.0 , 0.0);
      vec3 dy = vec3(0.0 , e   , 0.0);
      vec3 dz = vec3(0.0 , 0.0 , e  );
      
      vec3 p_x0 = vec3(cnoise(p - dx), cnoise(p - dx + 100.0), cnoise(p - dx + 200.0));
      vec3 p_x1 = vec3(cnoise(p + dx), cnoise(p + dx + 100.0), cnoise(p + dx + 200.0));
      vec3 p_y0 = vec3(cnoise(p - dy), cnoise(p - dy + 100.0), cnoise(p - dy + 200.0));
      vec3 p_y1 = vec3(cnoise(p + dy), cnoise(p + dy + 100.0), cnoise(p + dy + 200.0));
      vec3 p_z0 = vec3(cnoise(p - dz), cnoise(p - dz + 100.0), cnoise(p - dz + 200.0));
      vec3 p_z1 = vec3(cnoise(p + dz), cnoise(p + dz + 100.0), cnoise(p + dz + 200.0));
      
      float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
      float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
      float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
      
      return normalize(vec3(x, y, z) / (2.0 * e));
    }

    void main() {
      vec3 pos = position;
      
      // Infinite flowing simulation loop 
      // Move particles through space and reset them if they go too far
      float timeSlow = uTime * (0.05 + aRandom * 0.02);
      
      // Base drift
      pos.y += timeSlow * 10.0;
      pos.x += sin(timeSlow * 2.0 + aRandom * 10.0) * 5.0;
      
      // Wrap around logic to create endless volume
      pos.y = mod(pos.y + 40.0, 80.0) - 40.0;
      pos.x = mod(pos.x + 40.0, 80.0) - 40.0;
      pos.z = mod(pos.z + 40.0, 80.0) - 40.0;
      
      // Add complex curl noise displacement (The "Abyssal Thread" flow)
      vec3 noiseForce = curlNoise(pos * 0.08 + uTime * 0.03) * 8.0;
      pos += noiseForce;
      
      // Mouse Gravity / Repulsion Field
      float distToMouse = distance(pos.xy, uMouse);
      float mouseInfluence = smoothstep(15.0, 0.0, distToMouse);
      
      // Push particles away gracefully while spinning them (moderate multipliers for a subtle but noticeable parting effect)
      vec3 pushVector = normalize(vec3(pos.xy - uMouse, pos.z));
      vec3 tangent = cross(pushVector, vec3(0.0, 0.0, 1.0));
      pos += (pushVector * 2.5 + tangent * 1.2) * mouseInfluence;
      
      vDistanceToCenter = length(pos);
      
      // Core structure gets brighter
      float coreGlow = smoothstep(30.0, 0.0, vDistanceToCenter);
      
      vec4 mvPosition = viewMatrix * modelMatrix * vec4(pos, 1.0);
      
      // Dynamic Point Size based on camera distance to feel like depth of field
      gl_PointSize = aSize * (40.0 / -mvPosition.z);
      
      gl_Position = projectionMatrix * mvPosition;
      
      // Elegant styling
      // Fade out exactly at volume edges to prevent popping
      float edgeFade = smoothstep(40.0, 20.0, abs(pos.x)) * 
                       smoothstep(40.0, 20.0, abs(pos.y)) * 
                       smoothstep(40.0, 20.0, abs(pos.z));
                       
      // The "Liquid Obsidian" dark core with glowing cyan/white filaments
      vec3 darkBase = vec3(0.02, 0.05, 0.1); 
      vec3 brightFilament = vec3(0.0, 0.7, 1.0); // Cyan
      
      vColor = mix(darkBase, brightFilament, coreGlow * aRandom + mouseInfluence * 0.5);
      // Give some pure white hot cores
      if (aRandom > 0.95) {
        vColor = vec3(1.0, 0.95, 0.9);
      }
      
      vAlpha = edgeFade * (0.3 + aRandom * 0.7 + mouseInfluence);
    }
  `;

  const fragmentShader = `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
      // Create a soft glowing circle for the particle
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      
      // Soft radial gradient fade for a smoke-like / bokeh blend
      float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
      
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) }
        }}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending} // Additive blending for that ethereal glow
      />
    </points>
  );
};

// ─── POST PROCESSING ─────────────────────────────────────────────────────────

const Effects: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer | null>(null);

  useEffect(() => {
    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    });

    const comp = new EffectComposer(gl, renderTarget);

    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // Premium glowing highlights
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.8,  // Higher intensity for the ethereal threads
      0.9,  // Very wide spread
      0.1   // Low threshold so almost everything blooms slightly
    );
    comp.addPass(bloomPass);

    const outputPass = new OutputPass();
    comp.addPass(outputPass);

    composer.current = comp;

    return () => {
      comp.dispose();
      renderTarget.dispose();
    };
  }, [gl, scene, camera, size]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  return null;
};

// ─── SCENE SETUP ─────────────────────────────────────────────────────────────

const Scene: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Vast, cinematic slow drift through the infinite volume
    camera.position.x = Math.sin(t * 0.02) * 8;
    camera.position.y = Math.cos(t * 0.03) * 4;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={['#010101']} />

      {/* 40,000 particles is smooth for gl_Points and gives massive volume */}
      <FlowFieldParticles count={45000} />

      <Effects />
    </>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const HeroUltimate3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#010101]">
      <Canvas
        dpr={window.devicePixelRatio > 1 ? [1, 2] : 1} // Bump DPR back up since gl_Points are cheaper than MeshPhysicalMaterial
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: false // depth false for pure volumetric feel
        }}
        camera={{ fov: 45, near: 0.1, far: 200 }}
      >
        <Scene />
      </Canvas>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroUltimate3D;
