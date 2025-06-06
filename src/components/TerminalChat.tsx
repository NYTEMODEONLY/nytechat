'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { ChatMessage } from '../api/grok';
import type { TerminalInputRef } from './TerminalInput';
import { sendMessageToGrok } from '../api/grok';
import {
  TerminalContainer,
  Scanlines,
  CRTEdge,
  terminalColors,
  type TerminalTheme,
  GlobalStyles,
  themeColors
} from '../styles/Terminal.styles';
import TerminalBackground from './TerminalBackground';
import MessageList from './MessageList';
import StatusBar from './StatusBar';
import TerminalInput from './TerminalInput';
import dynamic from 'next/dynamic';
import { nytemodePerson, cortanaPersona } from '../lib/personas';
import styled, { createGlobalStyle } from 'styled-components';

// Dynamically import the StillAlive component to reduce bundle size
const StillAlive = dynamic(() => import('./GlaDOS/StillAlive'), {
  ssr: false,
  loading: () => null,
});

// Cortana background styling
const CortanaBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/cortana-bg.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.35; // Reduced opacity for more black background
  z-index: 0;
  pointer-events: none;
`;

// Cortana text glow styling
const CortanaGlowStyle = createGlobalStyle`
  .cortana-mode .assistant-message,
  .cortana-mode .assistant-prefix,
  .cortana-mode .user-message,
  .cortana-mode .user-prefix {
    text-shadow: 0 0 8px rgba(0, 120, 215, 0.8);
  }
`;

// Keep bootSequenceComplete outside the component to ensure it persists across hot reloads
let bootSequenceInitiated = false;

const TerminalChat = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingDots, setLoadingDots] = useState<string>('.');
  const [connectionStatus, setConnectionStatus] = useState<string>('ONLINE');
  const [currentTime, setCurrentTime] = useState<string>('--:--:--');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);
  const [isGLaDOSMode, setIsGLaDOSMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<TerminalTheme>('green');
  const [currentPersona, setCurrentPersona] = useState<typeof nytemodePerson | typeof cortanaPersona>(nytemodePerson);
  const inputRef = useRef<TerminalInputRef>(null);
  const cortanaAudioRef = useRef<HTMLAudioElement | null>(null);

  // Save persona to localStorage whenever it changes
  useEffect(() => {
    // Only save persona to localStorage if it's NOT Cortana
    // This prevents Cortana mode from persisting after refresh
    if (currentPersona.id !== 'cortana') {
      localStorage.setItem('currentPersona', JSON.stringify(currentPersona));
    }
  }, [currentPersona]);
  
  // Load saved theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('nytechat-theme');
    if (savedTheme === 'amber' || savedTheme === 'green') {
      setTheme(savedTheme);
    }

    // Load saved persona from localStorage if it exists
    const savedPersona = localStorage.getItem('currentPersona');
    if (savedPersona) {
      try {
        const parsedPersona = JSON.parse(savedPersona);
        // Only restore the saved persona if it's NOT Cortana
        if (parsedPersona.id !== 'cortana') {
          setCurrentPersona(parsedPersona);
        }
      } catch (error) {
        console.error('Error parsing saved persona:', error);
        // If there's an error parsing, just use the default
        setCurrentPersona(nytemodePerson);
      }
    }
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nytechat-theme', theme);
  }, [theme]);

  // Detect mobile viewport - memoized function to reduce recreations
  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
    setIsSmallScreen(window.innerWidth <= 500);
  }, []);

  // Screen size detection effect
  useEffect(() => {
    // Set initial value
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [checkScreenSize]);

  // Update the time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true }));
    };
    
    // Set initial time
    updateTime();
    
    // Update time every second
    const timeInterval = setInterval(updateTime, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (cortanaAudioRef.current) {
        cortanaAudioRef.current.pause();
        cortanaAudioRef.current = null;
      }
    };
  }, []);

  // Animate loading dots when isLoading is true
  useEffect(() => {
    if (!isLoading) return;
    
    const dotsInterval = setInterval(() => {
      setLoadingDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 300);
    
    return () => clearInterval(dotsInterval);
  }, [isLoading]);

  // Simulate terminal boot sequence - only run once
  useEffect(() => {
    if (bootSequenceInitiated) return;
    bootSequenceInitiated = true;
    
    const bootMessages: ChatMessage[] = [
      {
        role: 'assistant',
        content: 'nytechat interface v1.0',
        timestamp: Date.now(),
      },
      {
        role: 'assistant',
        content: 'Initializing system...',
        timestamp: Date.now() + 500,
      },
      {
        role: 'assistant',
        content: 'Connecting to nytemode AI...',
        timestamp: Date.now() + 1000,
      },
      {
        role: 'assistant',
        content: 'Connection established. Type your message and press ENTER to communicate with nytemode AI.',
        timestamp: Date.now() + 1500,
      },
    ];

    const initialMessages: ChatMessage[] = [];
    
    // Clear any existing messages
    setMessages(initialMessages);
    
    let delay = 0;
    for (const msg of bootMessages) {
      setTimeout(() => {
        setMessages(prev => [...prev, msg]);
      }, delay);
      delay += 800;
    }
  }, []);
  
  // Force focus to the input field but don't interfere with scrolling - memoized handler
  const handleContainerClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    // Don't focus if the user is trying to select text
    if (window.getSelection()?.toString()) return;
    
    // Don't focus if the user clicked a scrollbar
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const isScrollbarClick = e.clientX > rect.right - 20;
    
    // Focus the input using the ref
    if (!isScrollbarClick) {
      inputRef.current?.focus();
    }
  }, []);

  // Input change handler - memoized
  const handleInputChange = useCallback((event: { target: { value: string } }) => {
    setInput(event.target.value);
  }, []);

  // Close GLaDOS mode
  const closeGLaDOSMode = useCallback(() => {
    setIsGLaDOSMode(false);
  }, []);
  
  // Play Cortana theme music
  const playCortanaMusic = useCallback(() => {
    if (!cortanaAudioRef.current) {
      const audio = new Audio("/under_cover_of_night.mp3");
      audio.volume = 0.3; // 30% volume as requested
      audio.loop = true; // Loop the music while in Cortana mode
      cortanaAudioRef.current = audio;
    }
    
    // Start playing the theme
    cortanaAudioRef.current.play().catch(error => {
      console.error("Audio playback failed:", error);
    });
  }, []);
  
  // Stop Cortana theme music
  const stopCortanaMusic = useCallback(() => {
    if (cortanaAudioRef.current) {
      cortanaAudioRef.current.pause();
      cortanaAudioRef.current.currentTime = 0;
    }
  }, []);
  
  // Key down handler
  const handleKeyDown = useCallback(async (event: KeyboardEvent<HTMLInputElement>) => {
    // Submit message on Enter
    if (event.key === 'Enter' && input.trim() && !isLoading) {
      event.preventDefault();
      
      const trimmedInput = input.trim();
      
      // Prevent overly long messages that could abuse the API
      const MAX_MESSAGE_LENGTH = 1000;
      if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `ERROR: Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters. Please send a shorter message.`,
          timestamp: Date.now(),
        }]);
        return;
      }
      
      // Handle standard bang commands
      if (trimmedInput.startsWith('!')) {
        setInput('');
        
        // Handle persona commands
        if (trimmedInput === '!glados' || trimmedInput === '!stillalive') {
          setIsGLaDOSMode(true);
          return;
        }
        
        if (trimmedInput === '!nyte') {
          setCurrentPersona(nytemodePerson);
          setTheme('green');
          
          // Stop Cortana music when switching to nytemode
          stopCortanaMusic();
          
          // Explicitly remove any saved Cortana persona from localStorage
          const savedPersona = localStorage.getItem('currentPersona');
          if (savedPersona) {
            try {
              const parsedPersona = JSON.parse(savedPersona);
              if (parsedPersona.id === 'cortana') {
                localStorage.removeItem('currentPersona');
              }
            } catch (error) {
              console.error('Error parsing saved persona:', error);
            }
          }
          
          // Clear messages and add new welcome message
          setMessages([{
            role: 'assistant',
            content: 'Switched to nytemode persona.',
            timestamp: Date.now(),
          }]);
          setChatHistory([]);
          return;
        }
        
        if (trimmedInput === '!cortana') {
          setCurrentPersona(cortanaPersona);
          setTheme('blue');
          
          // Play Cortana theme music
          playCortanaMusic();
          
          // Ensure Cortana mode is not persisted in localStorage
          localStorage.removeItem('currentPersona');
          
          // Clear messages and start Cortana with her greeting
          const cortanaGreeting: ChatMessage[] = [
            {
              role: 'assistant',
              content: 'Switched to Cortana persona.',
              timestamp: Date.now(),
            },
            {
              role: 'assistant',
              content: 'Hey Chief!',
              timestamp: Date.now() + 100,
            }
          ];
          
          setMessages(cortanaGreeting);
          setChatHistory([]);
          return;
        }
        
        // Handle help command
        if (trimmedInput === '!help') {
          const helpText = currentPersona.id === 'cortana' 
            ? "```\nCOMMAND        DESCRIPTION\n-------        -----------\n!help          Show this help message\n!info          Show information about NyteChat\n!clear         Clear the chat history\n!time          Display current system time\n!status        Show connection status\n!stillalive    Activate GLaDOS mode\n```"
            : "```\nCOMMAND        DESCRIPTION\n-------        -----------\n!help          Show this help message\n!info          Show information about NyteChat\n!clear         Clear the chat history\n!time          Display current system time\n!status        Show connection status\n!green         Switch to green terminal theme\n!amber         Switch to amber terminal theme\n!stillalive    Activate GLaDOS mode\n```";
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: helpText,
            timestamp: Date.now(),
          }]);
          return;
        }
        
        // Handle clear command
        if (trimmedInput === '!clear') {
          setMessages([{
            role: 'assistant',
            content: 'Chat history cleared.',
            timestamp: Date.now(),
          }]);
          setChatHistory([]);
          return;
        }
        
        // Handle info command
        if (trimmedInput === '!info') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'nytechat v1.0\nA retro terminal-style chat interface for conversing with AI.\nBuilt with Next.js, React, and TypeScript.\n© 2025 ❤️ [nytemode.com](https://nytemode.com)',
            timestamp: Date.now(),
          }]);
          return;
        }
        
        // Handle nytemode command
        if (trimmedInput === '!nytemode') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'nytemode: Creator, developer, and designer who thrives in the late hours when the world sleeps and creative focus peaks. With a background in gaming and expertise spanning web development, e-commerce, AI, and blockchain, I build projects that blend technical precision with creative expression. Explore my digital museum at [nytemode.com](https://nytemode.com) — "NOCTURNAL BY PREFERENCE."',
            timestamp: Date.now(),
          }]);
          return;
        }
        
        // Handle time command
        if (trimmedInput === '!time') {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { 
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Current system time: ${timeString}`,
            timestamp: Date.now(),
          }]);
          return;
        }
        
        // Handle status command
        if (trimmedInput === '!status') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Connection status: ${connectionStatus}\nSystem status: OPERATIONAL\nPersona: ${currentPersona.name}\nTheme: ${theme}`,
            timestamp: Date.now(),
          }]);
          return;
        }
        
        // Theme commands
        if (trimmedInput === '!green' || trimmedInput === '!amber' || trimmedInput === '!blue') {
          // Prevent theme changes in Cortana mode
          if (currentPersona.id === 'cortana') {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I'm Cortana. My interface remains blue. You'll need to exit Cortana mode to change terminal colors.",
              timestamp: Date.now(),
            }]);
            return;
          }
          
          // Process theme changes for other personas
          if (trimmedInput === '!green') {
            setTheme('green');
            // Add system message about theme change without clearing chat
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Switched to green terminal theme.',
              timestamp: Date.now(),
            }]);
            return;
          }
          
          if (trimmedInput === '!amber') {
            setTheme('amber');
            // Add system message about theme change without clearing chat
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Switched to amber terminal theme.',
              timestamp: Date.now(),
            }]);
            return;
          }
          
          // !blue command is not available - respond with unknown command
          if (trimmedInput === '!blue') {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Command not recognized: ${trimmedInput}\nType !help to see available commands.`,
              timestamp: Date.now(),
            }]);
            return;
          }
        }
        
        // Unknown bang command
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Command not recognized: ${trimmedInput}\nType !help to see available commands.`,
          timestamp: Date.now(),
        }]);
        return;
      }
      
      // Regular message handling
      const userMessage: ChatMessage = {
        role: 'user',
        content: trimmedInput,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setChatHistory(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setConnectionStatus('PROCESSING');
      
      try {
        // Send message to Grok API with conversation history
        const response = await sendMessageToGrok(
          trimmedInput, 
          chatHistory,
          currentPersona
        );
        
        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setChatHistory(prev => [...prev, assistantMessage]);
        setConnectionStatus('ONLINE');
        setIsUserScrolling(false);
      } catch (err) {
        console.error('Error processing message:', err);
        // Add error message with Star Fox reference
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'I can\'t let you do that, Starfox.\n\nERROR: Connection to AI service failed. Please check your network connection and try again.',
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setConnectionStatus('DISCONNECTED');
        setIsUserScrolling(false);
      } finally {
        setIsLoading(false);
        
        // Ensure input field gets focus after response is received
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [input, isLoading, chatHistory, currentPersona, connectionStatus, theme, playCortanaMusic, stopCortanaMusic]);

  // Memoize placeholder text to prevent unnecessary re-renders
  const inputPlaceholder = useMemo(() => 
    isMobile ? "Type and press ENTER..." : "Type your message here and press ENTER...", 
    [isMobile]
  );

  // Memoize the enter key indicator style
  const enterKeyStyle = useMemo(() => ({ 
    color: terminalColors.amber, 
    fontSize: isMobile ? '0.7rem' : '0.8rem',
    marginLeft: isMobile ? '5px' : '10px',
    opacity: 0.7,
    display: isSmallScreen ? 'none' : 'inline'
  }), [isMobile, isSmallScreen]);

  return (
    <>
      <GlobalStyles />
      {currentPersona.id === 'cortana' && <CortanaGlowStyle />}
      <TerminalBackground />
      {currentPersona.id === 'cortana' && <CortanaBackground />}
      <TerminalContainer 
        $theme={theme} 
        style={{ 
          backgroundColor: currentPersona.id === 'cortana' ? 'rgba(0, 0, 0, 0.85)' : '',
        }}
        className={currentPersona.id === 'cortana' ? 'cortana-mode' : ''}
      >
        {isGLaDOSMode ? (
          <StillAlive onClose={closeGLaDOSMode} theme={theme} />
        ) : (
          <>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              loadingDots={loadingDots}
              isUserScrolling={isUserScrolling}
              setIsUserScrolling={setIsUserScrolling}
              onContainerClick={handleContainerClick}
              personaColor={theme === 'amber' ? themeColors.amber.text : 
                            theme === 'blue' ? themeColors.blue.text : 
                            themeColors.green.text}
              currentPersonaId={currentPersona.id}
            />
            
            <TerminalInput
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              isLoading={isLoading}
              isMobile={isMobile}
              isSmallScreen={isSmallScreen}
              enterKeyStyle={enterKeyStyle}
              theme={theme}
            />
            <StatusBar
              connectionStatus={connectionStatus}
              currentTime={currentTime}
              theme={theme}
            />
          </>
        )}
        <Scanlines $theme={theme} />
        <CRTEdge $theme={theme} />
      </TerminalContainer>
    </>
  );
};

export default memo(TerminalChat);
