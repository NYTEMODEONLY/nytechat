'use client';

import dynamic from 'next/dynamic';
import { GlobalTerminalStyle } from '../styles/Terminal.styles';

// Dynamically import the TerminalChat component with no SSR
const TerminalChat = dynamic(() => import('../components/TerminalChat'), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <GlobalTerminalStyle />
      <TerminalChat />
    </main>
  );
}
