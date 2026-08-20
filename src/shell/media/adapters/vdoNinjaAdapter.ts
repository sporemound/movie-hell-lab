import type { MediaAdapter, MediaPlatform, MediaSource, MediaAdapterStatus } from '../adapter';

export interface VdoNinjaBroadcasterOptions {
  room: string;
  pushId?: string;
  screenshare?: boolean;
  webcam?: boolean;
  meshcast?: boolean;
  password?: string;
}

export interface VdoNinjaViewerOptions {
  room: string;
  viewId?: string;
  meshcast?: boolean;
  autoplay?: boolean;
  cleanOutput?: boolean;
  transparent?: boolean;
  password?: string;
}

/**
 * Generates a direct broadcaster studio URL for the screening host
 */
export function getVdoNinjaBroadcasterUrl(options: VdoNinjaBroadcasterOptions): string {
  const push = options.pushId || options.room || 'moviehell_auditorium';
  const params = new URLSearchParams({
    push,
    quality: '0',
    autostart: '1',
    cleanoutput: '1',
  });

  if (options.screenshare !== false) {
    params.set('screenshare', '1');
    params.set('systemaudio', '1');
  }
  if (options.webcam) params.set('webcam', '1');
  if (options.password) params.set('password', options.password);

  return `https://vdo.ninja/?${params.toString()}`;
}

/**
 * Generates a clean viewer embed URL for audience screening
 */
export function getVdoNinjaViewerUrl(options: VdoNinjaViewerOptions): string {
  const view = options.viewId || options.room || 'moviehell_auditorium';
  const params = new URLSearchParams({
    view,
    autostart: '1',
    autoplay: options.autoplay !== false ? '1' : '0',
    cleanoutput: options.cleanOutput !== false ? '1' : '0',
    transparent: '0',
    nocontrols: '1',
  });

  if (options.password) params.set('password', options.password);

  return `https://vdo.ninja/?${params.toString()}`;
}

/**
 * VDO.Ninja P2P WebRTC Media Adapter
 */
export class VdoNinjaAdapter implements MediaAdapter {
  readonly id = 'vdo-ninja';
  readonly name = 'VDO.Ninja P2P WebRTC';
  readonly platform: MediaPlatform = 'vdo-ninja';
  private status: MediaAdapterStatus = 'idle';

  getStatus(): MediaAdapterStatus {
    return this.status;
  }

  getEmbedUrl(source: MediaSource): string {
    const rawUrl = source.url?.trim() || '';

    if (rawUrl.includes('vdo.ninja')) {
      try {
        const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
        if (!parsed.searchParams.has('autoplay')) parsed.searchParams.set('autoplay', '1');
        if (!parsed.searchParams.has('cleanoutput')) parsed.searchParams.set('cleanoutput', '1');
        if (!parsed.searchParams.has('transparent')) parsed.searchParams.set('transparent', '1');
        return parsed.toString();
      } catch {
        return rawUrl;
      }
    }

    return getVdoNinjaViewerUrl({
      room: source.room || source.channel || rawUrl,
      viewId: source.channel || 'projectionist',
      password: source.password,
      autoplay: true,
      cleanOutput: true,
      transparent: true
    });
  }

  getBroadcastUrl(source: MediaSource): string {
    return getVdoNinjaBroadcasterUrl({
      room: source.room || source.channel || 'moviehell_auditorium',
      pushId: 'projectionist',
      password: source.password,
      screenshare: true,
      webcam: true
    });
  }
}

export const defaultVdoNinjaAdapter = new VdoNinjaAdapter();
