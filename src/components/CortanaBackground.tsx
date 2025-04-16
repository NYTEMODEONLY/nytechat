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
  /* Darker blue background color as base */
  background-color: rgba(0, 10, 30, 0.7);
`;

// Base image that's always visible
const BaseImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/cortana-bg.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.4;
  z-index: -1;
`;

// Blue glowing particles floating upward
const FloatingParticles = () => {
  const COUNT = 200; // Number of particles
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Create particles with random positions
  const particles = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    
    for (let i = 0; i < COUNT; i++) {
      // Random position across viewport
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * viewport.width * 1.5;
      positions[i3 + 1] = (Math.random() - 0.5) * viewport.height * 1.5;
      positions[i3 + 2] = Math.random() * 2;
      
      // Blue hue with variation
      colors[i3] = 0.2 + Math.random() * 0.3; // Red (low)
      colors[i3 + 1] = 0.5 + Math.random() * 0.3; // Green (medium)
      colors[i3 + 2] = 0.8 + Math.random() * 0.2; // Blue (high)
      
      // Random sizes for particles
      sizes[i] = Math.random() * 2 + 0.5;
      
      // Random speeds for vertical movement
      speeds[i] = 0.2 + Math.random() * 0.8;
    }
    
    return { positions, colors, sizes, speeds };
  }, [viewport]);
  
  // Animation loop for particle movement
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speeds = particles.speeds;
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      // Move particles upward
      positions[i3 + 1] += speeds[i] * delta;
      
      // Reset particles that have moved beyond the top of the screen
      if (positions[i3 + 1] > viewport.height) {
        positions[i3] = (Math.random() - 0.5) * viewport.width * 1.5;
        positions[i3 + 1] = -viewport.height / 2 - Math.random() * 20;
        positions[i3 + 2] = Math.random() * 2;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={COUNT}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          
          void main() {
            // Create circular glow effect
            float d = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (d > 0.5) discard;
            
            // Glow intensity stronger in center
            float intensity = 1.0 - d * 2.0;
            
            gl_FragColor = vec4(vColor, intensity);
          }
        `}
      />
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
    uIntensity: { value: 0.1 },
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) }
  };

  // Update shader uniforms on each frame
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      // Random glitches - more subtle but still active
      if (Math.random() > 0.97) {
        materialRef.current.uniforms.uIntensity.value = Math.random() * 0.12 + 0.05;
      } else {
        materialRef.current.uniforms.uIntensity.value *= 0.95;
      }
    }
  });

  return (
    <mesh position={[0, 0, 0]} scale={[viewport.width, viewport.height, 1]}>
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
            float wavyEffect = sin(uv.y * 80.0 + uTime * 3.0) * sin(uTime * 0.5) * 0.003;
            uv.x += wavyEffect;
            
            // Occasional horizontal glitch lines
            float lineNoise = step(0.97, random(vec2(floor(uv.y * 100.0), uTime * 10.0)));
            float lineOffset = (random(vec2(floor(uv.y * 100.0), uTime)) * 2.0 - 1.0) * 0.02 * lineNoise * uIntensity * 10.0;
            uv.x += lineOffset;
            
            // RGB shift
            float amount = (random(vec2(floor(uTime * 10.0))) * 2.0 - 1.0) * uIntensity * 0.006;
            float r = texture2D(uTexture, uv + vec2(amount, 0.0)).r;
            float g = texture2D(uTexture, uv).g;
            float b = texture2D(uTexture, uv - vec2(amount, 0.0)).b;
            
            // Vertical scanlines
            float scanline = sin(uv.y * 800.0 + uTime * 5.0) * 0.03 + 0.97;
            
            // Overall noise
            float noise = random(vUv * uTime * 0.001) * 0.02 - 0.01;
            
            // Combine effects - no fade in/out, just permanent glitching
            vec4 color = vec4(r, g, b, 1.0) * scanline + noise;
            
            // Blue tint the image a bit
            color.r *= 0.8;
            color.g *= 0.9;
            color.b *= 1.2;
            
            // Set constant opacity
            color.a = 0.6;
            
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
  return (
    <BackgroundContainer>
      {/* Always visible base image */}
      <BaseImage />
      
      {/* Three.js canvas for glitching effects and particles */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5] }}>
        <GlitchingPlane />
        <FloatingParticles />
      </Canvas>
    </BackgroundContainer>
  );
};

export default CortanaBackground; 