import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';

// Styled component for the container
const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  /* Add a background color as fallback */
  background-color: rgba(0, 0, 30, 0.25);
`;

// Fallback image if Three.js has issues
const FallbackImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/cortana-bg.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: -1;
  filter: brightness(0.6) contrast(1.2) blur(1px);
`;

// Particle system for floating blue specs
const BlueParticles = () => {
  const { viewport } = useThree();
  const count = 200; // Number of particles
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particles with initial positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 2;
      const z = Math.random() * -3;
      // Random size between 0.01 and 0.03
      const size = Math.random() * 0.02 + 0.01;
      // Random speed between 0.02 and 0.06
      const speed = Math.random() * 0.04 + 0.02;
      // Random opacity between 0.3 and 0.7
      const opacity = Math.random() * 0.4 + 0.3;
      temp.push({ x, y, z, size, speed, opacity });
    }
    return temp;
  }, [viewport]);
  
  // Create particle geometries
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = particles[i].x;
      positions[i3 + 1] = particles[i].y;
      positions[i3 + 2] = particles[i].z;
      
      sizes[i] = particles[i].size;
      
      // Blue colors with slight variation
      colors[i3] = 0.3 + Math.random() * 0.2; // R (some red for purple tints)
      colors[i3 + 1] = 0.6 + Math.random() * 0.4; // G (some green for cyan tints)
      colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B (strong blue)
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, [particles]);
  
  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Move particles upward
      positions[i3 + 1] += particles[i].speed;
      
      // Add slight horizontal drift
      positions[i3] += Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.002;
      
      // Reset particles that move out of view
      if (positions[i3 + 1] > viewport.height) {
        positions[i3 + 1] = -viewport.height;
        positions[i3] = (Math.random() - 0.5) * viewport.width * 1.5;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef} geometry={particleGeometry}>
      <pointsMaterial
        size={0.15}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        opacity={0.6}
      >
        <texture attach="map" url="/globe.svg" />
      </pointsMaterial>
    </points>
  );
};

const GlitchingPlane = () => {
  // Load texture
  const texture = useTexture('/cortana-bg.jpg');
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  // Create shader material reference
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  
  // Custom shader for glitch effect
  const uniforms = {
    uTexture: { value: texture },
    uTime: { value: 0 },
    uIntensity: { value: 0.08 },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) }
  };

  // Update shader uniforms on each frame
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      // Random glitches
      if (Math.random() > 0.98) {
        materialRef.current.uniforms.uIntensity.value = Math.random() * 0.12 + 0.04;
      } else {
        materialRef.current.uniforms.uIntensity.value *= 0.95;
        // Ensure a minimum intensity so Cortana is always visible
        if (materialRef.current.uniforms.uIntensity.value < 0.05) {
          materialRef.current.uniforms.uIntensity.value = 0.05;
        }
      }
    }
  });

  return (
    <mesh position={[0, 0, -2]} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uTexture;
          uniform float uTime;
          uniform float uIntensity;
          uniform vec2 uResolution;
          
          varying vec2 vUv;
          
          float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }
          
          void main() {
            // Digital glitch effect
            vec2 uv = vUv;
            
            // Small wave distortion
            float wavyEffect = sin(uv.y * 60.0 + uTime * 2.0) * sin(uTime * 0.5) * 0.002;
            uv.x += wavyEffect;
            
            // Occasional horizontal glitch lines
            float lineNoise = step(0.98, random(vec2(floor(uv.y * 80.0), uTime * 8.0)));
            float lineOffset = (random(vec2(floor(uv.y * 80.0), uTime)) * 2.0 - 1.0) * 0.01 * lineNoise * uIntensity * 8.0;
            uv.x += lineOffset;
            
            // RGB shift
            float amount = (random(vec2(floor(uTime * 8.0))) * 2.0 - 1.0) * uIntensity * 0.005;
            float r = texture2D(uTexture, uv + vec2(amount, 0.0)).r;
            float g = texture2D(uTexture, uv).g;
            float b = texture2D(uTexture, uv - vec2(amount, 0.0)).b;
            
            // Vertical lines
            float scanline = sin(uv.y * 600.0 + uTime * 4.0) * 0.02 + 0.98;
            
            // Overall noise
            float noise = random(vUv * uTime * 0.001) * 0.015;
            
            // Combine effects
            vec4 color = vec4(r, g, b, 1.0) * scanline + noise;
            
            // Increase blue channel slightly for better blue glow
            color.b += 0.05;
            
            // Add opacity for the overlay effect (make it more visible but still translucent)
            color.a = 0.4; // 40% opacity for good balance
            
            gl_FragColor = color;
          }
        `}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

const CortanaBackground = () => {
  const [threeJsLoaded, setThreeJsLoaded] = useState(false);

  // Set loaded status after component mounts
  useEffect(() => {
    setThreeJsLoaded(true);
  }, []);

  return (
    <BackgroundContainer>
      {/* Fallback background image */}
      <FallbackImage />
      
      {/* Three.js canvas for glitching effects */}
      {threeJsLoaded && (
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5] }}>
          <GlitchingPlane />
          <BlueParticles />
        </Canvas>
      )}
    </BackgroundContainer>
  );
};

export default CortanaBackground; 