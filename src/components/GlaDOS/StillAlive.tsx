import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import type { TerminalTheme } from '../../styles/Terminal.styles';
import { themeColors } from '../../styles/Terminal.styles';

// Theme-aware GLaDOS Portal styling
const GLaDOSContainer = styled.div<{ $theme?: TerminalTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  color: ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
  font-family: 'Courier New', monospace;
  padding: 2rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.95;
  perspective: 400px;
  overflow: hidden;
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const starWarsScroll = keyframes`
  0% { 
    transform: rotateX(20deg) translateY(100%);
    opacity: 1;
  }
  75% { 
    opacity: 1;
    transform: rotateX(25deg) translateY(-510%);
  }
  99% {
    transform: rotateX(25deg) translateY(-680%);
    opacity: 1;
  }
  100% { 
    transform: rotateX(25deg) translateY(-680%);
    opacity: 1;
  }
`;

const GLaDOSHeader = styled.h1<{ $theme?: TerminalTheme }>`
  color: ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  animation: ${fadeIn} 2s ease-in-out;
`;

const GLaDOSText = styled.div<{ $theme?: TerminalTheme }>`
  font-size: 1.5rem;
  line-height: 1.8;
  text-align: center;
  max-width: 800px;
  width: 100%;
  transform-origin: 50% 100%;
  animation: ${starWarsScroll} 150s linear;
  transform: rotateX(25deg);
  position: relative;
  height: 60vh;
  overflow: visible;
  color: ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
`;

// Add top fade gradient
const TopFade = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  z-index: 110;
  pointer-events: none;
`;

const LyricLine = styled.div<{ delay: number, duration: number, $theme?: TerminalTheme }>`
  margin-bottom: 1.5rem;
  white-space: pre-line;
  animation: ${fadeIn} 1s ease-in forwards;
  animation-delay: ${props => props.delay}s;
  opacity: 0;
  color: ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
`;

const Cursor = styled.span<{ $theme?: TerminalTheme }>`
  display: inline-block;
  width: 0.6rem;
  height: 1.2rem;
  background-color: ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
  margin-left: 0.2rem;
  animation: ${blink} 1s infinite;
`;

const CloseButton = styled.button<{ $theme?: TerminalTheme }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: transparent;
  border: 1px solid ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
  color: ${props => props.$theme === 'amber' ? themeColors.amber.text : themeColors.green.text};
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  z-index: 150;
  &:hover {
    background-color: ${props => props.$theme === 'amber' 
      ? 'rgba(255, 176, 0, 0.2)' 
      : 'rgba(102, 255, 102, 0.2)'};
  }
`;

// Complete Still Alive lyrics with precise timing
const stillAliveLyrics = [
  { text: "This was a triumph!", delay: 0 },
  { text: "I'm making a note here:", delay: 3.8 },
  { text: "HUGE SUCCESS!", delay: 6.3 },
  { text: "It's hard to overstate", delay: 9.7 },
  { text: "my satisfaction.", delay: 12.1 },
  { text: "Aperture Science.", delay: 16.2 },
  { text: "We do what we must", delay: 19.3 },
  { text: "because we can.", delay: 21.0 },
  { text: "For the good of all of us,", delay: 25.2 },
  { text: "Except the ones who are dead.", delay: 29.3 },
  { text: "But there's no sense crying", delay: 33.9 },
  { text: "over every mistake.", delay: 36.7 },
  { text: "You just keep on trying", delay: 38.9 },
  { text: "till you run out of cake.", delay: 41.4 },
  { text: "And the science gets done.", delay: 44.2 },
  { text: "And you make a neat gun.", delay: 47.4 },
  { text: "For the people who are", delay: 49.9 },
  { text: "still alive.", delay: 52.5 },
  { text: "I'm not even angry.", delay: 58.9 },
  { text: "I'm being so sincere right now.", delay: 62.1 },
  { text: "Even though you broke my heart", delay: 66.5 },
  { text: "and killed me.", delay: 69.8 },
  { text: "And tore me to pieces.", delay: 73.7 },
  { text: "And threw every piece into a fire.", delay: 77.1 },
  { text: "As they burned it hurt because", delay: 81.5 },
  { text: "I was so happy for you!", delay: 84.8 },
  { text: "Now these points of data", delay: 89.1 },
  { text: "make a beautiful line.", delay: 92.1 },
  { text: "And we're out of beta.", delay: 95.1 },
  { text: "We're releasing on time.", delay: 98.1 },
  { text: "So I'm GLaD I got burned.", delay: 101.7 },
  { text: "Think of all the things we learned", delay: 105.0 },
  { text: "for the people who are", delay: 108.2 },
  { text: "still alive.", delay: 110.7 },
  { text: "Go ahead and leave me.", delay: 117.5 },
  { text: "I think I prefer to stay inside.", delay: 120.5 },
  { text: "Maybe you'll find someone else", delay: 124.9 },
  { text: "to help you.", delay: 128.3 },
  { text: "Maybe Black Mesa...", delay: 131.9 },
  { text: "THAT WAS A JOKE. HA HA. FAT CHANCE.", delay: 135.3 },
  { text: "Anyway, this cake is great.", delay: 139.9 },
  { text: "It's so delicious and moist.", delay: 143.3 },
  { text: "Look at me still talking", delay: 147.7 },
  { text: "when there's science to do.", delay: 150.2 },
  { text: "When I look out there,", delay: 153.5 },
  { text: "it makes me GLaD I'm not you.", delay: 155.7 },
  { text: "I've experiments to run.", delay: 160.2 },
  { text: "There is research to be done.", delay: 163.7 },
  { text: "On the people who are", delay: 166.9 },
  { text: "still alive.", delay: 169.5 },
  { text: "And believe me I am", delay: 175.9 },
  { text: "still alive.", delay: 179.1 },
  { text: "I'm doing science and I'm", delay: 183.5 },
  { text: "still alive.", delay: 186.8 },
  { text: "I feel FANTASTIC and I'm", delay: 191.2 },
  { text: "still alive.", delay: 194.9 },
  { text: "While you're dying I'll be", delay: 199.0 },
  { text: "still alive.", delay: 202.3 },
  { text: "And when you're dead I will be", delay: 207.0 },
  { text: "still alive.", delay: 210.3 },
  { text: "STILL ALIVE", delay: 214.7 },
  { text: "STILL ALIVE", delay: 216.4 }
];

interface StillAliveProps {
  onClose: () => void;
  theme?: TerminalTheme;
}

const StillAlive: React.FC<StillAliveProps> = ({ onClose, theme = 'green' }) => {
  const [lyrics, setLyrics] = useState<Array<{ text: string; visible: boolean }>>(
    stillAliveLyrics.map(line => ({ text: line.text, visible: false }))
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element
    const audio = new Audio("/still_alive.mp3");
    audioRef.current = audio;
    
    // Start playing
    audio.volume = 0.6;
    audio.play().catch(error => {
      console.error("Audio playback failed:", error);
    });
    
    // Clean up
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Display lyrics based on timing
  useEffect(() => {
    const timers: number[] = [];
    
    for (let i = 0; i < stillAliveLyrics.length; i++) {
      const timer = window.setTimeout(() => {
        setLyrics(prev => {
          const newLyrics = [...prev];
          if (newLyrics[i]) {
            newLyrics[i].visible = true;
          }
          return newLyrics;
        });
      }, stillAliveLyrics[i].delay * 1000);
      
      timers.push(timer);
    }
    
    // Clean up timers
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);
  
  return (
    <GLaDOSContainer $theme={theme}>
      <CloseButton onClick={onClose} $theme={theme}>×</CloseButton>
      <TopFade />
      <GLaDOSHeader $theme={theme}>GLaDOS Mode Activated</GLaDOSHeader>
      <GLaDOSText $theme={theme}>
        {lyrics.map((line, index) => (
          <LyricLine 
            key={`lyric-${stillAliveLyrics[index].text}-${stillAliveLyrics[index].delay}`} 
            delay={stillAliveLyrics[index].delay / 40} 
            duration={3}
            style={{ opacity: line.visible ? 1 : 0 }}
            $theme={theme}
          >
            {line.text}
          </LyricLine>
        ))}
      </GLaDOSText>
    </GLaDOSContainer>
  );
};

export default StillAlive; 