/**
 * Universal Media Adapter Interface
 * 
 * In accordance with Rebuild Context Section 14:
 * "Media hosting provider = adapter, not the platform."
 */

export type MediaPlatform =
  | 'vdo-ninja'
  | 'native-hls'
  | 'mock'
  | 'owncast'
  | 'peertube'
  | 'livepeer'
  | 'mediamtx'
  | 'custom-embed';

export interface MediaSource {
  platform: MediaPlatform;
  url: string;
  channel?: string;
  room?: string;
  password?: string;
  title?: string;
  isHost?: boolean;
}

export type MediaAdapterStatus = 'idle' | 'connecting' | 'connected' | 'buffering' | 'error';

export interface MediaAdapterEventMap {
  status: (status: MediaAdapterStatus) => void;
  error: (error: Error) => void;
  epochChange: (epoch: number) => void;
}

export interface MediaAdapter {
  readonly id: string;
  readonly name: string;
  readonly platform: MediaPlatform;
  getStatus(): MediaAdapterStatus;
  getEmbedUrl(source: MediaSource): string;
  getBroadcastUrl?(source: MediaSource): string;
  attach?(container: HTMLElement): Promise<void>;
  detach?(): Promise<void>;
}
