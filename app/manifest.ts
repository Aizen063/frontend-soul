import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Soul Sound',
    short_name: 'Soul Sound',
    description: 'Install Soul Sound for a fast, app-like music streaming experience on mobile.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#070707',
    theme_color: '#070707',
    categories: ['music', 'entertainment'],
    lang: 'en',
    icons: [
      {
        src: '/Applogo.png',
        sizes: '2816x1536',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Applogo.png',
        sizes: '2816x1536',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}