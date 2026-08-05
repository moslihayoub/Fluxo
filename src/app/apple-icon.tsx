import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

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
          backgroundColor: '#18181b', // zinc-900
          borderRadius: '40px',
          color: 'white',
          fontSize: 80,
          fontWeight: 900,
          fontFamily: 'monospace',
          letterSpacing: '-3px'
        }}
      >
        FX
      </div>
    ),
    { ...size }
  )
}
