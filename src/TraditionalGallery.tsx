import React, { useState, useEffect, useRef } from 'react';
import {
  TRADITIONAL_SUBSTRATES,
  GALLERY_FRAMES,
  TraditionalSubstrateInfo,
} from './traditionalSubstrates';
import {
  paintStroke,
  type DrawableStroke,
} from './canvasUtils';
import type {
  CanvasTool,
  GalleryArtwork,
  GalleryFrameStyle,
} from './types';
import { playWoodenKnock, playSuzuBell } from './shrineSound';
import { KhmBruegelWalkthrough } from './KhmBruegelWalkthrough';

interface TraditionalGalleryProps {
  roomName: string;
  currentUserNickname?: string;
  onReturnToMovie?: () => void;
  onDedicateToShrine?: (dataUrl: string) => void;
  onShareToChat?: (text: string) => void;
  isAdmin?: boolean;
}

type GalleryWing = 'khm_bruegel' | 'honkan_japan';

const INITIAL_GALLERY_EXHIBITS: GalleryArtwork[] = [
  // KHM Vienna • Pieter Bruegel Collection (from Museum Hours)
  {
    id: 'khm-exhibit-1',
    title: 'The Hunters in the Snow (Jäger im Schnee, 1565)',
    authorName: 'Pieter Bruegel the Elder',
    roomName: 'KHM Saal X',
    substrateId: 'khm_oak',
    frameStyle: 'khm_baroque',
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Pieter_Bruegel_the_Elder_-_The_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg',
    createdAt: '1565-01-01T00:00:00.000Z',
    sealText: 'BRUEGEL',
    description: 'Oil on Baltic oak panel. Winter return of the hunters to the alpine valley, as featured in Jem Cohen\'s Museum Hours.',
    tributeCount: 94,
    hankoStamps: 72,
  },
  {
    id: 'khm-exhibit-2',
    title: 'The Tower of Babel (Turmbau zu Babel, 1563)',
    authorName: 'Pieter Bruegel the Elder',
    roomName: 'KHM Saal X',
    substrateId: 'khm_oak',
    frameStyle: 'khm_baroque',
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg',
    createdAt: '1563-01-01T00:00:00.000Z',
    sealText: 'BRUEGEL',
    description: 'Oil on oak panel depicting the colossal biblical ziggurat rising above the coastal harbor.',
    tributeCount: 88,
    hankoStamps: 65,
  },
  {
    id: 'khm-exhibit-3',
    title: 'The Peasant Wedding (Bauernhochzeit, 1567)',
    authorName: 'Pieter Bruegel the Elder',
    roomName: 'KHM Saal X',
    substrateId: 'khm_oak',
    frameStyle: 'khm_baroque',
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Pieter_Bruegel_the_Elder_-_The_Peasant_Wedding_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Peasant_Wedding_-_Google_Art_Project.jpg',
    createdAt: '1567-01-01T00:00:00.000Z',
    sealText: 'BRUEGEL',
    description: 'Celebratory rustic feast in a straw barn with porridge bowls and bagpipes.',
    tributeCount: 76,
    hankoStamps: 58,
  },
  {
    id: 'khm-exhibit-4',
    title: 'Children\'s Games (Kinderspiele, 1560)',
    authorName: 'Pieter Bruegel the Elder',
    roomName: 'KHM Saal X',
    substrateId: 'khm_oak',
    frameStyle: 'khm_baroque',
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Pieter_Bruegel_the_Elder_-_Children%27s_Games_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_Children%27s_Games_-_Google_Art_Project.jpg',
    createdAt: '1560-01-01T00:00:00.000Z',
    sealText: 'BRUEGEL',
    description: 'Panoramic Flemish town square filled with over 200 children playing medieval games.',
    tributeCount: 82,
    hankoStamps: 61,
  },

  // Tokyo & Kyoto Honkan Hall (Japanese Gallery)
  {
    id: 'gallery-exhibit-1',
    title: 'Misty Bamboo Grove (竹林墨絵)',
    authorName: 'Sesshu',
    roomName: 'Grand Auditorium',
    substrateId: 'washi',
    frameStyle: 'kakemono_scroll',
    imageDataUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    sealText: '雪舟',
    description: 'Calligraphic sumi-e ink wash painted on fibrous Echizen mulberry paper.',
    tributeCount: 38,
    hankoStamps: 24,
  },
  {
    id: 'gallery-exhibit-2',
    title: 'Cinnabar & Malachite Pines (松図屏風)',
    authorName: 'Eitoku',
    roomName: 'Balcony Suite',
    substrateId: 'gold_byobu',
    frameStyle: 'byobu_screen',
    imageDataUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    sealText: '永徳',
    description: 'Crushed azurite and malachite Nihonga mineral pigments gilded on hammered gold leaf.',
    tributeCount: 45,
    hankoStamps: 31,
  },
  {
    id: 'gallery-exhibit-3',
    title: 'Midnight Marquee Woodcut (木版画)',
    authorName: 'Hokusai',
    roomName: 'Studio Room',
    substrateId: 'hangi_wood',
    frameStyle: 'muku_cedar',
    imageDataUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    sealText: '北斎',
    description: 'Relief gouge woodblock carving with cinnabar baren pressure transfer.',
    tributeCount: 29,
    hankoStamps: 19,
  },
  {
    id: 'gallery-exhibit-4',
    title: 'Nocturne Impasto Study (夜想曲)',
    authorName: 'Klimt',
    roomName: 'Midnight Lounge',
    substrateId: 'raw_linen',
    frameStyle: 'urushi_lacquer',
    imageDataUrl: '',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    sealText: '金箔',
    description: 'Heavy palette knife oil impasto layered over raw primed Belgian linen.',
    tributeCount: 52,
    hankoStamps: 40,
  },
];

export function TraditionalGallery({
  roomName,
  currentUserNickname = 'Artist',
  onReturnToMovie,
  onDedicateToShrine,
  onShareToChat,
  isAdmin = false,
}: TraditionalGalleryProps) {
  const [viewMode, setViewMode] = useState<'gallery' | 'easel' | 'walkthrough_3d'>('gallery');
  const [activeWing, setActiveWing] = useState<GalleryWing>('khm_bruegel');

  // If not admin and viewMode is walkthrough_3d, reset to gallery
  useEffect(() => {
    if (!isAdmin && viewMode === 'walkthrough_3d') {
      setViewMode('gallery');
    }
  }, [isAdmin, viewMode]);

  const [galleryArtworks, setGalleryArtworks] = useState<GalleryArtwork[]>(() => {
    try {
      const saved = localStorage.getItem('mh_traditional_gallery_artworks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_GALLERY_EXHIBITS;
  });

  // Easel Studio State
  const [selectedSubstrate, setSelectedSubstrate] = useState<TraditionalSubstrateInfo>(TRADITIONAL_SUBSTRATES[0]);
  const [activeTool, setActiveTool] = useState<CanvasTool>('sumi_brush');
  const [brushColor, setBrushColor] = useState<string>('#1a1614');
  const [brushWidth, setBrushWidth] = useState<number>(18);
  const [selectedFrame, setSelectedFrame] = useState<GalleryFrameStyle>('kakemono_scroll');
  const [artworkTitle, setArtworkTitle] = useState('');
  const [artworkDescription, setArtworkDescription] = useState('');
  const [sealInitials, setSealInitials] = useState(currentUserNickname.slice(0, 2).toUpperCase());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<DrawableStroke | null>(null);
  const [strokesHistory, setStrokesHistory] = useState<DrawableStroke[]>([]);
  const [inspectedArtwork, setInspectedArtwork] = useState<GalleryArtwork | null>(null);
  const [isMountingModalOpen, setIsMountingModalOpen] = useState(false);

  // Sync Gallery state to localStorage and BroadcastChannel
  useEffect(() => {
    try {
      localStorage.setItem('mh_traditional_gallery_artworks', JSON.stringify(galleryArtworks));
    } catch {}
  }, [galleryArtworks]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel('movie_hell_canvas_sync');
    bc.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'new_gallery_artwork' && data.artwork) {
        setGalleryArtworks((prev) => [data.artwork, ...prev.filter((a) => a.id !== data.artwork.id)]);
      }
    };
    return () => bc.close();
  }, []);

  // Redraw Easel Canvas when strokes change
  useEffect(() => {
    if (viewMode !== 'easel') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokesHistory) {
      paintStroke(ctx, stroke, canvas.width, canvas.height);
    }
  }, [strokesHistory, viewMode]);

  // Easel Canvas Drawing Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const p = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.7;

    isDrawingRef.current = true;
    const newStroke: DrawableStroke = {
      tool: activeTool,
      color: brushColor,
      width: brushWidth,
      opacity: 1,
      points: [{ x, y, p }],
    };
    currentStrokeRef.current = newStroke;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      paintStroke(ctx, newStroke, canvas.width, canvas.height);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const p = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.7;

    const stroke = currentStrokeRef.current;
    stroke.points.push({ x, y, p });

    const ctx = canvas.getContext('2d');
    if (ctx && stroke.points.length >= 2) {
      const recentPoints = stroke.points.slice(-2);
      const subStroke: DrawableStroke = { ...stroke, points: recentPoints };
      paintStroke(ctx, subStroke, canvas.width, canvas.height);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;
    const finishedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    setStrokesHistory((prev) => [...prev, finishedStroke]);
  };

  const handleClearEasel = () => {
    playWoodenKnock(0.9);
    setStrokesHistory([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleUndoEasel = () => {
    playWoodenKnock(1.1);
    setStrokesHistory((prev) => prev.slice(0, -1));
  };

  // Mount artwork to 3D Gallery Exhibition
  const handleMountToGallery = (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const newArtwork: GalleryArtwork = {
        id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: artworkTitle.trim() || `${selectedSubstrate.name} Study`,
        authorName: currentUserNickname || 'Cinema Master',
        roomName: activeWing === 'khm_bruegel' ? 'KHM Vienna Saal X' : roomName || 'Auditorium',
        substrateId: selectedSubstrate.id,
        frameStyle: selectedFrame,
        imageDataUrl: dataUrl,
        createdAt: new Date().toISOString(),
        sealText: sealInitials.trim() || '印',
        description: artworkDescription.trim() || `Painted live on ${selectedSubstrate.name}.`,
        tributeCount: 1,
        hankoStamps: 1,
      };

      setGalleryArtworks((prev) => [newArtwork, ...prev]);
      setIsMountingModalOpen(false);
      setViewMode('gallery');
      playWoodenKnock(1.2);
      playSuzuBell();

      // Broadcast across tabs
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('movie_hell_canvas_sync');
        bc.postMessage({ type: 'new_gallery_artwork', artwork: newArtwork });
        bc.close();
      }
    } catch (err) {
      console.warn('Mount error:', err);
    }
  };

  const handleHankoStamp = (id: string) => {
    playWoodenKnock(1.3);
    setGalleryArtworks((prev) =>
      prev.map((art) => (art.id === id ? { ...art, hankoStamps: (art.hankoStamps || 0) + 1 } : art)),
    );
  };

  // Filter artworks by wing
  const filteredArtworks = galleryArtworks.filter((art) => {
    if (activeWing === 'khm_bruegel') {
      return art.substrateId === 'khm_oak' || art.frameStyle === 'khm_baroque' || art.roomName.includes('KHM');
    }
    return art.substrateId !== 'khm_oak' && art.frameStyle !== 'khm_baroque';
  });

  return (
    <div className={`traditional-gallery-container wing-${activeWing}`} role="region" aria-label="Traditional Media Atelier & 3D Blank Canvas Gallery">
      {/* ATELIER & GALLERY TOP NAVIGATION */}
      <header className="traditional-gallery-header">
        <div className="gallery-header-left">
          <span className="gallery-crest">🏛️</span>
          <div>
            <h2 className="gallery-heading">
              {activeWing === 'khm_bruegel' ? 'KHM Vienna • Bruegel Saal X (Museum Hours)' : 'Traditional Media Atelier (伝統工芸画廊)'}
            </h2>
            <p className="gallery-subheading">
              {activeWing === 'khm_bruegel'
                ? '"The paintings don\'t change, but what we bring to them does." — Museum Hours (2012)'
                : 'Authentic Japanese & Classical fine art media on traditional substrates'}
            </p>
          </div>
        </div>

        <div className="gallery-header-actions">
          {/* RETURN TO MOVIE BUTTON (PROMINENT & IMMEDIATE) */}
          {onReturnToMovie && (
            <button
              type="button"
              className="gallery-action-btn gallery-return-movie-btn"
              onClick={() => {
                playWoodenKnock(1);
                onReturnToMovie();
              }}
              title="Return to the active cinema movie screening on stage"
            >
              🎬 Return to Movie
            </button>
          )}

          {/* Museum Wing Selector */}
          <div className="gallery-wing-toggle">
            <button
              type="button"
              className={`wing-toggle-btn ${activeWing === 'khm_bruegel' ? 'active' : ''}`}
              onClick={() => {
                playWoodenKnock(1);
                setActiveWing('khm_bruegel');
              }}
              title="Kunsthistorisches Museum Vienna: Saal X (Bruegel Room from Museum Hours)"
            >
              🏛️ KHM Bruegel Saal
            </button>
            <button
              type="button"
              className={`wing-toggle-btn ${activeWing === 'honkan_japan' ? 'active' : ''}`}
              onClick={() => {
                playWoodenKnock(1);
                setActiveWing('honkan_japan');
              }}
              title="Tokyo & Kyoto National Museum Japanese Galleries"
            >
              🏯 Honkan Japan
            </button>
          </div>

          {/* Mode Switcher: 3D Gallery Hall vs Easel Studio vs 3D Walkthrough */}
          <div className="gallery-mode-toggle">
            {isAdmin && (
              <button
                type="button"
                className={`mode-toggle-btn ${viewMode === 'walkthrough_3d' ? 'active' : ''}`}
                onClick={() => {
                  playWoodenKnock(1);
                  setViewMode('walkthrough_3d');
                }}
                title="First-person WASD + Mouse Walkthrough of KHM Vienna Saal X"
              >
                🎮 3D WASD Tour
              </button>
            )}
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'gallery' ? 'active' : ''}`}
              onClick={() => {
                playWoodenKnock(1);
                setViewMode('gallery');
              }}
            >
              🏛️ Gallery Hall
            </button>
            <button
              type="button"
              className={`mode-toggle-btn ${viewMode === 'easel' ? 'active' : ''}`}
              onClick={() => {
                playWoodenKnock(1);
                setViewMode('easel');
              }}
            >
              🖌️ Easel Studio
            </button>
          </div>
        </div>
      </header>

      {/* VIEW MODE 0: 3D FIRST-PERSON WASD NINTENDO-STYLE WALKTHROUGH */}
      {isAdmin && viewMode === 'walkthrough_3d' && (
        <KhmBruegelWalkthrough
          roomName={roomName}
          currentUserNickname={currentUserNickname}
          onReturnToMovie={onReturnToMovie}
          isAdmin={isAdmin}
          onOpenEasel={() => {
            const oak = TRADITIONAL_SUBSTRATES.find((s) => s.id === 'khm_oak');
            if (oak) setSelectedSubstrate(oak);
            setSelectedFrame('khm_baroque');
            setViewMode('easel');
          }}
          onShareToChat={onShareToChat}
        />
      )}

      {/* VIEW MODE 1: 3D GALLERY EXHIBITION HALL */}
      {viewMode === 'gallery' && (
        <div className={`gallery-hall-viewport ${activeWing === 'khm_bruegel' ? 'khm-parquet-floor' : 'tatami-floor'}`}>
          <div className="gallery-hall-ambient-banner">
            <span>
              {activeWing === 'khm_bruegel' ? (
                <>🏰 <strong>Kunsthistorisches Museum Vienna • Saal X</strong> • Polished Austrian herringbone parquet & imperial gilded frames. Walk right up to Bruegel's oak panels or exhibit your own study.</>
              ) : (
                <>🏮 <strong>Grand Tatami Gallery Hall</strong> • Select any mounted artwork to inspect fine brushstrokes or stamp your Hanko mark.</>
              )}
            </span>
            <div className="banner-actions-group">
              {isAdmin && (
                <button
                  type="button"
                  className="gallery-action-btn gallery-walkthrough-launch-btn"
                  onClick={() => setViewMode('walkthrough_3d')}
                  title="Enter full first-person WASD 3D walkthrough"
                >
                  🎮 Walk in 3D (WASD)
                </button>
              )}
              <button
                type="button"
                className="gallery-action-btn gallery-easel-launch-btn"
                onClick={() => {
                  if (activeWing === 'khm_bruegel') {
                    const oak = TRADITIONAL_SUBSTRATES.find((s) => s.id === 'khm_oak');
                    if (oak) setSelectedSubstrate(oak);
                    setSelectedFrame('khm_baroque');
                  }
                  setViewMode('easel');
                }}
              >
                🎨 {activeWing === 'khm_bruegel' ? 'Paint on Baltic Oak Panel' : 'Paint on Blank Substrate'}
              </button>
            </div>
          </div>

          <div className="gallery-exhibition-grid">
            {filteredArtworks.map((art) => {
              const substrate = TRADITIONAL_SUBSTRATES.find((s) => s.id === art.substrateId) || TRADITIONAL_SUBSTRATES[0];
              const frame = GALLERY_FRAMES.find((f) => f.id === art.frameStyle) || GALLERY_FRAMES[0];

              return (
                <article
                  key={art.id}
                  className={`gallery-artwork-card frame-${art.frameStyle}`}
                  onClick={() => {
                    playWoodenKnock(1.1);
                    setInspectedArtwork(art);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {/* Authentic Mounting Frame */}
                  <div
                    className="gallery-frame-wrapper"
                    style={{
                      background: substrate.cssTexture,
                      borderColor: '#422',
                    }}
                  >
                    {/* Header silk or brocade crest / Brass Gallery Picture Light */}
                    <div className="gallery-frame-header">
                      {art.frameStyle === 'khm_baroque' && <div className="khm-brass-picture-light" />}
                      <span className="frame-crest-kanji">{substrate.kanjiName}</span>
                      <span className="frame-type-pill">{frame.name}</span>
                    </div>

                    {/* Canvas Art Display */}
                    <div className="gallery-art-canvas-frame">
                      {art.imageDataUrl ? (
                        <img src={art.imageDataUrl} alt={art.title} className="gallery-art-img" loading="lazy" />
                      ) : (
                        <div className="gallery-art-empty-canvas" style={{ background: substrate.baseColor }}>
                          <span className="empty-canvas-symbol">{art.frameStyle === 'khm_baroque' ? '🏰' : '🖌️'}</span>
                          <span className="empty-canvas-kanji">{art.authorName === 'Pieter Bruegel the Elder' ? 'BRUEGEL' : substrate.kanjiName}</span>
                        </div>
                      )}
                    </div>

                    {/* Artist Hanko Red Cinnabar Seal / Archival Plaque */}
                    <div className="gallery-artwork-footer">
                      <div className="gallery-meta-text">
                        <strong className="gallery-artwork-title">{art.title}</strong>
                        <span className="gallery-author-name">@{art.authorName} • {art.roomName}</span>
                      </div>

                      <div className="gallery-hanko-seal" title={`Signature Seal: ${art.sealText || '印'}`}>
                        <span>{art.sealText || art.authorName.slice(0, 2).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appreciation Tribute Bar */}
                  <div className="gallery-tribute-bar">
                    <button
                      type="button"
                      className="gallery-stamp-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHankoStamp(art.id);
                      }}
                      title="Stamp traditional Hanko / museum appreciation seal"
                    >
                      💮 Stamp Mark ({art.hankoStamps || 0})
                    </button>
                    <span className="gallery-inspect-hint">🔍 Curate & Inspect</span>
                  </div>
                </article>
              );
            })}

            {/* Empty Gilded Wall Spot to encourage user contribution */}
            <div
              className="gallery-artwork-card empty-exhibit-slot"
              onClick={() => {
                if (activeWing === 'khm_bruegel') {
                  const oak = TRADITIONAL_SUBSTRATES.find((s) => s.id === 'khm_oak');
                  if (oak) setSelectedSubstrate(oak);
                  setSelectedFrame('khm_baroque');
                }
                setViewMode('easel');
              }}
            >
              <div className="empty-slot-frame">
                <span className="empty-slot-icon">🖼️</span>
                <strong>Open Museum Wall Space</strong>
                <p>Click to paint a study and exhibit here in {activeWing === 'khm_bruegel' ? 'KHM Saal X' : 'Honkan Hall'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TRADITIONAL EASEL STUDIO */}
      {viewMode === 'easel' && (
        <div className="traditional-easel-studio">
          {/* SUBSTRATE / PAPER SELECTOR */}
          <div className="easel-substrate-bar">
            <span className="substrate-bar-label">📜 Physical Substrate:</span>
            <div className="substrate-pills-row">
              {TRADITIONAL_SUBSTRATES.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={`substrate-pill-btn ${selectedSubstrate.id === sub.id ? 'active' : ''}`}
                  onClick={() => {
                    playWoodenKnock(1);
                    setSelectedSubstrate(sub);
                    setActiveTool(sub.recommendedTool);
                    setBrushColor(sub.recommendedPalette[0]);
                    setSelectedFrame(sub.defaultFrame);
                  }}
                  title={sub.description}
                >
                  <span className="sub-kanji">{sub.kanjiName}</span>
                  <span className="sub-name">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="easel-workspace">
            {/* TRADITIONAL TOOL PALETTE */}
            <aside className="easel-tool-palette">
              <h4 className="palette-title">🖌️ Fine Art Media</h4>

              <div className="traditional-tools-grid">
                <button
                  type="button"
                  className={`trad-tool-btn ${activeTool === 'sumi_brush' ? 'active' : ''}`}
                  onClick={() => { setActiveTool('sumi_brush'); setBrushWidth(18); }}
                  title="Sumi-e Bamboo Ink Brush: wet wash bleed and flying-white feibai streaks"
                >
                  <span className="trad-tool-icon">🖌️</span>
                  <span className="trad-tool-label">Sumi-e Brush</span>
                </button>

                <button
                  type="button"
                  className={`trad-tool-btn ${activeTool === 'woodcut_gouge' ? 'active' : ''}`}
                  onClick={() => { setActiveTool('woodcut_gouge'); setBrushWidth(8); }}
                  title="Mokuhanga Woodcut Relief Gouge: carve crisp white relief paths"
                >
                  <span className="trad-tool-icon">🔪</span>
                  <span className="trad-tool-label">Woodcut Gouge</span>
                </button>

                <button
                  type="button"
                  className={`trad-tool-btn ${activeTool === 'nihonga_mineral' ? 'active' : ''}`}
                  onClick={() => { setActiveTool('nihonga_mineral'); setBrushWidth(16); }}
                  title="Nihonga Mineral Pigment: crushed mineral granules with mica shimmer"
                >
                  <span className="trad-tool-icon">🎨</span>
                  <span className="trad-tool-label">Mineral Pigment</span>
                </button>

                <button
                  type="button"
                  className={`trad-tool-btn ${activeTool === 'impasto_knife' ? 'active' : ''}`}
                  onClick={() => { setActiveTool('impasto_knife'); setBrushWidth(22); }}
                  title="Oil Impasto Knife: thick raised sculptural oil strokes"
                >
                  <span className="trad-tool-icon">🧈</span>
                  <span className="trad-tool-label">Impasto Knife</span>
                </button>

                <button
                  type="button"
                  className={`trad-tool-btn ${activeTool === 'gold_leaf' ? 'active' : ''}`}
                  onClick={() => { setActiveTool('gold_leaf'); setBrushWidth(20); }}
                  title="Gold Leaf & Sunago Gilding: polygon flakes of real gold leaf"
                >
                  <span className="trad-tool-icon">🍂</span>
                  <span className="trad-tool-label">Gold Leaf</span>
                </button>

                <button
                  type="button"
                  className={`trad-tool-btn ${activeTool === 'charcoal' ? 'active' : ''}`}
                  onClick={() => { setActiveTool('charcoal'); setBrushWidth(14); }}
                  title="Vine Charcoal & Stump: velvety dark charcoal stippling"
                >
                  <span className="trad-tool-icon">✏️</span>
                  <span className="trad-tool-label">Vine Charcoal</span>
                </button>
              </div>

              {/* RECOMMENDED PIGMENT SWATCHES */}
              <div className="easel-swatches-section">
                <span className="swatches-label">🎨 Authentic Pigments:</span>
                <div className="easel-swatches-grid">
                  {selectedSubstrate.recommendedPalette.map((col) => (
                    <button
                      key={col}
                      type="button"
                      className={`easel-swatch ${brushColor === col ? 'selected' : ''}`}
                      style={{ background: col }}
                      onClick={() => setBrushColor(col)}
                    />
                  ))}
                </div>
              </div>

              {/* BRUSH WIDTH SLIDER */}
              <div className="easel-width-control">
                <label htmlFor="trad-brush-width">Width: {brushWidth}px</label>
                <input
                  id="trad-brush-width"
                  type="range"
                  min="2"
                  max="64"
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(Number(e.target.value))}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="easel-actions-column">
                <button type="button" className="easel-btn" onClick={handleUndoEasel} title="Undo stroke">
                  ↩️ Undo
                </button>
                <button type="button" className="easel-btn" onClick={handleClearEasel} title="Clear canvas">
                  🧹 Clear
                </button>
                <button
                  type="button"
                  className="easel-btn easel-mount-btn"
                  onClick={() => setIsMountingModalOpen(true)}
                  disabled={strokesHistory.length === 0}
                  title="Mount finished traditional piece to the 3D Gallery Exhibition"
                >
                  🏛️ Exhibit in Gallery
                </button>
                {isAdmin && onDedicateToShrine && (
                  <button
                    type="button"
                    className="easel-btn easel-shrine-btn"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      onDedicateToShrine(canvas.toDataURL('image/png'));
                    }}
                    disabled={strokesHistory.length === 0}
                    title="Dedicate piece as a wooden Ema plaque to the 3D Shrine Pavilion"
                  >
                    ⛩️ Dedicate to Shrine
                  </button>
                )}
              </div>
            </aside>

            {/* EASEL CANVASES & SUBSTRATE VIEW */}
            <main className="easel-canvas-stage">
              <div
                className="easel-substrate-backing"
                style={{
                  background: selectedSubstrate.cssTexture,
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.95)',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={960}
                  height={540}
                  className="traditional-drawing-canvas"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </main>
          </div>
        </div>
      )}

      {/* MOUNT IN GALLERY MODAL */}
      {isMountingModalOpen && (
        <div className="gallery-modal-backdrop" onClick={() => setIsMountingModalOpen(false)}>
          <div className="gallery-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="mount-heading">
            <div className="gallery-modal-header">
              <h3 id="mount-heading">🏛️ Exhibit Artwork in Museum Gallery</h3>
              <button
                type="button"
                className="gallery-modal-close"
                onClick={() => setIsMountingModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleMountToGallery} className="gallery-modal-form">
              <div className="gallery-field">
                <label htmlFor="art-title">Artwork Title:</label>
                <input
                  id="art-title"
                  type="text"
                  value={artworkTitle}
                  onChange={(e) => setArtworkTitle(e.target.value)}
                  placeholder="e.g. Winter Hunters Study in Saal X"
                  required
                  maxLength={50}
                />
              </div>

              <div className="gallery-field">
                <label htmlFor="art-frame">Museum Frame Style:</label>
                <select
                  id="art-frame"
                  value={selectedFrame}
                  onChange={(e) => setSelectedFrame(e.target.value as GalleryFrameStyle)}
                >
                  {GALLERY_FRAMES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.kanjiName} • {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="gallery-field">
                <label htmlFor="art-seal">Signature Seal Initials (1-3 chars):</label>
                <input
                  id="art-seal"
                  type="text"
                  value={sealInitials}
                  onChange={(e) => setSealInitials(e.target.value)}
                  maxLength={4}
                />
              </div>

              <div className="gallery-field">
                <label htmlFor="art-desc">Artist Inscription / Museum Hours Contemplation:</label>
                <textarea
                  id="art-desc"
                  value={artworkDescription}
                  onChange={(e) => setArtworkDescription(e.target.value)}
                  placeholder="Leave your observations on the composition, light, or characters..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="gallery-modal-actions">
                <button
                  type="button"
                  className="gallery-btn-secondary"
                  onClick={() => setIsMountingModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="gallery-btn-primary">
                  🏛️ Exhibit in Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MACRO INSPECTION MODAL */}
      {inspectedArtwork && (
        <div className="gallery-modal-backdrop" onClick={() => setInspectedArtwork(null)}>
          <div className="gallery-inspect-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="inspect-art-title">
            <button
              type="button"
              className="gallery-modal-close"
              onClick={() => setInspectedArtwork(null)}
              aria-label="Close inspection"
            >
              ×
            </button>

            <div className="gallery-inspect-body">
              <div className="gallery-inspect-img-wrap">
                {inspectedArtwork.imageDataUrl ? (
                  <img src={inspectedArtwork.imageDataUrl} alt={inspectedArtwork.title} className="inspect-highres-img" />
                ) : (
                  <div className="inspect-highres-placeholder">
                    <span>{inspectedArtwork.frameStyle === 'khm_baroque' ? '🏰' : '🖌️'}</span>
                  </div>
                )}
              </div>

              <div className="gallery-inspect-meta">
                <span className="inspect-kanji-tag">
                  {inspectedArtwork.frameStyle === 'khm_baroque' ? 'KUNSTHISTORISCHES MUSEUM WIEN • SAAL X' : '落款 • 伝統画廊作品'}
                </span>
                <h3 id="inspect-art-title" className="inspect-title">{inspectedArtwork.title}</h3>
                <p className="inspect-author">Master: <strong>@{inspectedArtwork.authorName}</strong> in <em>{inspectedArtwork.roomName}</em></p>

                {inspectedArtwork.description && (
                  <blockquote className="inspect-inscription">
                    "{inspectedArtwork.description}"
                  </blockquote>
                )}

                <div className="inspect-actions-row">
                  <button
                    type="button"
                    className="inspect-stamp-btn"
                    onClick={() => handleHankoStamp(inspectedArtwork.id)}
                  >
                    💮 Stamp Appreciation ({inspectedArtwork.hankoStamps || 0})
                  </button>

                  <button
                    type="button"
                    className="inspect-easel-clone-btn"
                    onClick={() => {
                      const sub = TRADITIONAL_SUBSTRATES.find((s) => s.id === inspectedArtwork.substrateId);
                      if (sub) setSelectedSubstrate(sub);
                      setSelectedFrame(inspectedArtwork.frameStyle);
                      setInspectedArtwork(null);
                      setViewMode('easel');
                    }}
                  >
                    🖌️ Paint on This Substrate
                  </button>

                  {onShareToChat && (
                    <button
                      type="button"
                      className="inspect-share-btn"
                      onClick={() => {
                        onShareToChat(`🏛️ Contemplating "${inspectedArtwork.title}" by @${inspectedArtwork.authorName} in the KHM Bruegel Gallery!`);
                        setInspectedArtwork(null);
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
