# NyteChat Codebase Structure

This document provides an overview of the NyteChat project structure, showing the purpose of each file and folder. This serves as a reference for understanding the architecture and aids in navigating the codebase for future development.

## Root Directory

- `.env.local` - Environment variables for local development (contains API keys, not committed)
- `.env.local.example` - Example environment file showing required variables
- `eslint.config.mjs` - ESLint configuration for code linting
- `next.config.ts` - Next.js configuration file
- `package.json` - Project dependencies and scripts
- `postcss.config.mjs` - PostCSS configuration for CSS processing
- `README.md` - Project overview and documentation
- `start.sh` - Shell script to start the development server
- `TASKS.md` - Task list tracking development progress
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration

## Source Code (`/src`)

### App Structure (`/src/app`)

- `/src/app/layout.tsx` - Root layout component for the Next.js app
- `/src/app/page.tsx` - Main page component that renders the terminal interface
- `/src/app/globals.css` - Global CSS styles
- `/src/app/favicon.ico` - Website favicon

### API (`/src/api`)

- `/src/api/grok.ts` - Client-side API interface for communicating with the AI model
  
### API Routes (`/src/app/api`)

- `/src/app/api/chat/route.ts` - Server-side API route handler for chat functionality

### Components (`/src/components`)

- `/src/components/MessageList.tsx` - Displays chat messages including code blocks with copy functionality
- `/src/components/StatusBar.tsx` - Shows connection status and time information
- `/src/components/TerminalBackground.tsx` - Creates animated 3D background effects
- `/src/components/TerminalChat.tsx` - Main terminal chat interface that composes all other components
- `/src/components/TerminalInput.tsx` - Handles user input for messages
- `/src/components/TerminalPrompt.tsx` - Optional component for custom terminal prompts

### GLaDOS Easter Egg (`/src/components/GlaDOS`)

- `/src/components/GlaDOS/StillAlive.tsx` - Portal-themed "Still Alive" song animation with theme support

### Styles (`/src/styles`)

- `/src/styles/Terminal.styles.ts` - Styled components for terminal UI with theme support (green/amber)

### Library (`/src/lib`)

- `/src/lib/registry.tsx` - Registry for styled components with Next.js
- `/src/lib/personas.ts` - Defines the NYTEMODE AI persona's personality and characteristics
- `/src/lib/utils.ts` - Utility functions for common operations

## Public Assets (`/public`)

- `/public/still_alive.mp3` - "Still Alive" song audio file for GLaDOS mode
- `/public/terminal-icon.svg` - Terminal icon for the UI and favicon
- `/public/manifest.json` - Web app manifest file
- Various SVG files for UI elements

## Development Structure

### Key User Flows

1. **Chat Interaction**:
   - User input → `TerminalInput` → `TerminalChat` → API call to `grok.ts` → server route → AI response → `MessageList`

2. **Code Block Display**:
   - AI response → `MessageList` → `parseMessageContent` → `CodeBlockComponent` → rendered with copy button

3. **Hidden Easter Eggs**:
   - Special commands → `TerminalChat` → `handleBangCommand` → Activation of hidden features

4. **Theme Switching**:
   - `!green` or `!amber` command → `TerminalChat` → `handleBangCommand` → `setTheme` state update → styled components re-render with new theme

### Component Hierarchy

```
TerminalChat
├── TerminalBackground
├── MessageList
│   ├── MessageItem
│   │   └── CodeBlockComponent (for code blocks)
│   └── LoadingIndicator
├── TerminalInput
├── StatusBar
└── StillAlive (conditionally rendered)
```

### NYTEMODE AI Persona

The NYTEMODE AI has a defined personality with the following characteristics:

- Cyberpunk-themed AI assistant with expertise in technology and digital systems
- Direct and slightly informal communication style
- Includes subtle tech humor in responses
- Values efficiency and practical solutions
- Has a distinct character that helps create an engaging user experience
- Created by nytemode (nytemode.com)

The persona is implemented through a custom system prompt that shapes the AI's responses, giving it a consistent tone and style throughout conversations.

### Theme Implementation

The application supports two terminal themes:
- **Green**: Classic green terminal look (default)
- **Amber**: Retro amber/orange terminal aesthetic

Themes are implemented using:
- React state management for tracking current theme
- Styled-components with theme props for dynamic styling
- Theme-aware components that adapt their appearance
- Theme-specific color swapping for visual contrast
- Bang commands (`!green`, `!amber`) for user-controlled theme switching

Theme support extends to all components including:
- Main terminal interface
- Message display
- Input fields
- Status bar
- GLaDOS mode easter egg

## Last Updated

This document was last updated on: April 16, 2025 