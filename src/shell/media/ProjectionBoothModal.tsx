import { useState, useEffect } from 'react';
import type { StreamListing, StreamPlatform } from '../../types';
import { parseChannelAddress } from '../../utils/channelParser';
import { getVdoNinjaBroadcasterUrl, getVdoNinjaViewerUrl } from './adapters/vdoNinjaAdapter';

export interface ProjectionBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStream: (stream: StreamListing) => void;
  currentStream: StreamListing | null;
  roomId?: string;
  roomName?: string;
}

export function ProjectionBoothModal({
  isOpen,
  onClose,
  onSelectStream,
  currentStream,
  roomId = 'auditorium',
  roomName = 'Auditorium'
}: ProjectionBoothModalProps) {
  const [activeTab, setActiveTab] = useState<'vdoninja' | 'mediamtx' | 'cloudflare' | 'platforms' | 'test'>('vdoninja');
  
  const cleanRoomId = (roomId || 'auditorium').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  
  // High-entropy Broadcaster Secret Token (Unique to this room session to prevent hijacking on public servers)
  const [sessionSecret, setSessionSecret] = useState(() => `${Math.random().toString(36).substring(2, 9)}_${Math.random().toString(36).substring(2, 6)}`);
  
  // VDO.Ninja Stream Token (Room Scoped + Secret)
  const [streamToken, setStreamToken] = useState(() => `${cleanRoomId}_${sessionSecret}`);
  
  // MediaMTX Configuration (Room Scoped + Secret)
  const [mtxHost, setMtxHost] = useState('localhost');
  const [mtxStreamPath, setMtxStreamPath] = useState(() => `live/${cleanRoomId}_${sessionSecret}`);
  const [mtxWebRtcPort, setMtxWebRtcPort] = useState('8889');
  const [useNinjaRelay, setUseNinjaRelay] = useState(true);

  // Sync token and path whenever sessionSecret or roomId changes
  const handleRegenerateSecret = () => {
    const newSecret = `${Math.random().toString(36).substring(2, 9)}_${Math.random().toString(36).substring(2, 6)}`;
    setSessionSecret(newSecret);
    setStreamToken(`${cleanRoomId}_${newSecret}`);
    setMtxStreamPath(`live/${cleanRoomId}_${newSecret}`);
  };

  useEffect(() => {
    setStreamToken(`${cleanRoomId}_${sessionSecret}`);
    setMtxStreamPath(`live/${cleanRoomId}_${sessionSecret}`);
  }, [cleanRoomId, sessionSecret]);

  // Cloudflare Stream Configuration
  const [cfCustomerDomain, setCfCustomerDomain] = useState('');
  const [cfStreamId, setCfStreamId] = useState('');

  // Platform Channel Configuration
  const [platformType, setPlatformType] = useState<StreamPlatform>('picarto');
  const [platformChannel, setPlatformChannel] = useState('');
  const [platformError, setPlatformError] = useState('');

  // Feedback copy states
  const [copiedMtxServer, setCopiedMtxServer] = useState(false);
  const [copiedMtxKey, setCopiedMtxKey] = useState(false);
  const [copiedCfServer, setCopiedCfServer] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Custom / RTMP input state
  const [customAddress, setCustomAddress] = useState('');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  // 1. VDO.Ninja URLs (Direct P2P Token - zero room tiles/prompts)
  const vdoBroadcasterUrl = getVdoNinjaBroadcasterUrl({
    pushId: streamToken,
    room: streamToken,
    screenshare: true,
    webcam: false,
  });

  const vdoViewerUrl = getVdoNinjaViewerUrl({
    viewId: streamToken,
    room: streamToken,
    autoplay: true,
    cleanOutput: true,
  });

  // 2. MediaMTX URLs
  const cleanMtxHost = mtxHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'localhost';
  const cleanMtxPath = mtxStreamPath.trim().replace(/^\//, '') || `live/${cleanRoomId}_${sessionSecret}`;
  const mtxRtmpServer = `rtmp://${cleanMtxHost}:1935/${cleanMtxPath.split('/')[0] || 'live'}`;
  const mtxRtmpKey = cleanMtxPath.split('/').slice(1).join('/') || `${cleanRoomId}_${sessionSecret}`;
  
  // MediaMTX WebRTC URL (via direct HTTP or VDO.Ninja HTTPS relay to avoid browser Mixed Content blocks)
  const mtxDirectUrl = `http://${cleanMtxHost}:${mtxWebRtcPort}/${cleanMtxPath}`;
  const mtxNinjaRelayUrl = `https://vdo.ninja/?view=${encodeURIComponent(cleanMtxPath)}&mediamtx=${encodeURIComponent(cleanMtxHost)}:${encodeURIComponent(mtxWebRtcPort)}&cleanoutput=1&autoplay=1&autostart=1&nocontrols=1`;

  // 3. Cloudflare Stream URLs
  const cfRtmpsServer = 'rtmps://live.cloudflare.com:443/live/';
  const cleanCfDomain = cfCustomerDomain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const cleanCfId = cfStreamId.trim();
  const cfPlayerUrl = cleanCfDomain && cleanCfId ? `https://${cleanCfDomain}/${cleanCfId}/iframe` : '';
  const cfHlsUrl = cleanCfDomain && cleanCfId ? `https://${cleanCfDomain}/${cleanCfId}/manifest/video.m3u8` : '';

  // HANDLERS
  const handleProjectVdoNinja = () => {
    const listing: StreamListing = {
      id: `vdo-ninja:room-${streamToken}`,
      platform: 'vdo-ninja',
      channel: streamToken,
      name: `${roomName} Screening (${cleanRoomId})`,
      description: `Live VDO.Ninja Broadcast for Room #${cleanRoomId}`,
      watchUrl: vdoBroadcasterUrl,
      embedUrl: vdoViewerUrl,
      status: 'live',
      viewers: 1,
      currentTitle: `Live Screening in ${roomName}`,
      mature: false
    };

    onSelectStream(listing);
    onClose();
  };

  const handleProjectMediaMtx = () => {
    const targetEmbedUrl = useNinjaRelay ? mtxNinjaRelayUrl : mtxDirectUrl;
    const listing: StreamListing = {
      id: `mediamtx:${cleanMtxPath}`,
      platform: 'mediamtx',
      channel: cleanMtxPath,
      name: `MediaMTX Stream (${roomName})`,
      description: `RTMP Stream Key Ingest for Room #${cleanRoomId}`,
      watchUrl: targetEmbedUrl,
      embedUrl: targetEmbedUrl,
      status: 'live',
      viewers: 1,
      currentTitle: `Live Screening in ${roomName}`,
      mature: false
    };

    onSelectStream(listing);
    onClose();
  };

  const handleProjectCloudflare = () => {
    if (!cleanCfDomain || !cleanCfId) {
      return;
    }
    const listing: StreamListing = {
      id: `cloudflare:${cleanCfId}`,
      platform: 'cloudflare',
      channel: cleanCfId,
      name: `Cloudflare Stream (${cleanCfId.substring(0, 8)})`,
      description: `Global Anycast Stream for Room #${cleanRoomId}`,
      watchUrl: cfPlayerUrl,
      embedUrl: cfPlayerUrl,
      hlsUrl: cfHlsUrl,
      status: 'live',
      viewers: 1,
      currentTitle: `Live Screening in ${roomName}`,
      mature: false
    };

    onSelectStream(listing);
    onClose();
  };

  const handleProjectPlatform = () => {
    if (!platformChannel.trim()) {
      setPlatformError('Please enter a channel name or URL.');
      return;
    }

    const cleanChannel = platformChannel.trim().replace(/^@/, '');
    const id = `${platformType}:${cleanChannel.toLowerCase()}`;
    let embedUrl = '';
    let watchUrl = '';

    if (platformType === 'picarto') {
      embedUrl = `/api/proxy/picarto?channel=${encodeURIComponent(cleanChannel)}`;
      watchUrl = `https://picarto.tv/${encodeURIComponent(cleanChannel)}`;
    } else if (platformType === 'kick') {
      embedUrl = `https://player.kick.com/${encodeURIComponent(cleanChannel)}?autoplay=true&muted=false`;
      watchUrl = `https://kick.com/${encodeURIComponent(cleanChannel)}`;
    } else if (platformType === 'twitch') {
      embedUrl = `https://player.twitch.tv/?channel=${encodeURIComponent(cleanChannel)}&parent=${window.location.hostname}&autoplay=true&muted=false`;
      watchUrl = `https://twitch.tv/${encodeURIComponent(cleanChannel)}`;
    }

    const listing: StreamListing = {
      id,
      platform: platformType,
      channel: cleanChannel,
      name: `${cleanChannel} on ${platformType.toUpperCase()}`,
      description: `Live ${platformType.toUpperCase()} Stream in ${roomName}`,
      watchUrl,
      embedUrl,
      status: 'live',
      viewers: null,
      currentTitle: `${cleanChannel}'s Live Screening`,
      mature: false
    };

    onSelectStream(listing);
    onClose();
  };

  const handleProjectTestPattern = () => {
    const listing: StreamListing = {
      id: 'mock:test-pattern',
      platform: 'mock',
      channel: 'test-pattern',
      name: 'Offline Test Pattern',
      description: 'Synthetic SMPTE Test Bars & Calibration',
      watchUrl: '#',
      embedUrl: '',
      status: 'live',
      viewers: null,
      currentTitle: 'SMPTE Calibration Pattern',
      mature: false
    };
    onSelectStream(listing);
    onClose();
  };

  const copyToClipboard = async (text: string, setSuccess: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Determine active stream ID for friend invite link
  let activeStreamId = currentStream?.id;
  if (!activeStreamId) {
    if (activeTab === 'vdoninja') activeStreamId = `vdo-ninja:room-${streamToken}`;
    else if (activeTab === 'mediamtx') activeStreamId = `mediamtx:${cleanMtxPath}`;
    else activeStreamId = 'mock:test-pattern';
  }

  const friendInviteUrl = `${window.location.origin}/?room=${encodeURIComponent(cleanRoomId)}&stream=${encodeURIComponent(activeStreamId)}`;

  return (
    <div className="projection-booth-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="projection-booth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="booth-header">
          <div className="booth-title-group">
            <span className="booth-icon">📽️</span>
            <div>
              <h3>Projection Booth — Room #{cleanRoomId}</h3>
              <p className="booth-subtitle">Broadcasting securely to <strong>{roomName}</strong></p>
            </div>
          </div>
          <button type="button" className="booth-close-btn" onClick={onClose} aria-label="Close projection booth">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="booth-tabs">
          <button
            type="button"
            className={`booth-tab ${activeTab === 'vdoninja' ? 'active' : ''}`}
            onClick={() => setActiveTab('vdoninja')}
          >
            🖥️ VDO.Ninja (Screen &amp; Audio)
          </button>
          <button
            type="button"
            className={`booth-tab ${activeTab === 'mediamtx' ? 'active' : ''}`}
            onClick={() => setActiveTab('mediamtx')}
          >
            ⚡ MediaMTX (RTMP → WebRTC)
          </button>
          <button
            type="button"
            className={`booth-tab ${activeTab === 'cloudflare' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloudflare')}
          >
            ☁️ Cloudflare Stream
          </button>
          <button
            type="button"
            className={`booth-tab ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveTab('platforms')}
          >
            🎮 Picarto / Kick
          </button>
          <button
            type="button"
            className={`booth-tab booth-tab-alt ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
          >
            📺 Test Pattern
          </button>
        </div>

        {/* Tab Content */}
        <div className="booth-content">
          {/* TAB 1: VDO.NINJA SCREEN & SYSTEM AUDIO */}
          {activeTab === 'vdoninja' && (
            <div className="booth-browser-section">
              <div className="booth-instruction-card">
                <p className="booth-step-title">🖥️ VDO.Ninja Direct Screen &amp; System Audio (Zero Plugins / 1080p 60FPS):</p>
                <ol className="booth-steps-list">
                  <li>Click <strong>🚀 1. Launch Broadcaster Studio</strong> below (opens in new tab).</li>
                  <li>In the browser popup, select your <strong>OBS Fullscreen / Media Player Window</strong>.</li>
                  <li>Ensure <strong>"Share system audio"</strong> checkbox is checked.</li>
                  <li>Come back and click <strong>🎬 2. Project Stream to Stage</strong>.</li>
                </ol>
              </div>

              <div className="booth-field-group">
                <div className="booth-label-row">
                  <label>Room Broadcaster Token: <code>{streamToken}</code></label>
                  <button
                    type="button"
                    className="booth-btn-tiny"
                    onClick={handleRegenerateSecret}
                    title="Generate a new secret token to prevent anyone from hijacking your stream key"
                  >
                    🎲 Re-roll Secret Token
                  </button>
                </div>
                <p className="booth-note-text" style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                  🔒 <em>This key contains a secret token scoped to #{cleanRoomId} so other viewers cannot override your broadcast.</em>
                </p>
              </div>

              <div className="booth-action-grid">
                <button
                  type="button"
                  className="booth-btn-primary"
                  onClick={() => window.open(vdoBroadcasterUrl, '_blank', 'noopener,noreferrer')}
                >
                  🚀 1. Launch Broadcaster Studio (New Tab)
                </button>
                <button
                  type="button"
                  className="booth-btn-gold"
                  onClick={handleProjectVdoNinja}
                >
                  🎬 2. Project Stream to Stage
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIAMTX (RTMP -> WEBRTC WHEP) */}
          {activeTab === 'mediamtx' && (
            <div className="booth-obs-section">
              <div className="booth-instruction-card">
                <p className="booth-step-title">⚡ MediaMTX Media Router (Standard OBS RTMP → Sub-Second WebRTC):</p>
                <p style={{ fontSize: '0.85rem', color: '#e4e4e7', marginBottom: '0.6rem' }}>
                  MediaMTX is a free, portable standalone server (zero install required). Running <code>mediamtx.exe</code> allows OBS to stream standard RTMP with full audio &amp; video while Movie Hell plays sub-second WebRTC WHEP on stage.
                </p>
                <div style={{ marginBottom: '0.8rem' }}>
                  <a
                    href="https://github.com/bluenviron/mediamtx/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="booth-btn-primary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                  >
                    📥 1. Download MediaMTX for Windows (GitHub) ↗
                  </a>
                </div>
                <ol className="booth-steps-list">
                  <li>Extract the zip and double-click <strong><code>mediamtx.exe</code></strong> (a terminal opens).</li>
                  <li>In OBS, set <strong>Service</strong> to <code>Custom...</code></li>
                  <li>Copy &amp; paste the <strong>Server</strong> and <strong>Stream Key</strong> below into OBS.</li>
                  <li>In OBS, click <strong>Start Streaming</strong> (*uses standard indestructible RTMP*).</li>
                  <li>Click <strong>🎬 Project MediaMTX Stream to Stage</strong> below.</li>
                </ol>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label htmlFor="mtx-host-input" style={{ fontSize: '0.85rem' }}>MediaMTX Host / IP</label>
                  <input
                    id="mtx-host-input"
                    type="text"
                    value={mtxHost}
                    onChange={(e) => setMtxHost(e.target.value)}
                    placeholder="localhost or 192.168.1.50"
                  />
                </div>
                <div>
                  <div className="booth-label-row">
                    <label htmlFor="mtx-path-input" style={{ fontSize: '0.85rem' }}>Stream Path</label>
                    <button
                      type="button"
                      className="booth-btn-tiny"
                      onClick={handleRegenerateSecret}
                      title="Generate new secret stream key"
                    >
                      🎲 Re-roll
                    </button>
                  </div>
                  <input
                    id="mtx-path-input"
                    type="text"
                    value={mtxStreamPath}
                    onChange={(e) => setMtxStreamPath(e.target.value)}
                    placeholder={`live/${cleanRoomId}_secret`}
                  />
                </div>
              </div>

              {/* HTTPS WebRTC Relay Toggle */}
              <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="mtx-relay-toggle"
                  checked={useNinjaRelay}
                  onChange={(e) => setUseNinjaRelay(e.target.checked)}
                />
                <label htmlFor="mtx-relay-toggle" style={{ fontSize: '0.82rem', cursor: 'pointer', color: '#ffb703' }}>
                  Enable <strong>HTTPS WebRTC Relay</strong> (Recommended on secure <code>https://</code> domains like Cloudflare Workers)
                </label>
              </div>

              {/* OBS RTMP Server */}
              <div className="booth-field-group">
                <label htmlFor="mtx-rtmp-server">1. OBS RTMP Server</label>
                <div className="booth-copy-field">
                  <input
                    id="mtx-rtmp-server"
                    type="text"
                    readOnly
                    value={mtxRtmpServer}
                    className="code-font"
                  />
                  <button
                    type="button"
                    className="booth-btn-copy-inline"
                    onClick={() => copyToClipboard(mtxRtmpServer, setCopiedMtxServer)}
                  >
                    {copiedMtxServer ? '✅ Copied' : '📋 Copy Server'}
                  </button>
                </div>
              </div>

              {/* OBS Stream Key */}
              <div className="booth-field-group">
                <label htmlFor="mtx-rtmp-key">2. OBS Stream Key (Secret Broadcaster Key for #{cleanRoomId})</label>
                <div className="booth-copy-field">
                  <input
                    id="mtx-rtmp-key"
                    type="text"
                    readOnly
                    value={mtxRtmpKey}
                    className="code-font"
                  />
                  <button
                    type="button"
                    className="booth-btn-copy-inline"
                    onClick={() => copyToClipboard(mtxRtmpKey, setCopiedMtxKey)}
                  >
                    {copiedMtxKey ? '✅ Copied' : '📋 Copy Key'}
                  </button>
                </div>
                <p className="booth-note-text" style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '0.3rem' }}>
                  🔒 <em>This secret key ensures only your OBS can broadcast to this room.</em>
                </p>
              </div>

              <div className="booth-action-row">
                <button
                  type="button"
                  className="booth-btn-gold booth-btn-large"
                  onClick={handleProjectMediaMtx}
                >
                  🎬 Project MediaMTX Stream to Stage
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUDFLARE STREAM GLOBAL INGEST */}
          {activeTab === 'cloudflare' && (
            <div className="booth-obs-section">
              <div className="booth-instruction-card">
                <p className="booth-step-title">☁️ Cloudflare Stream (Global Anycast Ingest &amp; TURN Relays):</p>
                <ol className="booth-steps-list">
                  <li>In OBS, set <strong>Service</strong> to <code>Custom...</code>.</li>
                  <li>Set <strong>Server</strong> to <code>rtmps://live.cloudflare.com:443/live/</code>.</li>
                  <li>Paste your Cloudflare Live Input <strong>Stream Key</strong> into OBS.</li>
                  <li>Enter your Customer Subdomain &amp; Live Input ID below, then click Project.</li>
                </ol>
              </div>

              <div className="booth-field-group">
                <label htmlFor="cf-rtmps-server">1. OBS RTMPS Server</label>
                <div className="booth-copy-field">
                  <input
                    id="cf-rtmps-server"
                    type="text"
                    readOnly
                    value={cfRtmpsServer}
                    className="code-font"
                  />
                  <button
                    type="button"
                    className="booth-btn-copy-inline"
                    onClick={() => copyToClipboard(cfRtmpsServer, setCopiedCfServer)}
                  >
                    {copiedCfServer ? '✅ Copied' : '📋 Copy Server'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label htmlFor="cf-domain-input" style={{ fontSize: '0.85rem' }}>Customer Subdomain</label>
                  <input
                    id="cf-domain-input"
                    type="text"
                    value={cfCustomerDomain}
                    onChange={(e) => setCfCustomerDomain(e.target.value)}
                    placeholder="customer-xxxx.cloudflarestream.com"
                  />
                </div>
                <div>
                  <label htmlFor="cf-id-input" style={{ fontSize: '0.85rem' }}>Live Stream ID</label>
                  <input
                    id="cf-id-input"
                    type="text"
                    value={cfStreamId}
                    onChange={(e) => setCfStreamId(e.target.value)}
                    placeholder="e.g. 5d5380d4e430460f60f1d2003c1022ec"
                  />
                </div>
              </div>

              <div className="booth-action-row">
                <button
                  type="button"
                  className="booth-btn-gold booth-btn-large"
                  disabled={!cleanCfDomain || !cleanCfId}
                  onClick={handleProjectCloudflare}
                >
                  🎬 Project Cloudflare Stream to Stage
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PICARTO / KICK / TWITCH */}
          {activeTab === 'platforms' && (
            <div className="booth-custom-section">
              <div className="booth-instruction-card">
                <p className="booth-step-title">🎮 Stream Platforms (Picarto / Kick / Twitch):</p>
                <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: 0 }}>
                  Stream with your channel stream key in OBS, then embed the live broadcast on the Movie Hell stage in #{cleanRoomId}.
                </p>
              </div>

              <div className="booth-field-group">
                <label htmlFor="platform-select">Select Platform</label>
                <select
                  id="platform-select"
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value as StreamPlatform)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    background: '#16161d',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    marginBottom: '0.8rem'
                  }}
                >
                  <option value="picarto">Picarto.tv</option>
                  <option value="kick">Kick.com</option>
                  <option value="twitch">Twitch.tv</option>
                </select>

                <label htmlFor="platform-channel">Channel Name or Slug</label>
                <input
                  id="platform-channel"
                  type="text"
                  value={platformChannel}
                  onChange={(e) => {
                    setPlatformChannel(e.target.value);
                    setPlatformError('');
                  }}
                  placeholder="e.g. channel_slug"
                />
                {platformError && <p className="booth-error">{platformError}</p>}
              </div>

              <button
                type="button"
                className="booth-btn-gold"
                onClick={handleProjectPlatform}
              >
                🎬 Project {platformType.toUpperCase()} Stream to Stage
              </button>
            </div>
          )}

          {/* TAB 5: TEST PATTERN */}
          {activeTab === 'test' && (
            <div className="booth-test-section">
              <p className="booth-note-text">
                Verify stage audio, video playback, and curtain transitions using the offline SMPTE test pattern in #{cleanRoomId}.
              </p>
              <button
                type="button"
                className="booth-btn-gold"
                onClick={handleProjectTestPattern}
              >
                📺 Project SMPTE Test Pattern
              </button>
            </div>
          )}

          {/* FOOTER: PRIVATE FRIEND INVITE LINK */}
          <div className="booth-invite-row" style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="booth-btn-copy"
              onClick={() => copyToClipboard(friendInviteUrl, setCopiedInvite)}
            >
              {copiedInvite ? '✅ Private Screening Link Copied!' : `📋 Copy Private Screening Link for #${cleanRoomId}`}
            </button>
            <span style={{ fontSize: '0.78rem', color: '#71717a' }}>
              Links friends directly to Room #{cleanRoomId} with live synchronized audio/video
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
