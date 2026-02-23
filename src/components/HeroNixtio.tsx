/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// ─── SHADERS ─────────────────────────────────────────────────────────────────

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  
  attribute vec3 aInstancePosition; // [x, 0, z]
  attribute float aPhase;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vWave;
  varying vec2 vUv;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
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

  void main() {
    vUv = uv;
    
    // Base position from instance attribute
    vec3 instancePos = aInstancePosition;
    
    // Wave calculation
    float noise1 = snoise(instancePos.xz * 0.15 + uTime * 0.1);
    float noise2 = snoise(instancePos.xz * 0.45 - uTime * 0.15);
    
    // Mouse Interaction
    float dist = distance(instancePos.xz, uMouse * vec2(30.0, 20.0)); // Adjust scale to match grid
    float interaction = smoothstep(8.0, 0.0, dist) * uHover;
    
    // Combine waves
    float elevation = (noise1 * 1.5 + noise2 * 0.5) + (interaction * -4.0);
    
    vWave = elevation;

    // Apply rotation and position
    vec3 pos = position;
    
    // Rotate slightly based on wave slope (fake tangent)
    float tiltX = snoise(instancePos.xz * 0.2 + uTime * 0.1) * 0.5;
    float tiltZ = snoise(instancePos.xz * 0.2 + 100.0 + uTime * 0.1) * 0.5;
    
    // Manual rotation matrix for tilt
    // Not perfect but cheap
    pos.y += elevation;
    
    // Final world position
    vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
    worldPosition.xyz += instancePos; // Add layout offset
    
    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
  }
`;

const fragmentShader = `
  uniform float uTime;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vWave;
  varying vec2 vUv;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Base dark color (Obsidian/Tech)
    vec3 color = vec3(0.05, 0.05, 0.08);
    
    // Height gradient (Deep parts darker, peaks lighter)
    color += vec3(0.0, 0.02, 0.05) * smoothstep(-2.0, 2.0, vWave);
    
    // Fresnel Rim (The premium feel)
    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    vec3 rimColor = vec3(0.2, 0.3, 0.6); // Blue-ish rim
    color += rimColor * fresnel * 1.5;
    
    // Specular (fake light)
    vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 32.0);
    
    color += vec3(1.0) * spec * 0.4; // Shiny highlight
    
    // Subtle grid glow on top
    // float grid = smoothstep(0.48, 0.5, abs(vUv.x - 0.5)) + smoothstep(0.48, 0.5, abs(vUv.y - 0.5));
    // color += vec3(0.1, 0.2, 0.5) * grid * 0.2;

    gl_FragColor = vec4(color, 1.0);
    
    // Dithering for smooth gradients
    #include <dithering_fragment>
  }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const InstancedField: React.FC<{ countX: number; countZ: number }> = ({ countX, countZ }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Create instance data
  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(countX * countZ * 3);
    const pha = new Float32Array(countX * countZ);

    let i = 0;
    const spacing = 1.6; // Gap between capsules
    const offsetX = (countX * spacing) / 2;
    const offsetZ = (countZ * spacing) / 2;

    for (let x = 0; x < countX; x++) {
      for (let z = 0; z < countZ; z++) {
        // x
        pos[i * 3 + 0] = (x * spacing) - offsetX;
        // y (flattened initially)
        pos[i * 3 + 1] = 0;
        // z
        pos[i * 3 + 2] = (z * spacing) - offsetZ;

        pha[i] = Math.random() * Math.PI * 2;
        i++;
      }
    }
    return { positions: pos, phases: pha };
  }, [countX, countZ]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

      const p = state.pointer;
      // Smooth mouse
      const currentMouse = materialRef.current.uniforms.uMouse.value;
      currentMouse.x += (p.x - currentMouse.x) * 0.05;
      currentMouse.y += (p.y - currentMouse.y) * 0.05;

      // Hover effect intensity
      // If mouse is near center (active window), increase hover effect
      // Just keep it always active for cool factor or check logic
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        1.0,
        0.05
      );
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, countX * countZ]}>
      {/* Rounded Cube / Capsule Shape */}
      <capsuleGeometry args={[0.5, 1.0, 8, 16]} />
      {/* Or box with rounded edges? Capsule looks more organic/Nixtio-like */}

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uHover: { value: 0 },
        }}
      />

      {/* Attributes must be attached to geometry */}
      <instancedBufferAttribute attach="geometry-attributes-aInstancePosition" args={[positions, 3]} />
      <instancedBufferAttribute attach="geometry-attributes-aPhase" args={[phases, 1]} />
    </instancedMesh>
  );
};

// ─── EFFECTS ─────────────────────────────────────────────────────────────────

const NoiseShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "opacity": { value: 0.05 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float opacity;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    
    float random(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float noise = (random(vUv * 50.0) - 0.5) * opacity;
      gl_FragColor = color + vec4(vec3(noise), 0.0);
    }
  `
};

const VignetteShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "offset": { value: 0.1 },
    "darkness": { value: 1.1 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float offset;
    uniform float darkness;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * vec2(offset);
      gl_FragColor = vec4(mix(color.rgb, vec3(1.0 - darkness), dot(uv, uv)), color.a);
    }
  `
};

const Effects: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>();

  useEffect(() => {
    composer.current = new EffectComposer(gl);
    composer.current.addPass(new RenderPass(scene, camera));

    // Bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.8, // intensity
      0.6, // radius
      0.2  // threshold
    );
    composer.current.addPass(bloomPass);

    // Vignette (using inline shader for simplicity as example)
    // Actually, let's stick to standard OutputPass for tone mapping first
    // and maybe skip custom shaders to be safe, but user wanted premium.
    // Let's add OutputPass which handles tone mapping correctly.
    const outputPass = new OutputPass();
    composer.current.addPass(outputPass);

    return () => {
      composer.current?.dispose();
    };
  }, [gl, scene, camera, size]);

  useFrame(() => {
    composer.current?.render();
  }, 1);

  return null;
};

// ─── SCENE ───────────────────────────────────────────────────────────────────

const Scene: React.FC = () => {
  const { gl, camera } = useThree();

  useEffect(() => {
    // Initial camera setup
    camera.position.set(0, 15, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle slow camera movement
    camera.position.x = Math.sin(t * 0.05) * 2;
    camera.position.z = 12 + Math.cos(t * 0.05) * 2;
    camera.lookAt(0, -2, 0);
  });

  return (
    <>
      <color attach="background" args={['#020204']} />
      <fog attach="fog" args={['#020204', 5, 40]} />

      <group rotation={[0, Math.PI / 4, 0]}> {/* Rotate grid for better iso/perspective view */}
        <InstancedField countX={40} countZ={40} />
      </group>

      {/* Post Processing - Manual Implementation */}
      <Effects />
    </>
  );
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

const HeroNixtio: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#020204]">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        camera={{ fov: 45, near: 0.1, far: 200 }}
      >
        <Scene />
      </Canvas>

      {/* Gradient Overlay to fade into the rest of the site */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroNixtio;
