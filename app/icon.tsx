import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at top, #1ed760 0%, #0f1210 54%, #070707 100%)',
          color: '#ffffff',
          fontSize: 150,
          fontWeight: 800,
          letterSpacing: '-0.08em',
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 96,
            border: '10px solid rgba(255,255,255,0.12)',
            boxShadow: '0 0 80px rgba(29,185,84,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
          }}
        >
          SS
        </div>
      </div>
    ),
    size
  );
}