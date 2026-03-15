import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #1ed760 0%, #0c170f 55%, #070707 100%)',
          borderRadius: 40,
          color: '#ffffff',
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: '-0.08em',
        }}
      >
        <div
          style={{
            width: 124,
            height: 124,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 34,
            background: 'rgba(255,255,255,0.1)',
            border: '4px solid rgba(255,255,255,0.14)',
          }}
        >
          SS
        </div>
      </div>
    ),
    size
  );
}