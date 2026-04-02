import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
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
          background: '#111318',
          color: '#C5B358',
          fontSize: '24px',
          fontFamily: 'serif',
          fontWeight: 'bold',
          borderRadius: '6px',
          border: '1px solid #4B4738',
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
