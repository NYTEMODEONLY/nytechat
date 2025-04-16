import { useRef, useEffect, useState } from 'react';
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
  background-color: rgba(0, 0, 30, 0.4);
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
  opacity: 0.3;
  z-index: -1;
  filter: brightness(0.5) contrast(1.2) blur(2px);
`;

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
    uIntensity: { value: 0.1 }, // Increased intensity
    uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) }
  };

  // Update shader uniforms on each frame
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      // Random glitches
      if (Math.random() > 0.97) {
        materialRef.current.uniforms.uIntensity.value = Math.random() * 0.15 + 0.05; // Increased glitch intensity
      } else {
        materialRef.current.uniforms.uIntensity.value *= 0.95;
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
            
            // Brighten image a bit
            color.rgb *= 1.2;
            
            // Add opacity for the overlay effect (make it more visible)
            color.a = 0.5; // 50% opacity instead of 30%
            
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
        </Canvas>
      )}
    </BackgroundContainer>
  );
};

export default CortanaBackground; 