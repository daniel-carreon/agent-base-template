import { ImageResponse } from 'next/og';
import { Bot } from 'lucide-react';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Icon component
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          borderRadius: '8px',
        }}
      >
        <Bot size={24} />
      </div>
    ),
    {
      ...size,
    }
  );
}
