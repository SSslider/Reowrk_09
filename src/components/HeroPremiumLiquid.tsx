/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

extend({ EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, OutputPass });

// ─── SHADER INJECTIONS FOR MESHPHYSICALMATERIAL ──────────────────────────────

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

// FBM function for more complex detail
float fbm(vec3 x) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3(100);
	for (int i = 0; i < 4; ++i) {
		v += a * cnoise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const LiquidSurface = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const customUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (customUniforms.uTime) {
      customUniforms.uTime.value = state.clock.getElapsedTime();
    }

    // Smooth mouse follow for interaction
    customUniforms.uMouse.value.x = THREE.MathUtils.lerp(customUniforms.uMouse.value.x, state.pointer.x, 0.05);
    customUniforms.uMouse.value.y = THREE.MathUtils.lerp(customUniforms.uMouse.value.y, state.pointer.y, 0.05);
  });

  const onBeforeCompile = (shader: any) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uMouse = customUniforms.uMouse;

    // Inject varyings, uniforms, and helper functions into vertex shader safely
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform float uTime;
      uniform vec2 uMouse;
      varying float vElevation;
      ${noiseFunctions}
      
      float getElevation(vec3 p, float time, vec2 mouse) {
        float el = cnoise(vec3(p.x * 0.1, p.y * 0.1, time * 0.15)) * 1.5;
        el += fbm(vec3(p.x * 0.3 - time * 0.2, p.y * 0.3 + time * 0.1, time * 0.1)) * 0.5;
        float d = distance(vec2(p.x * 0.1, p.y * 0.1), mouse * vec2(2.5, 1.5));
        el += smoothstep(1.5, 0.0, d) * -1.2;
        return el;
      }
      `
    );

    // Hook into vertex displacement
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float elevation = getElevation(position, uTime, uMouse);
      transformed.z += elevation;
      vElevation = elevation;
      `
    );

    // Recalculate normals for the lighting to look correct on the displaced surface
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `
      #include <beginnormal_vertex>
      
      float offset = 0.1;
      vec3 px = position + vec3(offset, 0.0, 0.0);
      vec3 py = position + vec3(0.0, offset, 0.0);

      float h0 = getElevation(position, uTime, uMouse);
      float hx = getElevation(px, uTime, uMouse);
      float hy = getElevation(py, uTime, uMouse);

      // Compute new normal via cross product
      vec3 tangentX = normalize(vec3(offset, 0.0, hx - h0));
      vec3 tangentY = normalize(vec3(0.0, offset, hy - h0));
      
      objectNormal = normalize(cross(tangentX, tangentY));
      `
    );

    // Pass elevation to fragment for subtle color variation SAFELY
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying float vElevation;
      `
    );

    // Optionally mix in some color based on elevation
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.1, 0.2, 0.5), smoothstep(0.0, 2.0, vElevation) * 0.5);
      `
    );
  };

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -5, -15]} scale={[1.8, 1.8, 1.8]}>
      {/* High-density plane for smooth vertex displacement */}
      <planeGeometry args={[40, 30, 256, 256]} />
      <meshPhysicalMaterial
        ref={materialRef}
        color="#050508" // Deep obsidian
        emissive="#020205" // Very faint base glow to prevent pure black holes
        roughness={0.15} // Very reflective but slightly blurred
        metalness={0.9} // Highly metallic
        clearcoat={1.0} // Thick clearcoat for that wet car paint look
        clearcoatRoughness={0.1}
        reflectivity={1.0}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  );
};

// ─── POST PROCESSING ─────────────────────────────────────────────────────────

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 0.5 },
    darkness: { value: 1.5 }
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
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      gl_FragColor = vec4(mix(texel.rgb, vec3(1.0 - darkness), dot(uv, uv)), texel.a);
    }
  `
};

const Effects = () => {
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

    // Premium glowing bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.5, // intensity
      0.8, // radius
      0.15 // threshold
    );
    comp.addPass(bloomPass);

    // Custom Vignette
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms['offset'].value = 0.6;
    vignettePass.uniforms['darkness'].value = 1.6;
    comp.addPass(vignettePass);

    const outputPass = new OutputPass();
    comp.addPass(outputPass);

    composer.current = comp;

    return () => {
      comp.dispose();
      renderTarget.dispose();
    };
  }, [gl, scene, camera, size]);

  useFrame(() => {
    if (composer.current) {
      composer.current.render();
    }
  }, 1);

  return null;
};

// ─── SCENE SETUP ─────────────────────────────────────────────────────────────

const Scene = () => {
  return (
    <>
      <color attach="background" args={['#020204']} />
      <fog attach="fog" args={['#020204', 15, 45]} />

      {/* Cinematic Lighting Setup */}
      <ambientLight intensity={0.1} color="#ffffff" />

      {/* Key Light: Bright cyan/blue from top right to catch the peaks */}
      <pointLight position={[15, 20, -10]} intensity={400} color="#00e5ff" distance={50} decay={2} />

      {/* Fill Light: Deep purple from bottom left to fill the valleys */}
      <spotLight position={[-15, -10, -5]} intensity={800} color="#651fff" angle={Math.PI / 3} penumbra={1} distance={50} decay={2} />

      {/* Rim Light: Sharp white from back to create a silhouette line on the waves */}
      <spotLight position={[0, 10, -30]} intensity={1000} color="#ffffff" angle={Math.PI / 4} penumbra={0.5} distance={60} decay={2} />

      <LiquidSurface />
      <Effects />
    </>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const HeroPremiumLiquid: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas
        camera={{ position: [0, 5, 12], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          depth: true,
          stencil: false,
        }}
      >
        <Scene />
      </Canvas>

      {/* Vignette Overlays directly in HTML for better blending with UI */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] mix-blend-multiply" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroPremiumLiquid;
