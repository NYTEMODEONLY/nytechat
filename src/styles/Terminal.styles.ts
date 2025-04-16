import styled, { keyframes, createGlobalStyle, css } from 'styled-components';

// Global variables for consistent sizes
const FONT_SIZE = '1.05rem';
const MOBILE_FONT_SIZE = '0.95rem';
const MOBILE_BREAKPOINT = '768px';
const SMALL_SCREEN_BREAKPOINT = '500px';

// Define theme colors
export type TerminalTheme = 'green' | 'amber' | 'blue';

export const themeColors = {
  green: {
    text: '#00ff00',
    highlight: '#00aa00',
    dimmed: '#007700',
    scanline: 'rgba(0, 255, 0, 0.1)',
    cursor: '#00ff00',
    boxShadow: 'rgba(0, 50, 0, 0.5)'
  },
  amber: {
    text: '#ffb000',
    highlight: '#cc8800',
    dimmed: '#aa7000',
    scanline: 'rgba(255, 176, 0, 0.1)',
    cursor: '#ffb000',
    boxShadow: 'rgba(50, 30, 0, 0.5)'
  },
  blue: {
    text: '#0078d7',
    highlight: '#0056aa',
    dimmed: '#004389',
    scanline: 'rgba(0, 120, 215, 0.1)',
    cursor: '#0078d7',
    boxShadow: 'rgba(0, 30, 50, 0.5)'
  }
};

// Common mixins
const responsiveFontSize = css`
  font-size: ${FONT_SIZE};
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: ${MOBILE_FONT_SIZE};
  }
`;

const fullViewport = css`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
`;

// Global styles for the terminal
export const GlobalTerminalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    background-color: #000;
    ${responsiveFontSize}
    ${fullViewport}
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overscroll-behavior: none;
    touch-action: manipulation;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure all app content is within the viewport */
  #__next, main {
    ${fullViewport}
    overflow: hidden;
    position: relative;
  }
`;

// Terminal-themed colors
export const terminalColors = {
  bg: '#000000',
  text: '#00ff00', // Classic green terminal color
  green: '#66FF66', // Green terminal color
  amber: '#ffb000', // Amber terminal color option
  blue: '#00AAFF', // Blue terminal color
  pink: '#FF66AA', // Pink terminal color
  retro: '#FFAA33', // Retro amber/orange terminal color
  white: '#FFFFFF', // White terminal color
  highlight: '#00aa00',
  dimmed: '#007700',
  dim: 'rgba(160, 160, 160, 0.8)', // For dimmed non-primary text
  scanline: 'rgba(0, 255, 0, 0.1)',
  cursor: '#00ff00',
};

// Animations
export const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

export const flicker = keyframes`
  0% { opacity: 0.95; }
  5% { opacity: 0.85; }
  10% { opacity: 0.95; }
  15% { opacity: 0.9; }
  20% { opacity: 0.95; }
  25% { opacity: 0.85; }
  30% { opacity: 0.95; }
  35% { opacity: 0.9; }
  40% { opacity: 0.95; }
  45% { opacity: 1; }
  50% { opacity: 0.95; }
  55% { opacity: 0.95; }
  60% { opacity: 1; }
  65% { opacity: 0.95; }
  70% { opacity: 0.9; }
  75% { opacity: 0.95; }
  80% { opacity: 1; }
  85% { opacity: 0.95; }
  90% { opacity: 0.95; }
  95% { opacity: 0.9; }
  100% { opacity: 1; }
`;

// Scrollbar styling
const scrollbarStyles = css`
  scrollbar-width: thin;
  scrollbar-color: ${terminalColors.dimmed} ${terminalColors.bg};
  
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${terminalColors.bg};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${terminalColors.dimmed};
    border-radius: 4px;
  }
`;

// Main terminal container
export const TerminalContainer = styled.div<{ $theme?: TerminalTheme }>`
  ${fullViewport}
  background-color: ${terminalColors.bg};
  color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.text : 
    props.$theme === 'blue' ? themeColors.blue.text :
    themeColors.green.text};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-bottom: 2rem; /* Match new status bar height */
  box-sizing: border-box;
  animation: ${flicker} 10s infinite;
  ${responsiveFontSize}
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 0.5rem;
    padding-bottom: 1.8rem; /* Match mobile status bar height */
  }
`;

// Scanlines overlay
export const Scanlines = styled.div<{ $theme?: TerminalTheme }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    ${props => 
      props.$theme === 'amber' ? themeColors.amber.scanline : 
      props.$theme === 'blue' ? themeColors.blue.scanline :
      themeColors.green.scanline} 51%,
    transparent 51%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 5;
`;

// Screen edge CRT effect
export const CRTEdge = styled.div<{ $theme?: TerminalTheme }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 100px ${props => 
    props.$theme === 'amber' ? themeColors.amber.boxShadow : 
    props.$theme === 'blue' ? themeColors.blue.boxShadow :
    themeColors.green.boxShadow};
  border-radius: 20px;
  pointer-events: none;
  z-index: 4;
`;

// Chat messages container
export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  ${scrollbarStyles}
  ${responsiveFontSize}
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  width: 100%;
  max-width: 100%;
  position: relative;
  touch-action: pan-y;
  height: calc(100vh - 5rem);
  max-height: calc(100% - 5rem);
  overscroll-behavior: contain;
  cursor: default;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    height: calc(100vh - 4.5rem);
  }
`;

// Individual message
export const Message = styled.div`
  margin-bottom: 1rem;
  line-height: 1.5;
  word-break: break-word;
  ${responsiveFontSize}
  
  &.user-message {
    opacity: 1;
  }
  
  &.assistant-message {
    opacity: 0.9;
  }
`;

// Message prefix (USER> or AI>)
export const MessagePrefix = styled.span<{ $personaColor?: string; $theme?: TerminalTheme }>`
  font-weight: bold;
  margin-right: 8px;
  ${responsiveFontSize}
  
  &.user-prefix {
    color: ${props => props.$theme === 'amber' ? themeColors.green.text : terminalColors.amber};
  }
  
  &.assistant-prefix {
    color: ${props => 
      props.$personaColor ? props.$personaColor : 
      props.$theme === 'amber' ? themeColors.amber.text : 
      props.$theme === 'blue' ? themeColors.blue.text :
      themeColors.green.text
    };
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-right: 6px;
  }
`;

// Input container
export const InputContainer = styled.div<{ $theme?: TerminalTheme }>`
  display: flex;
  align-items: center;
  border-top: 1px solid ${props => 
    props.$theme === 'amber' ? themeColors.amber.dimmed : 
    props.$theme === 'blue' ? themeColors.blue.dimmed :
    themeColors.green.dimmed};
  padding: 0;
  margin-bottom: 2rem; /* Match new status bar height */
  background-color: rgba(0, 20, 0, 0.3);
  position: relative;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  z-index: 10;
  height: 2rem; /* Match new status bar height */
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 1.8rem;
    height: 1.8rem;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent 0%,
      ${props => 
        props.$theme === 'amber' ? themeColors.amber.text : 
        props.$theme === 'blue' ? themeColors.blue.text :
        themeColors.green.text} 20%,
      ${props => 
        props.$theme === 'amber' ? themeColors.amber.text : 
        props.$theme === 'blue' ? themeColors.blue.text :
        themeColors.green.text} 80%,
      transparent 100%
    );
    opacity: 0.5;
  }
`;

// Prompt character (>)
export const Prompt = styled.span<{ $theme?: TerminalTheme }>`
  margin-right: 6px;
  color: ${props => props.$theme === 'amber' ? themeColors.green.text : terminalColors.amber};
  font-weight: bold;
  ${responsiveFontSize}
  line-height: 2rem;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-right: 4px;
    line-height: 1.8rem;
  }
`;

// Input field
export const Input = styled.input<{ $theme?: TerminalTheme }>`
  background-color: transparent;
  border: none;
  color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.text : 
    props.$theme === 'blue' ? themeColors.blue.text :
    themeColors.green.text};
  font-family: 'Courier New', monospace;
  ${responsiveFontSize}
  flex: 1;
  outline: none;
  height: 2rem;
  line-height: 2rem;
  position: relative;
  z-index: 20;
  caret-color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.cursor : 
    props.$theme === 'blue' ? themeColors.blue.cursor :
    themeColors.green.cursor};
  caret-width: thin;
  caret-shape: block;
  padding: 0;
  margin: 0;
  min-width: 0; /* Allows flex items to shrink below content size */
  overflow: hidden;
  text-overflow: ellipsis;

  &::placeholder {
    color: ${props => 
      props.$theme === 'amber' ? themeColors.amber.dimmed : 
      props.$theme === 'blue' ? themeColors.blue.dimmed :
      themeColors.green.dimmed};
    ${responsiveFontSize}
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    height: 1.8rem;
    line-height: 1.8rem;
  }
`;

// Typing cursor
export const Cursor = styled.span`
  display: inline-block;
  width: 5px;
  height: 1.05rem;
  background-color: ${terminalColors.cursor};
  margin-left: 2px;
  animation: ${blink} 1s infinite;
  align-self: center;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 4px;
    height: 0.95rem;
  }
`;

// Status line
export const StatusLine = styled.div<{ $theme?: TerminalTheme }>`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0;
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: ${props => 
    props.$theme === 'amber' ? themeColors.amber.dimmed : 
    props.$theme === 'blue' ? themeColors.blue.dimmed :
    themeColors.green.dimmed};
  color: ${terminalColors.bg};
  ${responsiveFontSize}
  display: flex;
  align-items: center;
  height: 2rem; /* Increased height for status bar */
  box-sizing: border-box;
  white-space: nowrap;

  /* Distribute items evenly except for the logo */
  & > span {
    margin-right: 1.5rem;
  }
  
  /* Last text item before logo should not have margin */
  & > span:nth-last-of-type(1) {
    margin-right: 0;
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    height: 1.8rem; /* Increased height for mobile */
    
    & > span {
      margin-right: 1rem;
    }
  }
  
  @media (max-width: ${SMALL_SCREEN_BREAKPOINT}) {
    font-size: calc(${MOBILE_FONT_SIZE} - 0.1rem);
    padding-left: 0.3rem;
    padding-right: 0.3rem;
    
    /* Adjust spacing between status items */
    & > span {
      margin-right: 0.5rem;
    }
    
    /* Make labels more compact */
    & > span:nth-child(2) {
      flex-shrink: 1;
    }
  }
`;

// Define CSS rules for preventing iOS zoom on inputs
export const GlobalStyles = createGlobalStyle`
  /* iOS zoom prevention for form elements */
  @media screen and (-webkit-min-device-pixel-ratio: 0) {
    input, 
    textarea, 
    select {
      font-size: 16px !important;
    }
  }
`; 