import type { GuildTier, StreamPlatform, TrustTier } from '../types.ts';

export interface AutoFillResult {
  sourceId: string;
  name: string;
  platform: StreamPlatform;
  channel: string;
  guild: GuildTier;
  trustTier: TrustTier;
  originDomain: string;
  watchUrl: string;
  embedUrl: string;
  hlsUrl: string;
  boundaryTags: string;
  attestationNotes: string;
}

/**
 * Converts a raw slug or identifier into a human-readable title-cased display name.
 */
export function formatDisplayName(slug: string): string {
  if (!slug) return '';
  const trimmed = slug.trim();

  // Strip port if present e.g. stream.example.org:8080 -> stream.example.org
  const noPort = trimmed.replace(/:\d+$/, '');

  // If it's a domain name (e.g. stream.example.org)
  if (noPort.includes('.') && !noPort.includes(' ')) {
    const parts = noPort.split('.');
    if (parts.length > 1) {
      // Return capitalized hostname words, e.g. "Stream Example"
      const domainWords = parts
        .filter((p) => p !== 'www' && p !== 'com' && p !== 'org' && p !== 'net' && p !== 'tv' && p !== 'io' && p !== 'dev' && p !== 'app')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
      if (domainWords.length > 0) {
        return domainWords.join(' ');
      }
    }
  }

  // Handle snake_case and kebab-case
  let words = trimmed.replace(/[-_]+/g, ' ').trim();

  // Handle camelCase / PascalCase
  words = words.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Title case each word
  return words
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

/**
 * Parses any stream channel address, URL, host, or handle into fully resolved catalog fields.
 */
export function parseChannelAddress(
  rawAddress: string,
  preferredPlatform?: StreamPlatform,
): AutoFillResult | null {
  if (!rawAddress || typeof rawAddress !== 'string') return null;

  let input = rawAddress.trim();
  // Remove wrapping quotes or brackets if present
  input = input.replace(/^["'`<(\[]+|["'`>)\]]+$/g, '').trim();
  if (!input) return null;

  let detectedPlatform: StreamPlatform | null = null;
  let channelSlug = '';
  let originDomain = '';
  let protocol = 'https:';
  let explicitHlsUrl = '';
  let explicitEmbedUrl = '';
  let explicitWatchUrl = '';

  // 1. Explicit platform prefix: kick:channel, picarto:artist, owncast:stream.example.org, vdoninja:room, mock:test
  const prefixMatch = input.match(/^(kick|picarto|owncast|vdo-ninja|vdoninja|ninja|mock)[:/](.*)$/i);
  if (prefixMatch) {
    const rawPlat = prefixMatch[1].toLowerCase();
    detectedPlatform = (rawPlat === 'vdoninja' || rawPlat === 'ninja') ? 'vdo-ninja' : (rawPlat as StreamPlatform);
    input = prefixMatch[2].trim();
  }

  // 2. Pre-check for well-known platforms in input string
  const lower = input.toLowerCase();
  const isVdoNinja = lower.includes('vdo.ninja') || lower.includes('vdoninja');
  const isMock = lower.startsWith('mock') || lower.startsWith('test-pattern');
  const isPicarto = lower.includes('picarto.tv') || lower.includes('picarto');
  const isKick = lower.includes('kick.com') || lower.includes('player.kick.com') || (!isPicarto && !isVdoNinja && lower.startsWith('kick'));
  const isOwncast = lower.includes('owncast') || lower.includes('/embed/video') || lower.includes('/hls/stream.m3u8');

  if (isVdoNinja) {
    detectedPlatform = 'vdo-ninja';
    originDomain = 'vdo.ninja';
  } else if (isMock) {
    detectedPlatform = 'mock';
    originDomain = 'localhost';
  } else if (isPicarto) {
    detectedPlatform = 'picarto';
    originDomain = 'picarto.tv';
  } else if (isKick) {
    detectedPlatform = 'kick';
    originDomain = 'kick.com';
  } else if (isOwncast) {
    detectedPlatform = 'owncast';
  }

  // 3. Extract channelSlug and URLs if input looks like a URL or domain
  const hasScheme = /^https?:\/\//i.test(input);
  const candidateUrl = hasScheme ? input : (input.includes('.') || input.includes('/') ? `https://${input}` : '');

  if (candidateUrl) {
    try {
      const parsedUrl = new URL(candidateUrl);
      if (hasScheme) {
        protocol = parsedUrl.protocol;
      }
      const host = parsedUrl.hostname.toLowerCase();
      const path = parsedUrl.pathname;

      if (host === 'vdo.ninja' || host.endsWith('.vdo.ninja')) {
        detectedPlatform = 'vdo-ninja';
        originDomain = 'vdo.ninja';
        const roomParam = parsedUrl.searchParams.get('room') || parsedUrl.searchParams.get('view') || '';
        channelSlug = roomParam || path.replace(/^\//, '');
      } else if (host === 'picarto.tv' || host.endsWith('.picarto.tv')) {
        detectedPlatform = 'picarto';
        originDomain = 'picarto.tv';
        if (host.startsWith('edge') && path.includes('/stream/hls/')) {
          explicitHlsUrl = parsedUrl.toString();
          const match = path.match(/\/stream\/hls\/([^./?#]+)/i);
          if (match) channelSlug = match[1];
        } else {
          const segments = path.split('/').filter(Boolean);
          if (segments.length > 0) {
            if (segments[0] === 'streampopout') {
              channelSlug = segments[1] || '';
            } else {
              channelSlug = segments[0].replace(/^@/, '');
            }
          }
        }
      } else if (host === 'kick.com' || host.endsWith('.kick.com')) {
        detectedPlatform = 'kick';
        originDomain = 'kick.com';
        const segments = path.split('/').filter(Boolean);
        if (segments.length > 0) {
          if (segments[0] === 'video' && segments.length > 1) {
            channelSlug = segments[1].replace(/^@/, '');
          } else {
            channelSlug = segments[segments.length - 1].replace(/^@/, '');
          }
        }
        if (host === 'player.kick.com') {
          explicitEmbedUrl = parsedUrl.toString();
        }
      } else if (host && host.includes('.')) {
        // Custom domain / Owncast instance
        if (!detectedPlatform) {
          detectedPlatform = 'owncast';
        }
        originDomain = parsedUrl.host;
        if (path.includes('/embed/video')) {
          explicitEmbedUrl = parsedUrl.toString();
        } else if (path.includes('/hls/stream.m3u8') || path.endsWith('.m3u8')) {
          explicitHlsUrl = parsedUrl.toString();
        }
        channelSlug = parsedUrl.host;
        explicitWatchUrl = `${protocol}//${parsedUrl.host}`;
      }
    } catch {
      // Ignore URL parse error and fall back
    }
  }

  // 4. Fallback slug extraction if channelSlug is still empty
  if (!channelSlug) {
    if (detectedPlatform === 'vdo-ninja') {
      const match = input.match(/(?:vdo\.ninja\/(?:\?room=)?|vdo-ninja[:/]|ninja[:/]|vdoninja[:/])([^/?#\s&]+)/i);
      if (match && match[1]) {
        channelSlug = match[1].trim();
      } else if (input) {
        channelSlug = input.trim();
      }
    } else if (detectedPlatform === 'picarto') {
      const match = input.match(/(?:picarto\.tv\/(?:streampopout\/)?|picarto[:/])([^/?#\s]+)/i);
      if (match && match[1]) {
        channelSlug = match[1].replace(/^@/, '').trim();
      }
    } else if (detectedPlatform === 'kick') {
      const match = input.match(/(?:kick\.com\/(?:video\/)?|player\.kick\.com\/|kick[:/])([^/?#\s]+)/i);
      if (match && match[1]) {
        channelSlug = match[1].replace(/^@/, '').trim();
      }
    }
  }

  // Clean domain names from channelSlug if channelSlug ended up being just the platform domain
  if (['picarto.tv', 'www.picarto.tv', 'picarto', 'kick.com', 'www.kick.com', 'player.kick.com', 'kick'].includes(channelSlug.toLowerCase())) {
    channelSlug = '';
  }

  // 5. Final fallback for raw handles (e.g. "@artist", "gamer_pro")
  if (!channelSlug) {
    const rawClean = input
      .replace(/^(?:https?:\/\/)?(?:www\.)?(?:player\.)?(?:kick\.com|picarto\.tv)\/?/i, '')
      .replace(/^@/, '')
      .replace(/^\/+|\/+$/g, '')
      .split('?')[0]
      .split('#')[0]
      .split('/')[0]
      .trim();

    if (rawClean && !['picarto.tv', 'kick.com', 'www.picarto.tv', 'www.kick.com', 'player.kick.com', 'picarto', 'kick'].includes(rawClean.toLowerCase())) {
      channelSlug = rawClean;
    }
  }

  // Default platform if still undetected
  detectedPlatform = detectedPlatform || preferredPlatform || 'kick';

  if (detectedPlatform === 'picarto') {
    originDomain = 'picarto.tv';
  } else if (detectedPlatform === 'kick') {
    originDomain = 'kick.com';
  }

  // Determine display name, sourceId, and URLs
  const effectiveChannel = channelSlug.replace(/^@/, '').trim();
  let sourceId = '';
  let displayName = '';
  let watchUrl = explicitWatchUrl;
  let embedUrl = explicitEmbedUrl;
  let hlsUrl = explicitHlsUrl;
  let boundaryTags = 'community-verified, indie-screenings';
  let attestationNotes = '';

  if (detectedPlatform === 'kick') {
    sourceId = effectiveChannel ? `kick:${effectiveChannel}` : 'kick:stream';
    displayName = effectiveChannel ? formatDisplayName(effectiveChannel) : 'Kick Stream';
    watchUrl = watchUrl || (effectiveChannel ? `https://kick.com/${effectiveChannel}` : 'https://kick.com');
    embedUrl = embedUrl || (effectiveChannel ? `https://player.kick.com/${encodeURIComponent(effectiveChannel)}?autoplay=true&muted=false` : 'https://player.kick.com');
    hlsUrl = '';
    boundaryTags = 'kick, livestream, community-verified, indie-screenings';
    attestationNotes = effectiveChannel
      ? `Configured Kick channel via address parser: kick.com/${effectiveChannel}`
      : 'Configured Kick streaming origin via address parser: kick.com';
  } else if (detectedPlatform === 'picarto') {
    sourceId = effectiveChannel ? `picarto:${effectiveChannel}` : 'picarto:live';
    displayName = effectiveChannel ? formatDisplayName(effectiveChannel) : 'Picarto Live';
    watchUrl = watchUrl || (effectiveChannel ? `https://picarto.tv/${effectiveChannel}` : 'https://picarto.tv');
    embedUrl = embedUrl || (effectiveChannel ? `/api/proxy/picarto?channel=${encodeURIComponent(effectiveChannel)}` : '/api/proxy/picarto');
    hlsUrl = hlsUrl || (effectiveChannel ? `https://edge1-us-losangeles.picarto.tv/stream/hls/${encodeURIComponent(effectiveChannel)}.m3u8` : 'https://edge1-us-losangeles.picarto.tv/stream/hls');
    boundaryTags = 'picarto, live-art, community-verified, indie-screenings';
    attestationNotes = effectiveChannel
      ? `Configured Picarto channel via address parser: picarto.tv/${effectiveChannel}`
      : 'Configured Picarto streaming origin via address parser: picarto.tv';
  } else if (detectedPlatform === 'owncast') {
    originDomain = originDomain || effectiveChannel || 'stream.custom.org';
    const base = `${protocol}//${originDomain}`;
    sourceId = `owncast:${originDomain}`;
    displayName = effectiveChannel ? formatDisplayName(originDomain) : 'Owncast Stream';
    watchUrl = watchUrl || base;
    embedUrl = embedUrl || `${base}/embed/video`;
    hlsUrl = hlsUrl || `${base}/hls/stream.m3u8`;
    boundaryTags = 'owncast, federated, self-hosted, community-verified';
    attestationNotes = `Configured Owncast instance via address parser: ${originDomain}`;
  } else if (detectedPlatform === 'vdo-ninja') {
    const room = effectiveChannel || 'moviehell_test';
    sourceId = `vdo-ninja:${room}`;
    displayName = formatDisplayName(room) || 'VDO.Ninja Screening';
    watchUrl = `https://vdo.ninja/?room=${encodeURIComponent(room)}`;
    embedUrl = `https://vdo.ninja/?room=${encodeURIComponent(room)}&view=1&autoplay=1&cleanoutput=1&transparent=1`;
    hlsUrl = '';
    boundaryTags = 'vdo-ninja, webrtc, p2p, decentralized, community-verified';
    attestationNotes = `Configured VDO.Ninja P2P WebRTC room: ${room}`;
  } else if (detectedPlatform === 'mock') {
    sourceId = 'mock:test-pattern';
    displayName = 'Offline Test Pattern';
    watchUrl = '#';
    embedUrl = '';
    hlsUrl = '';
    boundaryTags = 'mock, offline, synthetic, test-pattern';
    attestationNotes = 'Synthetic SMPTE test pattern for offline verification.';
  }

  return {
    sourceId,
    name: displayName,
    platform: detectedPlatform,
    channel: effectiveChannel || (detectedPlatform === 'owncast' ? originDomain : ''),
    guild: 'guild_community',
    trustTier: 'trusted_member',
    originDomain,
    watchUrl,
    embedUrl,
    hlsUrl,
    boundaryTags,
    attestationNotes,
  };
}
