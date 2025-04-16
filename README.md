# NyteChat - Retro Terminal AI Interface

> _"NOCTURNAL BY PREFERENCE."_

A cyberpunk terminal-style chat interface that resurrects the aesthetic of vintage computing while harnessing the power of modern AI. NyteChat features an immersive full-screen experience with authentic terminal visuals: scanlines, CRT screen effects, phosphor glow, and multiple color themes.

![NyteChat Interface](https://nytechat-4etp923hg-violetmyst.vercel.app)

## ACCESS: GRANTED

NyteChat now running at: [https://nytechat-4etp923hg-violetmyst.vercel.app](https://nytechat-4etp923hg-violetmyst.vercel.app)

## CORE SYSTEMS

- **Retro Terminal Interface** — Authentic CRT display emulation with scanlines, edge effects, and subtle flicker
- **Multiple Theme Support** — Classic green phosphor and amber terminals (!green, !amber commands)
- **AI Personas** — nytemode and Cortana personalities with unique styles (!nyte, !cortana commands)
- **Command System** — Built-in terminal commands with help documentation (!help)
- **Portal Easter Egg** — Complete GLaDOS "Still Alive" sequence (!stillalive command)
- **Markdown Rendering** — Live markdown with syntax highlighting and code blocks
- **Copy-Enabled Code Blocks** — One-click copying for code snippets
- **Responsive Design** — Adaptive mobile experience with custom layouts
- **Offline Mode** — Star Fox 64 reference when connection fails ("I can't let you do that, Starfox")
- **3D Background Effects** — Subtle depth using ThreeJS particles
- **Boot Sequence** — Authentic terminal boot visualization

## TERMINAL COMMANDS

```
COMMAND        DESCRIPTION
-------        -----------
!help          Show this help message
!info          Show information about NyteChat
!clear         Clear the chat history
!time          Display current system time
!status        Show connection status
!green         Switch to green terminal theme
!amber         Switch to amber terminal theme
!nyte          Switch to nytemode AI persona
!cortana       Switch to Cortana AI persona
!stillalive    Activate GLaDOS mode
!nytemode      Display creator information
```

## TECHNICAL SPECIFICATIONS

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5+
- **Rendering**: React with Server Components
- **Styling**: Styled Components with ThemeProvider
- **3D Effects**: Three.js with React Three Fiber
- **AI Integration**: xAI Backend API
- **Deployment**: Vercel Edge Runtime

## SYSTEM INITIALIZATION

### PREREQUISITES

- Node.js 18.0.0+
- xAI API key (format: `xai-xxxxxxxx...`)

### INSTALLATION SEQUENCE

1. Clone the repository:
   ```bash
   git clone https://github.com/NYTEMODEONLY/nytechat.git
   cd nytechat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your API credentials:
   ```
   NEXT_PUBLIC_GROK_API_KEY=xai-your-api-key-here
   ```

4. Initialize development environment:
   ```bash
   npm run dev
   ```
   
   Alternatively, use the built-in script:
   ```bash
   ./start.sh
   ```

5. Access terminal at [http://localhost:3000](http://localhost:3000)

## DEPLOYMENT PROTOCOL

NyteChat is optimized for deployment on Vercel:

1. Fork this repository
2. Connect to Vercel
3. Configure environmental variables:
   - `NEXT_PUBLIC_GROK_API_KEY`: Your xAI API key
4. Deploy

## ARCHITECTURE

```
TerminalChat
├── TerminalBackground  # 3D particle system
├── MessageList         # Message rendering with code blocks
│   ├── MessageItem     # Individual message component
│   └── LoadingIndicator # Animated loading indicator
├── TerminalInput       # User input field with command processing
├── StatusBar           # Connection status and system time
└── StillAlive          # GLaDOS Easter Egg (conditionally rendered)
```

## SYSTEM CUSTOMIZATION

Theme switching is built-in using the `!green` and `!amber` commands. Additional customization is possible by modifying `src/styles/Terminal.styles.ts`.

## PENDING UPGRADES

- Unit test implementation
- CI/CD pipeline configuration
- Audio feedback for typing and notifications
- Additional keyboard shortcuts
- Conversation history recall system
- More terminal commands
- ASCII art animations
- Speech recognition capabilities
- Multi-language support

## SECURITY CLEARANCE

This project is licensed under the MIT License.

## CREATOR CREDENTIALS

Built by [nytemode](https://nytemode.com) — Developer, designer, and digital creator who thrives in the late hours when the world sleeps and creative focus peaks. Expertise spans web development, e-commerce, AI integration, and blockchain technologies.

---

_"Connection established. Type your message and press ENTER to communicate with nytemode AI."_
