import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: 'black',
          fontSize: 32,
          fontWeight: 600,
          padding: 40,
          position: 'relative',
        }}
      >
        {/* Faint grid background */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: 'linear-gradient(#00aa00 0.5px, transparent 0.5px), linear-gradient(to right, #00aa00 0.5px, transparent 0.5px)',
            backgroundSize: '40px 40px',
            opacity: 0.1,
          }}
        />
        
        {/* Green scanlines overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'repeating-linear-gradient(transparent 0px, transparent 5px, rgba(0, 255, 0, 0.03) 5px, rgba(0, 255, 0, 0.03) 10px)',
            opacity: 0.7,
          }}
        />
        
        {/* Terminal icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            border: '4px solid #00ff00',
            borderRadius: 15,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: 60,
              fontWeight: 'bold',
            }}
          >
            {'_'}
          </div>
        </div>
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            fontSize: 70,
            fontFamily: 'monospace',
            color: '#00ff00',
            marginBottom: 20,
            letterSpacing: '-0.05em',
            textShadow: '0 0 10px rgba(0, 255, 0, 0.7)'
          }}
        >
          nytechat
        </div>
        
        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            fontFamily: 'monospace',
            color: '#00ff00',
            opacity: 0.8,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          retro terminal AI chat interface
        </div>
        
        {/* Footer with nytemode URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontFamily: 'monospace',
            color: '#00ff00',
            opacity: 0.6,
          }}
        >
          nytemode.com
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
} 