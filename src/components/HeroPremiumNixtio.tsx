/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass });

// --- SHADERS ---
// This shader computes a continuous, silk/liquid-like undulating surface.
// We calculate analytical normals in the fragment shader or pass them from vertex
// to create stunning, glassy specular highlights.

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vElevation;
  
  // High-quality noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ; m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.853734720958314 * ( a0*a0 + h*h );
    vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Calculate sharp, cresting elevation
  float getElevation(vec2 p) {
    // Slower, more majestic waves
    float e = snoise(p * 0.05 + uTime * 0.05) * 2.0;
    e += snoise(p * 0.1 - uTime * 0.08) * 0.8;
    
    // Add sharp crests by taking absolute value of high frequency noise
    e -= abs(snoise(p * 0.2 + uTime * 0.1)) * 0.5;

    // Mouse dip (repulsion)
    float mouseDist = distance(p, uMouse * 1.5); // Tune mouse radius scale
    float mouseInfluence = smoothstep(10.0, 0.0, mouseDist);
    e -= mouseInfluence * 4.0;
    return e;
  }

  void main() {
    vec3 pos = position;
    
    float el = getElevation(pos.xz);
    pos.y += el;
    vElevation = el;

    // Calculate analytical normal using very tight finite difference for sharp speculars
    float d = 0.05;
    vec3 p1 = vec3(position.x + d, 0.0, position.z);
    p1.y = getElevation(p1.xz);
    vec3 p2 = vec3(position.x, 0.0, position.z + d);
    p2.y = getElevation(p2.xz);
    
    vec3 t1 = normalize(p1 - pos);
    vec3 t2 = normalize(p2 - pos);
    vNormal = normalize(cross(t2, t1));
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vPosition = modelPosition.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uCameraPos;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vElevation;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(uCameraPos - vPosition);
    
    // Pure monochrome premium lighting (Silver/White on pitch black)
    vec3 light1Dir = normalize(vec3(1.0, 2.0, 0.5));
    vec3 light1Color = vec3(1.0, 1.0, 1.0); // Pure white key light
    
    vec3 light2Dir = normalize(vec3(-1.0, 0.5, -1.0));
    vec3 light2Color = vec3(0.4, 0.4, 0.5); // Cool silver fill light
    
    // Base surface color: Pure Black Obsidian
    vec3 baseColor = vec3(0.01, 0.01, 0.01);
    
    // Minimal diffuse to keep it looking shiny/metallic, not matte/cloudy
    float diff1 = max(dot(normal, light1Dir), 0.0);
    float diff2 = max(dot(normal, light2Dir), 0.0);
    vec3 diffuse = (diff1 * light1Color * 0.1) + (diff2 * light2Color * 0.05);
    
    // Extreme Specular (Glossy/Wet reflection)
    vec3 half1 = normalize(light1Dir + viewDir);
    float spec1 = pow(max(dot(normal, half1), 0.0), 256.0); // Very tight highlight
    
    vec3 half2 = normalize(light2Dir + viewDir);
    float spec2 = pow(max(dot(normal, half2), 0.0), 128.0);
    
    vec3 specular = (spec1 * light1Color * 2.5) + (spec2 * light2Color * 1.5);
    
    // Fresnel Rim (gives the shape volume in pitch darkness)
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
    vec3 rim = mix(vec3(0.0), vec3(0.8, 0.9, 1.0), fresnel) * 0.5;

    // Combine
    vec3 finalColor = baseColor + diffuse + specular + rim;
    
    // Distance fade to pure black
    float dist = length(vPosition.xz);
    float fade = smoothstep(50.0, 15.0, dist);
    
    gl_FragColor = vec4(finalColor * fade, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// --- COMPONENT ---

const LiquidSurface: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.uCameraPos.value = state.camera.position;

    const p = state.pointer;
    const targetX = p.x * 25;
    const targetZ = -p.y * 25;

    const currentMouse = materialRef.current.uniforms.uMouse.value as THREE.Vector2;
    currentMouse.x += (targetX - currentMouse.x) * 0.05;
    currentMouse.y += (targetZ - currentMouse.y) * 0.05;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
      {/* High res plane for smooth curves */}
      <planeGeometry args={[100, 100, 250, 250]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uCameraPos: { value: new THREE.Vector3() }
        }}
        wireframe={false}
      />
    </mesh>
  );
};

// --- POST PROCESSING ---

const CustomEffects: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer | null>(null);

  useEffect(() => {
    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      samples: 4 // MSAA for polished edges
    });

    const comp = new EffectComposer(gl, renderTarget);
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // Highly restrained, premium bloom. Not blinding.
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.35, // intensity (Tuned down drastically from 1.5)
      1.0, // radius
      0.3  // threshold (Only brightest specular hits bloom)
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

// --- SCENE SETUP ---

const Scene: React.FC = () => {
  useFrame(({ camera, clock }) => {
    // Cinematic, extremely slow breathing drift
    const t = clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.05) * 2;
    camera.position.z = 18 + Math.cos(t * 0.05) * 1.5;
    camera.lookAt(0, -3, 0);
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 10, 35]} />

      <LiquidSurface />
      <CustomEffects />
    </>
  );
};

export default function HeroPremiumNixtio() {
  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 6, 18], fov: 45, near: 0.1, far: 100 }}
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          depth: true,
          alpha: false,
        }}
      >
        <Scene />
      </Canvas>
      {/* Vignette Overlays for deep gradient blending into the page */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#010103] via-[#010103]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#010103]/90 to-transparent pointer-events-none" />
    </div>
  );
}
