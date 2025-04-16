import { memo, useMemo } from 'react';
import { StatusLine } from '../styles/Terminal.styles';
import type { TerminalTheme } from '../styles/Terminal.styles';
import Image from 'next/image';
import Link from 'next/link';

interface StatusBarProps {
  connectionStatus: string;
  currentTime: string;
  isMobile?: boolean;
  isSmallScreen?: boolean;
  theme?: TerminalTheme;
}

const StatusBar = ({
  connectionStatus,
  currentTime,
  isMobile = false,
  isSmallScreen = false,
  theme = 'green'
}: StatusBarProps) => {
  // Memoize status items to prevent unnecessary re-renders
  const statusItems = useMemo(() => {
    return [
      !isSmallScreen && <span key="version">v1.0</span>,
      <span key="status">{isMobile ? 'S:' : 'STATUS:'} {connectionStatus}</span>,
      <span key="model">{isMobile ? 'M:' : 'MODEL:'} Grok-3</span>,
      <span key="time">{currentTime}</span>,
      <Link 
        href="https://nytemode.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        key="logo"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginLeft: 'auto',
          height: '100%'
        }}
      >
        <Image 
          src={theme === 'amber' ? "/nytemode-off-white50x.png" : "/nytemode-off-black50x.png"} 
          alt="nytemode logo" 
          width={isSmallScreen ? 30 : 40} 
          height={isSmallScreen ? 15 : 20}
          style={{ objectFit: 'contain' }}
        />
      </Link>
    ].filter(Boolean);
  }, [connectionStatus, currentTime, isMobile, isSmallScreen, theme]);

  return (
    <StatusLine $theme={theme}>
      {statusItems}
    </StatusLine>
  );
};

export default memo(StatusBar); 