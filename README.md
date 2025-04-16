# NyteChat - Retro AI Chat Interface

A retro terminal-style chat interface for conversing with NYTEMODE AI, inspired by late 1970s and early 1980s black-screen terminals. The application features a full-screen immersive experience with visual effects like scanlines, CRT edges, and a monochrome green-on-black color scheme.

## Features

- Full-screen chat interface with retro terminal aesthetics
- Animated typing effect for AI responses
- Visual effects including scanlines, screen flicker, and CRT-like edges
- Three.js background animations
- Integration with xAI's API for NYTEMODE AI conversations
- Responsive design with mobile support
- Boot sequence animation

## Technologies Used

- Next.js for the framework
- React for UI components
- TypeScript for type safety
- Three.js and React Three Fiber for 3D effects
- Styled Components for styling
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- An API key for xAI's API (format: xai-xxxxxxxx...)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nytechat.git
   cd nytechat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API credentials:
   ```
   NEXT_PUBLIC_GROK_API_KEY=xai-your-api-key-here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   Alternatively, use the built-in development script with a test API key:
   ```bash
   npm run start:dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment on Vercel

This project is configured for easy deployment on Vercel:

1. Fork this repository to your GitHub account.

2. Create a new project on [Vercel](https://vercel.com).

3. Link the GitHub repository to your Vercel project.

4. Configure the environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_GROK_API_KEY`: Your xAI API key

5. Deploy the project.

## Customization

You can customize the retro terminal appearance by modifying the color variables in `src/styles/Terminal.styles.ts`:

```typescript
export const terminalColors = {
  bg: '#000000',
  text: '#00ff00', // Classic green terminal color
  amber: '#ffb000', // Amber terminal color option
  highlight: '#00aa00',
  dimmed: '#007700',
  scanline: 'rgba(0, 255, 0, 0.1)',
  cursor: '#00ff00',
};
```

Change `text` to `amber` for an amber-on-black terminal look or customize with your preferred colors.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by retro computer terminals from the late 1970s and early 1980s
- Built with Next.js and React
- xAI's API for the NYTEMODE AI capabilities
