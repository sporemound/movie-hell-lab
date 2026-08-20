import React, { useState, useEffect } from 'react';
import { useShrineRotation } from './useShrineRotation';
import { EmaTablet, EmaVotive } from './EmaTablet';
import { playWoodenKnock, playSuzuBell } from './shrineSound';

interface ShrinePavilionProps {
  roomName: string;
  currentUserNickname?: string;
  draftArtworkUrl?: string | null;
  onClearDraftArtwork?: () => void;
  onShareToChat?: (text: string) => void;
  onReturnToMovie?: () => void;
  isBackstageView?: boolean;
  isAdmin?: boolean;
}

const INITIAL_COMMUNITY_SKETCHES: EmaVotive[] = [
  {
    id: 'ema-demo-1',
    title: 'Celluloid Dreams',
    authorName: 'Projectionist',
    roomName: 'Grand Auditorium',
    imageDataUrl: '',
    createdAt: new Date().toISOString(),
    candleCount: 24,
    bellCount: 18,
    inscription: 'Dedicated to the late-night 35mm film reels and velvet cinema seats.',
    facetIndex: 0,
    slotIndex: 0,
  },
  {
    id: 'ema-demo-2',
    title: 'Neon Midnight',
    authorName: 'CinemaGuest-102',
    roomName: 'Midnight Lounge',
    imageDataUrl: '',
    createdAt: new Date().toISOString(),
    candleCount: 19,
    bellCount: 15,
    inscription: 'Analogous harmonies drawn live under the marquee light.',
    facetIndex: 0,
    slotIndex: 1,
  },
  {
    id: 'ema-demo-3',
    title: 'Velvet Curtain Call',
    authorName: 'CinemaHost',
    roomName: 'Balcony Suite',
    imageDataUrl: '',
    createdAt: new Date().toISOString(),
    candleCount: 31,
    bellCount: 27,
    inscription: 'May the house lights dim and the story ignite.',
    facetIndex: 1,
    slotIndex: 0,
  },
  {
    id: 'ema-demo-4',
    title: 'Popcorn Noir',
    authorName: 'CinemaGuest-404',
    roomName: 'Grand Auditorium',
    imageDataUrl: '',
    createdAt: new Date().toISOString(),
    candleCount: 14,
    bellCount: 9,
    inscription: 'Shadows falling on the front row.',
    facetIndex: 1,
    slotIndex: 1,
  },
  {
    id: 'ema-demo-5',
    title: 'Kino Express',
    authorName: 'FilmBuff',
    roomName: 'Studio Room',
    imageDataUrl: '',
    createdAt: new Date().toISOString(),
    candleCount: 22,
    bellCount: 12,
    inscription: 'A quick gesture sketch during the climax.',
    facetIndex: 2,
    slotIndex: 0,
  },
  {
    id: 'ema-demo-6',
    title: 'Golden Lantern',
    authorName: 'Yuki',
    roomName: 'Grand Auditorium',
    imageDataUrl: '',
    createdAt: new Date().toISOString(),
    candleCount: 17,
    bellCount: 16,
    inscription: 'Warm glow in the dark cinema hall.',
    facetIndex: 3,
    slotIndex: 0,
  },
];

export function ShrinePavilion({
  roomName,
  currentUserNickname = 'Artist',
  draftArtworkUrl,
  onClearDraftArtwork,
  onShareToChat,
  onReturnToMovie,
  isBackstageView = false,
  isAdmin = false,
}: ShrinePavilionProps) {
  if (!isAdmin) {
    return (
      <div className="empty-screen" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: '2.8rem' }}>⛩️</span>
        <h2 style={{ marginTop: '0.5rem', color: '#f3d899' }}>Restricted Backstage Sanctuary</h2>
        <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.25rem auto', color: '#bfb8a5', fontSize: '0.88rem', lineHeight: '1.5' }}>
          The 3D Art Shrine Pavilion is currently accessible to room administrators only.
        </p>
        {onReturnToMovie && (
          <button
            type="button"
            className="button-primary"
            onClick={onReturnToMovie}
            style={{ margin: '0 auto' }}
          >
            🎬 Return to Screening Stage
          </button>
        )}
      </div>
    );
  }

  const FACET_COUNT = 8;
  const SLOTS_PER_FACET = 6; // Dense 2-column x 3-row layout per facet (up to 48 sketches on the shrine!)

  const {
    rotationY,
    tiltX,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    rotateToFacet,
  } = useShrineRotation({ facetCount: FACET_COUNT, friction: 0.94, sensitivity: 0.38 });

  const [emaList, setEmaList] = useState<EmaVotive[]>(() => {
    try {
      const saved = localStorage.getItem('mh_shrine_ema_votives');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COMMUNITY_SKETCHES;
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [inspectedEma, setInspectedEma] = useState<EmaVotive | null>(null);
  const [dedicationTitle, setDedicationTitle] = useState('');
  const [dedicationNote, setDedicationNote] = useState('');
  const [isDedicating, setIsDedicating] = useState(false);
  const [flyingEma, setFlyingEma] = useState<EmaVotive | null>(null);

  // Sync Ema list across tabs & windows
  useEffect(() => {
    try {
      localStorage.setItem('mh_shrine_ema_votives', JSON.stringify(emaList));
    } catch {}
  }, [emaList]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('movie_hell_canvas_sync');
    bc.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'new_ema_votive' && data.ema) {
        setEmaList((prev) => [data.ema, ...prev.filter((item) => item.id !== data.ema.id)]);
      }
    };
    return () => bc.close();
  }, []);

  // When draft artwork is passed from KritaStudio or Trace Mode, automatically open dedication modal
  useEffect(() => {
    if (draftArtworkUrl) {
      setIsDedicating(true);
    }
  }, [draftArtworkUrl]);

  const handleDedicateArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftArtworkUrl && !isDedicating) return;

    // Pick lowest populated facet
    const facetCounts = Array.from({ length: FACET_COUNT }).map(
      (_, i) => emaList.filter((item) => (item.facetIndex ?? 0) % FACET_COUNT === i).length,
    );
    const minFacetIdx = facetCounts.indexOf(Math.min(...facetCounts));

    const newEma: EmaVotive = {
      id: `ema-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: dedicationTitle.trim() || 'Artwork Dedication',
      authorName: currentUserNickname || 'Cinema Attendee',
      roomName: roomName || 'Auditorium',
      imageDataUrl: draftArtworkUrl || '',
      createdAt: new Date().toISOString(),
      candleCount: 1,
      bellCount: 1,
      inscription: dedicationNote.trim() || 'Painted live during screening.',
      facetIndex: minFacetIdx,
      slotIndex: facetCounts[minFacetIdx],
    };

    // 3D flight animation
    setFlyingEma(newEma);
    setIsDedicating(false);
    setDedicationTitle('');
    setDedicationNote('');
    onClearDraftArtwork?.();

    playWoodenKnock(0.85);
    rotateToFacet(newEma.facetIndex || 0);

    setTimeout(() => {
      playWoodenKnock(1.2);
      playSuzuBell();
      setEmaList((prev) => [newEma, ...prev]);
      setFlyingEma(null);

      // Broadcast across tabs
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('movie_hell_canvas_sync');
          bc.postMessage({ type: 'new_ema_votive', ema: newEma });
          bc.close();
        } catch {}
      }
    }, 850);
  };

  const handleLightCandle = (id: string) => {
    setEmaList((prev) =>
      prev.map((ema) => (ema.id === id ? { ...ema, candleCount: (ema.candleCount || 0) + 1 } : ema)),
    );
  };

  const handleRingBell = (id: string) => {
    setEmaList((prev) =>
      prev.map((ema) => (ema.id === id ? { ...ema, bellCount: (ema.bellCount || 0) + 1 } : ema)),
    );
  };

  // Cylinder geometry radius for 8 facets with 280px facet width
  // R = (width / 2) / tan(PI / N)
  // for N=8, width=280px -> R = 140 / tan(22.5deg) = 140 / 0.4142 = ~338px
  const CYLINDER_RADIUS = 345;

  return (
    <div className={`shrine-pavilion-container ${isBackstageView ? 'backstage-mode' : ''}`} role="region" aria-label="3D Rotational Japanese Shrine Pavilion">
      {/* GRAND SHRINE TOPBAR */}
      <header className="shrine-header">
        <div className="shrine-title-badge">
          <span className="shrine-crest">⛩️</span>
          <div>
            <h2 className="shrine-heading">Grand Backstage Shrine (絵馬殿)</h2>
            <p className="shrine-subheading">A massive rotating Shinto pavilion holding dozens of sketches & community traces</p>
          </div>
        </div>

        <div className="shrine-actions">
          {onReturnToMovie && (
            <button
              type="button"
              className="shrine-action-btn shrine-return-movie-btn"
              onClick={() => {
                playWoodenKnock(1);
                onReturnToMovie();
              }}
              title="Return to the active cinema movie screening on stage"
            >
              🎬 Return to Movie
            </button>
          )}

          {/* Zoom Controls */}
          <div className="shrine-zoom-controls">
            <button
              type="button"
              className="shrine-action-btn"
              onClick={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
              title="Zoom out"
            >
              🔍-
            </button>
            <span className="shrine-zoom-label">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              className="shrine-action-btn"
              onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.15).toFixed(2))))}
              title="Zoom in"
            >
              🔍+
            </button>
          </div>

          <button
            type="button"
            className="shrine-action-btn shrine-bell-btn"
            onClick={() => playSuzuBell()}
            title="Ring the Grand Shrine Suzu Chime"
          >
            🔔 Ring Chime
          </button>

          <button
            type="button"
            className="shrine-action-btn shrine-dedicate-btn"
            onClick={() => setIsDedicating(true)}
            title="Dedicate a new sketch plaque to the shrine wall"
          >
            ⛩️ Hang New Sketch
          </button>
        </div>
      </header>

      {/* ROTATION INSTRUCTION & FACET DIAL */}
      <div className="shrine-hint-bar">
        <span>🖐️ <strong>Drag by hand</strong> to spin the massive shrine structure • {emaList.length} sketches dedicated</span>
        <div className="shrine-facet-indicators">
          {Array.from({ length: FACET_COUNT }).map((_, i) => {
            const count = emaList.filter((e) => (e.facetIndex ?? 0) % FACET_COUNT === i).length;
            return (
              <button
                key={i}
                type="button"
                className="shrine-facet-dot"
                onClick={() => rotateToFacet(i)}
                title={`Rotate to Pavilion Facet ${i + 1} (${count} sketches)`}
              >
                {count > 0 ? count : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D ROTATIONAL SHRINE VIEWPORT */}
      <div
        className={`shrine-3d-viewport ${isDragging ? 'dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="shrine-pavilion-carousel grand-pavilion"
          style={{
            transform: `perspective(1200px) scale(${zoomLevel}) rotateX(${tiltX}deg) rotateY(${rotationY}deg)`,
          }}
        >
          {/* Grand Timber Torii Roof & Hanging Chochin Lanterns */}
          <div className="shrine-roof-top grand-roof" aria-hidden="true">
            <div className="roof-ridge grand-ridge" />
            <div className="roof-eaves grand-eaves" />
            <div className="roof-lantern-left">🏮</div>
            <div className="roof-lantern-center">🏮</div>
            <div className="roof-lantern-right">🏮</div>
          </div>

          {/* 8 Polygonal Cedar Lattice Facets */}
          {Array.from({ length: FACET_COUNT }).map((_, facetIdx) => {
            const facetAngle = (360 / FACET_COUNT) * facetIdx;
            const facetEma = emaList.filter((e) => (e.facetIndex ?? 0) % FACET_COUNT === facetIdx);

            return (
              <div
                key={facetIdx}
                className="shrine-facet grand-facet"
                style={{
                  transform: `rotateY(${facetAngle}deg) translateZ(${CYLINDER_RADIUS}px)`,
                }}
              >
                {/* Cedar Timber Pillar Frame & Koshi Lattice */}
                <div className="shrine-facet-frame">
                  <div className="shrine-timber-header">
                    <span className="shrine-facet-num">第 {facetIdx + 1} 面 • {facetEma.length} 枚</span>
                    <span className="shrine-facet-seal">奉納</span>
                  </div>

                  <div className="shrine-koshi-lattice grand-lattice">
                    {/* Dense Multi-Tier Koshi Lattice Grid of Compact Ema Plaques */}
                    <div className="shrine-dense-ema-grid">
                      {facetEma.map((ema) => (
                        <EmaTablet
                          key={ema.id}
                          ema={ema}
                          compact={true}
                          onSelect={setInspectedEma}
                          onLightCandle={handleLightCandle}
                          onRingBell={handleRingBell}
                        />
                      ))}

                      {/* Empty Hook for Next Dedication */}
                      {facetEma.length < SLOTS_PER_FACET && (
                        <div
                          className="shrine-empty-hook compact-hook"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDedicating(true);
                          }}
                        >
                          <span className="empty-hook-icon">🪝</span>
                          <span className="empty-hook-text">Open Hook</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrine-timber-footer" />
                </div>
              </div>
            );
          })}

          {/* Heavy Stone & Cedar Shrine Foundation Base */}
          <div className="shrine-base-pedestal grand-pedestal" aria-hidden="true" />
        </div>

        {/* 3D VECTORIZED DEDICATION FLIGHT PROXY */}
        {flyingEma && (
          <div className="shrine-flying-ema-proxy">
            <EmaTablet ema={flyingEma} compact={false} />
          </div>
        )}
      </div>

      {/* DEDICATION MODAL */}
      {isDedicating && (
        <div className="shrine-modal-backdrop" onClick={() => setIsDedicating(false)}>
          <div className="shrine-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="dedicate-heading">
            <div className="shrine-modal-header">
              <h3 id="dedicate-heading">⛩️ Dedicate Artwork to Grand Shrine</h3>
              <button
                type="button"
                className="shrine-modal-close"
                onClick={() => setIsDedicating(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDedicateArtwork} className="shrine-modal-form">
              {draftArtworkUrl ? (
                <div className="shrine-preview-ema-box">
                  <div className="ema-preview-frame">
                    <img src={draftArtworkUrl} alt="Preview sketch" className="ema-preview-img" />
                  </div>
                  <span className="ema-preview-caption">Live Sketch from Studio / Movie Trace</span>
                </div>
              ) : (
                <div className="shrine-no-art-notice">
                  <p>🎨 Draw in the <strong>Shared Canvas Atelier</strong> or <strong>Trace Mode</strong>, then click <em>"⛩️ Dedicate to Shrine"</em> to hang your artwork on the grand rotating wall.</p>
                </div>
              )}

              <div className="shrine-field">
                <label htmlFor="ema-title-input">Artwork Title / Dedication:</label>
                <input
                  id="ema-title-input"
                  type="text"
                  value={dedicationTitle}
                  onChange={(e) => setDedicationTitle(e.target.value)}
                  placeholder="e.g. Midnight Celluloid Study"
                  required
                  maxLength={48}
                />
              </div>

              <div className="shrine-field">
                <label htmlFor="ema-note-input">Inscription / Thoughts on Scene:</label>
                <textarea
                  id="ema-note-input"
                  value={dedicationNote}
                  onChange={(e) => setDedicationNote(e.target.value)}
                  placeholder="Leave your contemplation, scene note, or dedication..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="shrine-modal-actions">
                <button
                  type="button"
                  className="shrine-btn-secondary"
                  onClick={() => setIsDedicating(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="shrine-btn-primary"
                  disabled={!draftArtworkUrl && !dedicationTitle}
                >
                  ⛩️ Hang Ema Plaque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN CONTEMPLATION INSPECTOR MODAL */}
      {inspectedEma && (
        <div className="shrine-modal-backdrop" onClick={() => setInspectedEma(null)}>
          <div className="shrine-inspect-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="inspect-heading">
            <button
              type="button"
              className="shrine-inspect-close"
              onClick={() => setInspectedEma(null)}
              aria-label="Close contemplation"
            >
              ×
            </button>

            <div className="shrine-inspect-content">
              <div className="shrine-inspect-art-wrapper">
                <EmaTablet ema={inspectedEma} isInspected={true} compact={false} />
              </div>

              <div className="shrine-inspect-meta">
                <span className="inspect-sacred-seal">奉納 • SACRED CINEMA DEDICATION</span>
                <h3 id="inspect-heading" className="inspect-title">{inspectedEma.title}</h3>
                <p className="inspect-author">Painted by <strong>@{inspectedEma.authorName}</strong> in <em>{inspectedEma.roomName}</em></p>

                {inspectedEma.inscription && (
                  <blockquote className="inspect-inscription">
                    "{inspectedEma.inscription}"
                  </blockquote>
                )}

                <div className="inspect-actions">
                  <button
                    type="button"
                    className="inspect-tribute-btn"
                    onClick={() => handleLightCandle(inspectedEma.id)}
                  >
                    🏮 Light Tribute Lantern ({inspectedEma.candleCount || 0})
                  </button>

                  <button
                    type="button"
                    className="inspect-tribute-btn"
                    onClick={() => {
                      playSuzuBell();
                      handleRingBell(inspectedEma.id);
                    }}
                  >
                    🔔 Ring Suzu Chime ({inspectedEma.bellCount || 0})
                  </button>

                  {onShareToChat && (
                    <button
                      type="button"
                      className="inspect-share-btn"
                      onClick={() => {
                        onShareToChat(`⛩️ Check out the Ema art "${inspectedEma.title}" by @${inspectedEma.authorName} on the Shrine!`);
                        setInspectedEma(null);
                      }}
                    >
                      💬 Share to Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
