import type { MediaAdapter, MediaPlatform, MediaSource, MediaAdapterStatus } from '../adapter';

/**
 * Offline Mock / Test Pattern Media Adapter
 * Generates an SVG/Canvas color-bars and test tone placeholder for isolated offline research.
 */
export class MockMediaAdapter implements MediaAdapter {
  readonly id = 'mock-adapter';
  readonly name = 'Synthetic Colorbars (Offline)';
  readonly platform: MediaPlatform = 'mock';

  getStatus(): MediaAdapterStatus {
    return 'connected';
  }

  getEmbedUrl(source: MediaSource): string {
    const title = encodeURIComponent(source.title || 'Movie Hell Test Pattern');
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <rect width="1280" height="720" fill="#121216"/>
        <!-- SMPTE-style Color Bars -->
        <rect x="0" y="0" width="182" height="480" fill="#c0c0c0"/>
        <rect x="182" y="0" width="182" height="480" fill="#c0c000"/>
        <rect x="364" y="0" width="182" height="480" fill="#00c0c0"/>
        <rect x="546" y="0" width="182" height="480" fill="#00c000"/>
        <rect x="728" y="0" width="182" height="480" fill="#c000c0"/>
        <rect x="910" y="0" width="182" height="480" fill="#c00000"/>
        <rect x="1092" y="0" width="188" height="480" fill="#0000c0"/>
        <!-- Bottom Banner -->
        <rect x="0" y="480" width="1280" height="240" fill="#090a0f"/>
        <text x="640" y="580" fill="#ffffff" font-family="system-ui, sans-serif" font-size="32" font-weight="700" text-anchor="middle">
          🎬 ${decodeURIComponent(title)}
        </text>
        <text x="640" y="630" fill="#ffb703" font-family="monospace" font-size="20" text-anchor="middle">
          UNIFLORA RESEARCH SHELL — RECOGNIZE AUTONOMY
        </text>
      </svg>
    `.trim();

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}

export const defaultMockMediaAdapter = new MockMediaAdapter();
