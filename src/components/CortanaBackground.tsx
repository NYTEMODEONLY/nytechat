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
  background-color: rgba(0, 20, 40, 0.5);
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
  opacity: 0.4;
  z-index: -1;
  filter: brightness(0.6) contrast(1.3) blur(1px);
`;

// Floating particles component
const Particles = () => {
  const COUNT = 150;
  const { viewport } = useThree();
  
  // Create particles with random positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = Math.random() * -3;
      const speed = Math.random() * 0.15 + 0.05;
      const size = Math.random() * 1.5 + 0.5;
      // Generate blue hues
      const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.5 + Math.random() * 0.3);
      temp.push({ x, y, z, speed, size, color });
    }
    return temp;
  }, [viewport]);
  
  const particlesRef = useRef<THREE.Points>(null);
  const particlesMaterialRef = useRef<THREE.PointsMaterial>(null);
  
  // Update particles position
  useFrame((state, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        // Move particles upward
        positions[i3 + 1] += particles[i].speed * delta * 10;
        
        // Reset particles when they go out of view
        if (positions[i3 + 1] > viewport.height) {
          positions[i3] = (Math.random() - 0.5) * viewport.width * 1.5;
          positions[i3 + 1] = -viewport.height;
          positions[i3 + 2] = Math.random() * -3;
        }
        
        // Add some slight horizontal movement
        positions[i3] += Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.01;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Add pulsating effect to particles
      if (particlesMaterialRef.current) {
        particlesMaterialRef.current.size = (Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + 1) * 1.5;
      }
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={new Float32Array(COUNT * 3)}
          itemSize={3}
          onUpdate={(self) => {
            const positions = self.array as Float32Array;
            for (let i = 0; i < COUNT; i++) {
              const i3 = i * 3;
              positions[i3] = particles[i].x;
              positions[i3 + 1] = particles[i].y;
              positions[i3 + 2] = particles[i].z;
            }
          }}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={new Float32Array(COUNT * 3)}
          itemSize={3}
          onUpdate={(self) => {
            const colors = self.array as Float32Array;
            for (let i = 0; i < COUNT; i++) {
              const i3 = i * 3;
              colors[i3] = particles[i].color.r;
              colors[i3 + 1] = particles[i].color.g;
              colors[i3 + 2] = particles[i].color.b;
            }
          }}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={particlesMaterialRef}
        size={1.5}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
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
    uIntensity: { value: 0.12 }, // Increased base intensity
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) }
  };

  // Update shader uniforms on each frame
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      // Random glitches
      if (Math.random() > 0.97) {
        materialRef.current.uniforms.uIntensity.value = Math.random() * 0.15 + 0.08; // Higher minimum intensity
      } else {
        // Don't decay below the base intensity
        materialRef.current.uniforms.uIntensity.value = Math.max(
          materialRef.current.uniforms.uIntensity.value * 0.95, 
          0.08
        );
      }
    }
  });

  return (
    <mesh position={[0, 0, -1]} scale={[viewport.width, viewport.height, 1]}>
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
            
            // Add slight zoom to fill the screen better
            uv = (uv - 0.5) * 0.95 + 0.5;
            
            // Small wave distortion
            float wavyEffect = sin(uv.y * 80.0 + uTime * 3.0) * sin(uTime * 0.5) * 0.003; // Increased effect
            uv.x += wavyEffect;
            
            // Occasional horizontal glitch lines
            float lineNoise = step(0.97, random(vec2(floor(uv.y * 100.0), uTime * 10.0))); // More frequent lines
            float lineOffset = (random(vec2(floor(uv.y * 100.0), uTime)) * 2.0 - 1.0) * 0.02 * lineNoise * uIntensity * 10.0;
            uv.x += lineOffset;
            
            // RGB shift
            float amount = (random(vec2(floor(uTime * 10.0))) * 2.0 - 1.0) * uIntensity * 0.006; // Increased shift
            float r = texture2D(uTexture, uv + vec2(amount, 0.0)).r;
            float g = texture2D(uTexture, uv).g;
            float b = texture2D(uTexture, uv - vec2(amount, 0.0)).b;
            
            // Vertical lines
            float scanline = sin(uv.y * 800.0 + uTime * 5.0) * 0.03 + 0.97; // More pronounced scanlines
            
            // Overall noise
            float noise = random(vUv * uTime * 0.001) * 0.02 - 0.01;
            
            // Combine effects
            vec4 color = vec4(r, g, b, 1.0) * scanline + noise;
            
            // Add blue tint and brighten
            color.rgb = mix(color.rgb, vec3(0.2, 0.5, 0.9), 0.2);
            color.rgb *= 1.3;
            
            // Add opacity for the overlay effect
            color.a = 0.65; // 65% opacity to make it more visible
            
            gl_FragColor = color;
          }
        `}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
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
          <Particles />
        </Canvas>
      )}
    </BackgroundContainer>
  );
};

export default CortanaBackground; 