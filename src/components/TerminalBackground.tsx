'use client';

import { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { terminalColors } from '../styles/Terminal.styles';

// CRT flicker animation
const flicker = keyframes`
  0% { opacity: 1.0; }
  2% { opacity: 0.8; }
  4% { opacity: 0.9; }
  8% { opacity: 1.0; }
  70% { opacity: 0.9; }
  72% { opacity: 1.0; }
  82% { opacity: 0.8; }
  92% { opacity: 0.9; }
  96% { opacity: 1.0; }
`;

// Static noise animation
const staticNoise = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 100% 100%; }
`;

// Background container
const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
  background-color: #000000;
  animation: ${flicker} 30s infinite;
  box-shadow: inset 0 0 150px rgba(0, 50, 0, 0.3);
`;

// CRT tube effect with curved edges and vignette
const CRTTube = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px / 20px;
  overflow: hidden;
  box-shadow: 
    inset 0 0 30px 10px rgba(0, 30, 0, 0.5),
    inset 0 0 100px 20px rgba(0, 0, 0, 0.8);
  background: radial-gradient(
    ellipse at center,
    rgba(0, 10, 0, 0) 0%,
    rgba(0, 5, 0, 0.2) 70%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
`;

// Enhanced scanlines effect
const Scanlines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 15, 0, 0.2) 51%,
    transparent 51%
  );
  background-size: 100% 4px;
  z-index: 2;
`;

// Subtle screen noise/static
const StaticNoise = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQeSURBVGhD7ZhNaBNpFIbfzE8naSKNqWlj0hqrpj9WlKpUl9aCuKgLdeFGcOkiIAguunDjQsRF14IIulCoIlIolLoRV+pGFMSFG0GR4o+1bdoao21tfrr5mYTvfEmTzGQm6kw77cJ54Fwm853v3DfJzSRfQj799NPi9PR0FDp27ty5h5s2bTqCJV0Nw4OUNJ7P55FMJpFOp/H8+XMIwXr58iWlUukFjBZdvHhRamxsBLa5yU9MTGjDw8P62NiYViqVIHc4EongjTfeQE9PD5qbm9Hc3Fy8detWBEZ2pW0kEom5vr4+raGhAY3doCfIkUwm0d7ejmg0ivXr12vPnj1TX79+fRMNDQ1HYWRUYvbs2aPBQEYTQTdQKpUKJWhjYyPWrFmDYDAIJcKC2dnZhOLGQldXV2uoX4ARvlc0Gn3kKILEYjFrcXGRdoMD3UJT4YlIzPnz59/avn37FU2f16RJkxe1SOzLL7+M4Fd+xXY6sDc2a4rZwv3799k1MzPD4jnrq9oZY8h+9OjRNqy4DKMAo3C9cH9/f9+DBw+G/Xrlgp02tTRGd09Pj9bf368NDw/TQQgQjB8dHQ3ibNrY2NgdGLGqq6vZe9++fe9cunSpHwYBOGlqatLwXDcNUWpQV2t7e3sTFvYC5QaBgMWLFy/eg9mC2tpausW2Z8+eo1j28S5t0KcX9LV/5syZ3epmE7iNn9G6qAYvUQK2iRs3boyKnVYVgA3s9QL6FtLV1QUTZbLl5WWYLXr18TPZ2dlZxIWsoK+vZrOl7QaJGRwc1K9evYpoq/pgNn8kCc4RHHjg5cuXd3GVu+NnMpkMWEqHIyMj+tzcHIc4yNzc3F20k/S7i2wPHjz4CeK3YBfCK3ghHA6jvb19B8zDMMPDw3tgttivP4ELv3///nk1I3ghsYbIrGcnF82dWu7JZJJl9erVaGlpQUtLy0cNDQ2fwJy9du0aft+/D7MHQoj5+Xm8evUKL168AC5OYXpiwuBFzDMbHGQpKyvDGrwubYzgJsUkiFUxWg8ePDiAbGUweBiU4BQLxcpRwODsWSJy+fLlv9DC0qk0r09F/FfEUZE7d+5oOM72NzY2cmtOhsPhH65fv/4jRvdI0eUIxScE5hOmn+FVYiKifOXKlftY+hLlCj9QRLqu/4EXgE28eQe8EPn9GvI3RVTwqnTzH/lnFZHoIQomxgNuvzJd8RQlEuqUALfqU78yXenCNTvb19c3hqzTTXsikfgJp2yrq6vrVzS4m9YDMF6BwjdvnzO2KU64uDitpTDzDkHibFZLY/x97yGFH9wU/8c9EhUJQVasOBYlQHK5nNJarGIYnuCh8QDHXxeR9Eu17YqiyAP8fqUVRvKZTAYLCwuYnJxUWksWCgXDK0q57/uPv8EngB8REUW3AAAAAElFTkSuQmCC");
  background-size: 50px 50px;
  background-repeat: repeat;
  opacity: 0.03;
  z-index: 1;
  animation: ${staticNoise} 1s linear infinite;
  pointer-events: none;
`;

// Horizontal sync effect - occasional horizontal lines
const HorizontalSync = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 3;
  
  &::before {
    content: "";
    position: absolute;
    top: 20%;
    left: 0;
    right: 0;
    height: 3px;
    background-color: rgba(0, 255, 0, 0.08);
    opacity: 0;
    animation: ${flicker} 10s infinite;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 75%;
    left: 0;
    right: 0;
    height: 3px;
    background-color: rgba(0, 255, 0, 0.08);
    opacity: 0;
    animation: ${flicker} 13s infinite;
  }
`;

// Glow effect around text
const Glow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  filter: blur(8px);
  opacity: 0.2;
  background: radial-gradient(
    ellipse at center, 
    rgba(0, 255, 0, 0.2) 0%, 
    rgba(0, 0, 0, 0) 70%
  );
`;

const TerminalBackground = () => {
  return (
    <BackgroundContainer>
      <Glow />
      <StaticNoise />
      <Scanlines />
      <HorizontalSync />
      <CRTTube />
    </BackgroundContainer>
  );
};

export default memo(TerminalBackground); 