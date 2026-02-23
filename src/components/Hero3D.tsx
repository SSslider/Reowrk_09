/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ─── GLSL Simplex Noise (3D) ──────────────────────────────────────────────────
const NOISE_GLSL = /* glsl */`
vec3 mod289v(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute4(vec4 x){return mod289v4(((x*34.)+1.)*x);}
vec4 taylorInvSqrt4(vec4 r){return 1.79284291400159-0.853734720958314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v(i);
  vec4 p=permute4(permute4(permute4(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.)));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 yv=floor(j-7.*x_);
  vec4 xf=x_*ns.x+ns.yyyy;
  vec4 yf=yv*ns.x+ns.yyyy;
  vec4 h=1.-abs(xf)-abs(yf);
  vec4 b0=vec4(xf.xy,yf.xy);
  vec4 b1=vec4(xf.zw,yf.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt4(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// ─── Mouse-reactive bloom ─────────────────────────────────────────────────────
// Default: nearly invisible (strength ~0.12). Swells up when cursor is near.
const BloomComposer: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.12,  // start almost off
      0.5,
      0.80   // high threshold — only extreme highlights
    );
    bloomPassRef.current = bloom;
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    composerRef.current = composer;
    return () => { composer.dispose(); };
  }, [gl, scene, camera, size]);

  useFrame((state) => {
    const bloom = bloomPassRef.current;
    if (!bloom) return;
    // Mouse distance from center (0 = center, 1 = edge)
    const p = state.pointer;
    const dist = Math.sqrt(p.x * p.x + p.y * p.y);
    const isHovering = dist < 1.0;
    const targetStrength = isHovering ? THREE.MathUtils.lerp(0.65, 0.20, Math.min(dist, 1.0)) : 0.08;
    // Very slow bloom transition — lazy, cinematic
    bloom.strength = THREE.MathUtils.lerp(bloom.strength, targetStrength, 0.025);
    composerRef.current?.render();
  }, 1);

  return null;
};

// ─── Liquid Mercury Orb ───────────────────────────────────────────────────────
// Uses sum-of-sines + simplex for a coherent, flowing liquid surface.
// Normals are approximated via finite-difference for accurate Fresnel shading.
const LiquidOrb: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  // High-poly sphere gives smoother liquid surface than icosahedron
  const geo = useMemo(() => new THREE.SphereGeometry(2.5, 256, 256), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },  // NDC -1..1
    uHover: { value: 0.0 },                        // 0=idle, 1=hovered
    uCamPos: { value: new THREE.Vector3(0, 7, 18) },
  }), []);

  // ── Vertex: flowing liquid displacement with finite-diff normals ───────────
  const vertexShader = /* glsl */`
    ${NOISE_GLSL}
    uniform float uTime;
    uniform vec2  uMouse;
    uniform float uHover;

    varying vec3  vNormal;
    varying vec3  vWorldPos;
    varying float vFresnel;

    // Displacement function (called 3x for finite-diff normal)
    float liquidDisp(vec3 p, float t) {
      // Large slow swell — the "breathing"
      float d = snoise(p * 0.65 + vec3(t * 0.22, t * 0.15, t * 0.18)) * 0.55;
      // Mid-frequency flow
      d += snoise(p * 1.35 - vec3(t * 0.30, t * 0.25, t * 0.20)) * 0.24;
      // Micro-ripple detail
      d += snoise(p * 2.80 + vec3(t * 0.55, -t * 0.48, t * 0.40)) * 0.10;
      // Extra churn on hover
      d += snoise(p * 4.50 + vec3(-t * 0.80, t * 0.72, t * 0.65)) * uHover * 0.12;
      return d;
    }

    void main() {
      vec3 n = normalize(normal);
      float t = uTime;

      // Mouse influence — surface "pulls" toward cursor
      vec3 mouseDir = normalize(vec3(uMouse.x, uMouse.y, 1.0));
      float mPull = dot(n, mouseDir) * 0.5 + 0.5;
      float mEffect = mPull * uHover * 0.18;

      float disp = liquidDisp(n, t) + mEffect;

      // ─ Finite-difference normals ─
      float eps = 0.008;
      vec3 n1 = normalize(n + vec3(eps, 0.0, 0.0));
      vec3 n2 = normalize(n + vec3(0.0, eps, 0.0));
      vec3 n3 = normalize(n + vec3(0.0, 0.0, eps));
      float d1 = liquidDisp(n1, t);
      float d2 = liquidDisp(n2, t);
      float d3 = liquidDisp(n3, t);
      // tangent-space normal from gradient
      vec3 dispNormal = normalize(n - vec3(
        (d1 - disp) / eps,
        (d2 - disp) / eps,
        (d3 - disp) / eps
      ) * 0.9);

      vec3 displaced = position + n * disp * 2.8;
      vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
      vNormal   = normalize((normalMatrix * dispNormal).xyz);

      // Fresnel in vertex (approximate, cheap)
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vFresnel = pow(1.0 - max(0.0, dot(viewDir, vNormal)), 3.5);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `;

  // ── Fragment: dark mercury/obsidian with Fresnel rim and specular ─────────
  const fragmentShader = /* glsl */`
    uniform float uTime;
    uniform float uHover;
    uniform vec3  uCamPos;

    varying vec3  vNormal;
    varying vec3  vWorldPos;
    varying float vFresnel;

    void main() {
      // ─ Light directions ─
      vec3 L1 = normalize(vec3(0.5, 1.8, 1.2));   // key: cold blue-white
      vec3 L2 = normalize(vec3(-1.2, 0.6, -0.5));  // fill: blue
      vec3 N  = normalize(vNormal);
      vec3 V  = normalize(uCamPos - vWorldPos);

      // ─ Diffuse ─
      float diff1 = max(0.0, dot(N, L1));
      float diff2 = max(0.0, dot(N, L2)) * 0.3;

      // ─ Specular (Blinn-Phong) — mercury-like sharp highlight ─
      vec3 H1 = normalize(L1 + V);
      float spec1 = pow(max(0.0, dot(N, H1)), 120.0);  // very tight = liquid
      float spec2 = pow(max(0.0, dot(N, H1)), 30.0) * 0.18;

      // ─ Base colour: near-black with extremely subtle blue tint ─
      vec3 col = vec3(0.03, 0.033, 0.042);

      // ─ Diffuse shading layer ─
      col += vec3(0.06, 0.10, 0.18) * diff1;
      col += vec3(0.02, 0.04, 0.10) * diff2;

      // ─ Sharp specular highlight (the "liquid glint") ─
      col += vec3(0.60, 0.75, 1.00) * spec1 * 1.8;
      col += vec3(0.28, 0.40, 0.70) * spec2;

      // ─ Fresnel rim — brightens edges like a dark glass sphere ─
      vec3 rimCol = mix(vec3(0.08, 0.14, 0.42), vec3(0.45, 0.65, 1.0), vFresnel);
      col += rimCol * vFresnel * 0.85;

      // ─ Hover sheen: extra specular on interaction ─
      col += vec3(0.30, 0.55, 1.0) * spec1 * uHover * 1.2;

      // ─ Subtle animated shimmer (subsurface scatter feel) ─
      float shimmer = sin(uTime * 0.9 + vWorldPos.y * 2.1 + vWorldPos.x * 1.4) * 0.5 + 0.5;
      col += vec3(0.04, 0.09, 0.22) * shimmer * vFresnel * 0.4;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = state.pointer;
    const mat = matRef.current;

    mat.uniforms.uTime.value = t;

    // Smooth mouse tracking — slow, luxurious response
    const mu = mat.uniforms.uMouse.value as THREE.Vector2;
    mu.x = THREE.MathUtils.lerp(mu.x, p.x, 0.012);
    mu.y = THREE.MathUtils.lerp(mu.y, p.y, 0.012);

    // Hover state
    const dist = Math.sqrt(p.x * p.x + p.y * p.y);
    const hoverTarget = dist < 1.0 ? 1.0 : 0.0;
    mat.uniforms.uHover.value = THREE.MathUtils.lerp(mat.uniforms.uHover.value, hoverTarget, 0.022);

    // Camera pos for specular
    const cam = state.camera;
    (mat.uniforms.uCamPos.value as THREE.Vector3).copy(cam.position);

    // Very slow auto-rotation — liquid floating in space
    meshRef.current.rotation.y = t * 0.055;
    meshRef.current.rotation.x = Math.sin(t * 0.038) * 0.12;
  });

  return (
    <mesh ref={meshRef} geometry={geo} scale={scale}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// ─── Particle Nebula ─────────────────────────────────────────────────────────
const Particles: React.FC<{ count: number }> = ({ count }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const layer = Math.random();
      const r = layer < 0.3 ? 3.2 + Math.random() * 2.5
        : layer < 0.7 ? 6 + Math.random() * 8
          : 14 + Math.random() * 18;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * (0.35 + Math.random() * 0.65);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = layer < 0.3 ? 2.0 + Math.random() * 2.5 : 0.7 + Math.random() * 1.6;
    }
    return { positions, sizes };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), []);

  const vertexShader = /* glsl */`
    uniform float uTime;
    uniform vec2  uMouse;
    uniform float uPixelRatio;
    attribute float aSize;
    varying float vDist;
    void main() {
      vec3 pos = position;
      float ca = cos(uTime * 0.055), sa = sin(uTime * 0.055);
      float px = pos.x * ca - pos.z * sa;
      pos.z    = pos.x * sa + pos.z * ca;
      pos.x    = px;
      float r = length(pos);
      pos *= 1.0 + sin(uTime * 0.30 + r * 0.10) * 0.028;
      vec3 toMouse = pos - vec3(uMouse.x * 14.0, uMouse.y * 9.0, 0.0);
      float dm = length(toMouse);
      if (dm > 0.001) pos += normalize(toMouse) * smoothstep(6.5, 0.0, dm) * 0.6;
      vDist = clamp(1.0 - r / 36.0, 0.0, 1.0);
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * uPixelRatio * (210.0 / -mv.z);
      gl_Position  = projectionMatrix * mv;
    }
  `;

  const fragmentShader = /* glsl */`
    varying float vDist;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float alpha = pow(1.0 - smoothstep(0.0, 0.5, d), 1.8);
      vec3 col = mix(vec3(0.16, 0.20, 0.65), vec3(0.65, 0.80, 1.0),
                     pow(max(0.0, 1.0 - d * 2.0), 2.0));
      float fade = mix(0.18, 1.0, vDist);
      gl_FragColor = vec4(col * fade, alpha * fade * 0.85);
    }
  `;

  useFrame((state) => {
    matRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    const p = state.pointer;
    const mu = matRef.current.uniforms.uMouse.value as THREE.Vector2;
    mu.x = THREE.MathUtils.lerp(mu.x, p.x, 0.010);
    mu.y = THREE.MathUtils.lerp(mu.y, p.y, 0.010);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
      />
    </points>
  );
};

// ─── Blueprint Grid Rings ─────────────────────────────────────────────────────
const GridRings: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let r = 0; r < 3; r++) {
      const radius = 5.5 + r * 4.5;
      for (let i = 0; i < 128; i++) {
        const a1 = (i / 128) * Math.PI * 2, a2 = ((i + 1) / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a1) * radius, 0, Math.sin(a1) * radius));
        pts.push(new THREE.Vector3(Math.cos(a2) * radius, 0, Math.sin(a2) * radius));
      }
    }
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      pts.push(new THREE.Vector3(0, 0, 0));
      pts.push(new THREE.Vector3(Math.cos(a) * 19, 0, Math.sin(a) * 19));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.018;
    groupRef.current.rotation.x = 1.15 + Math.sin(t * 0.07) * 0.025;
    groupRef.current.position.y = -2.0 + Math.sin(t * 0.13) * 0.25;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#0e1a48" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
    </group>
  );
};

// ─── Accent Orbs ─────────────────────────────────────────────────────────────
const AccentOrbs: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const data = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * Math.PI * 2,
    radius: 5.4 + Math.random() * 2.0,
    height: (Math.random() - 0.5) * 3.5,
    speed: 0.16 + Math.random() * 0.14,
    size: (0.07 + Math.random() * 0.12) * scale,
    phase: Math.random() * Math.PI * 2,
    blue: i % 2 === 0,
  })), [scale]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const a = d.angle + t * d.speed;
      child.position.set(
        Math.cos(a) * d.radius,
        d.height + Math.sin(t * 0.38 + d.phase) * 0.5,
        Math.sin(a) * d.radius
      );
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <mesh key={i}>
          <sphereGeometry args={[d.size, 10, 10]} />
          <meshStandardMaterial
            color={d.blue ? '#3a6aff' : '#ffffff'}
            emissive={d.blue ? '#2a50cc' : '#7090dd'}
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Cinematic Camera ─────────────────────────────────────────────────────────
const CameraRig: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { camera } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = isMobile ? 65 : 52;
    cam.updateProjectionMatrix();
  }, [camera, isMobile]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime(), p = state.pointer;
    // Much slower mouse influence — feels cinematic and deliberate
    const targetMouseX = isMobile ? 0 : p.x * 1.6;
    const targetMouseY = isMobile ? 0 : p.y * 1.0;
    const R = isMobile ? 13 : 15;
    camera.position.lerp(new THREE.Vector3(
      R * Math.sin(t * 0.030) + targetMouseX,
      (isMobile ? 4 : 5.2) + Math.sin(t * 0.022) * 0.8 + targetMouseY,
      R * Math.cos(t * 0.030) * 0.50 + (isMobile ? 5.5 : 7.5)
    ), 0.008);  // was 0.016 — halved for much lazier drift
    camera.lookAt(0, 0, 0);
  });
  return null;
};

// ─── Scene ────────────────────────────────────────────────────────────────────
const Scene: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <>
    <fogExp2 attach="fog" color="#020209" density={isMobile ? 0.020 : 0.026} />

    <ambientLight intensity={0.04} />
    {/* Primary key — cold top-down, keeps orb dramatically lit without overexposing */}
    <spotLight position={[2, 28, 6]} intensity={22} angle={0.20} penumbra={0.85} color="#b8d0ff" decay={1.3} distance={75} />
    {/* Side fill */}
    <pointLight position={[-8, 4, 8]} intensity={1.2} color="#4466cc" distance={28} decay={2} />
    {/* Back violet rim */}
    <directionalLight position={[4, -6, -16]} intensity={1.0} color="#1a0830" />

    <CameraRig isMobile={isMobile} />
    {!isMobile && <GridRings />}
    <Particles count={isMobile ? 2000 : 4800} />
    <LiquidOrb scale={isMobile ? 0.80 : 1} />
    <AccentOrbs scale={isMobile ? 0.85 : 1} />
    <BloomComposer />
  </>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
const Hero3D: React.FC = () => {
  const isMobile = window.innerWidth < 768;

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ background: 'radial-gradient(ellipse at 50% 45%, #060612 0%, #020208 55%, #000000 100%)' }}
    >
      <Canvas
        camera={{ position: [0, 6, 18], fov: isMobile ? 65 : 52, near: 0.1, far: 300 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        dpr={[1, isMobile ? 1.4 : 1.8]}
        frameloop="always"
        style={{ background: 'transparent' }}
      >
        <Scene isMobile={isMobile} />
      </Canvas>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 50%, transparent ${isMobile ? '18%' : '28%'}, rgba(0,0,0,${isMobile ? '0.80' : '0.65'}) 100%)`,
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none',
        height: isMobile ? '200px' : '170px',
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.60))',
      }} />
    </div>
  );
};

export default Hero3D;
