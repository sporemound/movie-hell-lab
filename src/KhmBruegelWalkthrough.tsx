import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playWoodenKnock, playSuzuBell } from './shrineSound';
import { TRADITIONAL_SUBSTRATES } from './traditionalSubstrates';
import type { GalleryArtwork } from './types';

interface KhmBruegelWalkthroughProps {
  roomName?: string;
  currentUserNickname?: string;
  onReturnToMovie?: () => void;
  onOpenEasel?: () => void;
  onDedicateToGallery?: (artwork: GalleryArtwork) => void;
  onShareToChat?: (text: string) => void;
  isBackstageView?: boolean;
  isAdmin?: boolean;
}

interface Museum3DArtwork {
  id: string;
  title: string;
  germanTitle: string;
  year: string;
  author: string;
  description: string;
  curationNote: string;
  wall: 'north' | 'south' | 'east' | 'west';
  x: number; // 3D room position
  y: number;
  z: number;
  rotationY: number;
  width: number;
  height: number;
  imageDataUrl?: string;
  tributes: number;
  hankoStamps: number;
  isEmptySlot?: boolean;
}

const BRUEGEL_MASTERPIECES: Museum3DArtwork[] = [
  // NORTH WALL (Main Entrance & Frontal Vista)
  {
    id: 'bruegel-hunters',
    title: 'The Hunters in the Snow',
    germanTitle: 'Jäger im Schnee',
    year: '1565',
    author: 'Pieter Bruegel the Elder',
    description: 'Oil on Baltic oak wood panel. The definitive winter landscape showing weary hunters and their pack returning to an alpine village with frozen ponds.',
    curationNote: 'As contemplated by Johann in Museum Hours: Note the alpine peaks never found in the Low Countries, and the tiny details of fire roasting pig outside the inn.',
    wall: 'north',
    x: -160,
    y: 10,
    z: -340,
    rotationY: 0,
    width: 140,
    height: 100,
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Pieter_Bruegel_the_Elder_-_The_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Hunters_in_the_Snow_%28Winter%29_-_Google_Art_Project.jpg',
    tributes: 142,
    hankoStamps: 98,
  },
  {
    id: 'bruegel-babel',
    title: 'The Tower of Babel',
    germanTitle: 'Turmbau zu Babel',
    year: '1563',
    author: 'Pieter Bruegel the Elder',
    description: 'Oil on oak panel. The colossal spiral ziggurat piercing the clouds with meticulous medieval engineering scaffolding and King Nimrod in the foreground.',
    curationNote: 'Notice the deliberate tilt in the tower architecture, signaling the hubris and inevitable collapse of human arrogance.',
    wall: 'north',
    x: 160,
    y: 10,
    z: -340,
    rotationY: 0,
    width: 140,
    height: 100,
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg',
    tributes: 128,
    hankoStamps: 84,
  },

  // EAST WALL (Right Wing)
  {
    id: 'bruegel-wedding',
    title: 'The Peasant Wedding',
    germanTitle: 'Bauernhochzeit',
    year: '1567',
    author: 'Pieter Bruegel the Elder',
    description: 'Oil on wood panel. Rustic wedding feast in a straw barn with warm earth tones, porridge trenchers carried on unhinged doors, and bagpipers.',
    curationNote: 'The bride sits quietly beneath the paper crown against the green hanging cloth, lost in internal contemplation.',
    wall: 'east',
    x: 340,
    y: 10,
    z: -140,
    rotationY: -90,
    width: 140,
    height: 100,
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Pieter_Bruegel_the_Elder_-_The_Peasant_Wedding_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Peasant_Wedding_-_Google_Art_Project.jpg',
    tributes: 110,
    hankoStamps: 76,
  },
  {
    id: 'bruegel-empty-east',
    title: 'East Wing Open Masterpiece Slot',
    germanTitle: 'Offene Wandfläche',
    year: 'Contemporary',
    author: 'Cinema Master',
    description: 'An open gilded Austrian imperial frame waiting for your cinema trace or oil study.',
    curationNote: 'Click or press [E] to paint on a Baltic oak panel and mount your study right here in Saal X.',
    wall: 'east',
    x: 340,
    y: 10,
    z: 140,
    rotationY: -90,
    width: 140,
    height: 100,
    isEmptySlot: true,
    tributes: 1,
    hankoStamps: 1,
  },

  // SOUTH WALL (Rear Gallery Wall)
  {
    id: 'bruegel-games',
    title: 'Children\'s Games',
    germanTitle: 'Kinderspiele',
    year: '1560',
    author: 'Pieter Bruegel the Elder',
    description: 'Oil on oak panel. Over 200 children enacting 80+ medieval street games across a panoramic town square.',
    curationNote: 'Children behave with sober adult solemnity, turning childhood play into an encyclopedic allegory of human folly.',
    wall: 'south',
    x: 160,
    y: 10,
    z: 340,
    rotationY: 180,
    width: 140,
    height: 100,
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Pieter_Bruegel_the_Elder_-_Children%27s_Games_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_Children%27s_Games_-_Google_Art_Project.jpg',
    tributes: 95,
    hankoStamps: 63,
  },
  {
    id: 'bruegel-gloomy',
    title: 'The Gloomy Day (Early Spring)',
    germanTitle: 'Düsterer Tag',
    year: '1565',
    author: 'Pieter Bruegel the Elder',
    description: 'Oil on wood panel. Tumultuous stormy sea with wrecked ships, carnival waffles, and willow pruning in late winter.',
    curationNote: 'Part of the famous Months of the Year cycle, capturing the raw transition from winter frost to spring mud.',
    wall: 'south',
    x: -160,
    y: 10,
    z: 340,
    rotationY: 180,
    width: 140,
    height: 100,
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Pieter_Bruegel_the_Elder_-_The_Gloomy_Day_%28February%29_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Gloomy_Day_%28February%29_-_Google_Art_Project.jpg',
    tributes: 87,
    hankoStamps: 52,
  },

  // WEST WALL (Left Wing)
  {
    id: 'bruegel-procession',
    title: 'The Procession to Calvary',
    germanTitle: 'Kreuztragung Christi',
    year: '1564',
    author: 'Pieter Bruegel the Elder',
    description: 'Oil on oak panel. Massive panoramic crowd of 500+ figures streaming toward Golgotha, with a Flemish windmill perched precariously on a jagged peak.',
    curationNote: 'Christ falling under the cross is placed dead center yet easily overlooked among the bustling mundane crowd.',
    wall: 'west',
    x: -340,
    y: 10,
    z: -140,
    rotationY: 90,
    width: 140,
    height: 100,
    imageDataUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Pieter_Bruegel_the_Elder_-_The_Procession_to_Calvary_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Procession_to_Calvary_-_Google_Art_Project.jpg',
    tributes: 104,
    hankoStamps: 70,
  },
  {
    id: 'bruegel-empty-west',
    title: 'West Wing Open Masterpiece Slot',
    germanTitle: 'Offene Wandfläche',
    year: 'Contemporary',
    author: 'Cinema Master',
    description: 'An open gilded Austrian imperial frame waiting for your cinema trace or oil study.',
    curationNote: 'Click or press [E] to paint on a Baltic oak panel and mount your study right here in Saal X.',
    wall: 'west',
    x: -340,
    y: 10,
    z: 140,
    rotationY: 90,
    width: 140,
    height: 100,
    isEmptySlot: true,
    tributes: 1,
    hankoStamps: 1,
  },
];

export function KhmBruegelWalkthrough({
  roomName = 'Auditorium',
  currentUserNickname = 'Gallery Visitor',
  onReturnToMovie,
  onOpenEasel,
  onDedicateToGallery,
  onShareToChat,
  isBackstageView = false,
  isAdmin = false,
}: KhmBruegelWalkthroughProps) {
  if (!isAdmin) {
    return (
      <div className="empty-screen" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: '2.8rem' }}>🏰</span>
        <h2 style={{ marginTop: '0.5rem', color: '#ffd700' }}>Restricted Museum Tour</h2>
        <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.25rem auto', color: '#bfb8a5', fontSize: '0.88rem', lineHeight: '1.5' }}>
          The 3D KHM Vienna Bruegel Walkthrough is currently accessible to room administrators only.
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

  // 3D Player State
  const [posX, setPosX] = useState<number>(0);
  const [posZ, setPosZ] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0); // Camera Yaw (left/right)
  const [rotX, setRotX] = useState<number>(0); // Camera Pitch (up/down)
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [headBob, setHeadBob] = useState<number>(0);
  const [isPointerLocked, setIsPointerLocked] = useState<boolean>(false);
  const [artworks, setArtworks] = useState<Museum3DArtwork[]>(() => {
    try {
      const saved = localStorage.getItem('mh_khm_bruegel_3d_artworks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return BRUEGEL_MASTERPIECES;
  });

  const [activeNearbyArtwork, setActiveNearbyArtwork] = useState<Museum3DArtwork | null>(null);
  const [inspectedArtwork, setInspectedArtwork] = useState<Museum3DArtwork | null>(null);
  const [isPaintingModalOpen, setIsPaintingModalOpen] = useState<boolean>(false);
  const [targetSlotId, setTargetSlotId] = useState<string | null>(null);
  const [inspectZoom, setInspectZoom] = useState<number>(1);
  const [scientificLayer, setScientificLayer] = useState<'visible' | 'irr' | 'xray'>('visible');
  const [tourMode, setTourMode] = useState<'360_panorama' | '3d_wasd'>('360_panorama');
  const [panoramaYaw, setPanoramaYaw] = useState<number>(0);
  const [panoramaPitch, setPanoramaPitch] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const animFrameRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync artwork state
  useEffect(() => {
    try {
      localStorage.setItem('mh_khm_bruegel_3d_artworks', JSON.stringify(artworks));
    } catch {}
  }, [artworks]);

  // Keyboard Event Listeners for WASD / Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      keysPressedRef.current[e.code] = true;
      if (e.shiftKey) setIsSprinting(true);

      // Interaction shortcut [E] or [Space]
      if (e.code === 'KeyE' || e.code === 'Space') {
        if (activeNearbyArtwork && !inspectedArtwork && !isPaintingModalOpen) {
          e.preventDefault();
          playWoodenKnock(1.1);
          if (activeNearbyArtwork.isEmptySlot) {
            setTargetSlotId(activeNearbyArtwork.id);
            setIsPaintingModalOpen(true);
          } else {
            setInspectedArtwork(activeNearbyArtwork);
          }
        }
      }

      // Escape to close inspection or exit
      if (e.code === 'Escape') {
        if (inspectedArtwork) {
          setInspectedArtwork(null);
        } else if (isPaintingModalOpen) {
          setIsPaintingModalOpen(false);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
      if (!e.shiftKey) setIsSprinting(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNearbyArtwork, inspectedArtwork, isPaintingModalOpen]);

  // Continuous 60fps Movement Physics Loop
  useEffect(() => {
    let currentX = posX;
    let currentZ = posZ;
    let currentRotY = rotY;
    let stepCycle = 0;

    const ROOM_HALF_WIDTH = 300;
    const ROOM_HALF_DEPTH = 300;

    const updatePhysics = () => {
      const keys = keysPressedRef.current;
      const speed = (isSprinting ? 5.5 : 3.2);
      let dx = 0;
      let dz = 0;

      // WASD / Arrow Movement relative to Camera Yaw
      const rad = (currentRotY * Math.PI) / 180;
      const forwardX = Math.sin(rad);
      const forwardZ = -Math.cos(rad);
      const strafeX = Math.cos(rad);
      const strafeZ = Math.sin(rad);

      if (keys['KeyW'] || keys['ArrowUp']) {
        dx += forwardX * speed;
        dz += forwardZ * speed;
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        dx -= forwardX * speed;
        dz -= forwardZ * speed;
      }
      if (keys['KeyA'] || keys['ArrowLeft']) {
        dx -= strafeX * speed;
        dz -= strafeZ * speed;
      }
      if (keys['KeyD'] || keys['ArrowRight']) {
        dx += strafeX * speed;
        dz += strafeZ * speed;
      }

      // Smooth Turning with Q / E or Left / Right
      if (keys['KeyQ']) currentRotY -= 2.2;
      if (keys['KeyR']) currentRotY += 2.2;

      const isMoving = dx !== 0 || dz !== 0;

      if (isMoving) {
        // Wall Collision Bounds
        currentX = Math.max(-ROOM_HALF_WIDTH, Math.min(ROOM_HALF_WIDTH, currentX + dx));
        currentZ = Math.max(-ROOM_HALF_DEPTH, Math.min(ROOM_HALF_DEPTH, currentZ + dz));

        // Head bobbing calculation
        stepCycle += isSprinting ? 0.28 : 0.18;
        const bob = Math.sin(stepCycle) * 4;
        setHeadBob(bob);

        // Footstep sounds on hardwood parquet
        const now = Date.now();
        const stepInterval = isSprinting ? 300 : 450;
        if (now - lastStepTimeRef.current > stepInterval) {
          playWoodenKnock(0.7 + Math.random() * 0.3);
          lastStepTimeRef.current = now;
        }
      } else {
        setHeadBob(0);
      }

      setPosX(currentX);
      setPosZ(currentZ);
      setRotY(currentRotY);

      // Check Artwork Proximity (Interactive Triggers)
      let closest: Museum3DArtwork | null = null;
      let minDistance = 140; // Proximity threshold

      for (const art of artworks) {
        const dist = Math.hypot(currentX - art.x, currentZ - art.z);
        if (dist < minDistance) {
          minDistance = dist;
          closest = art;
        }
      }

      setActiveNearbyArtwork(closest);

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSprinting, artworks]);

  // Pointer Drag Look Handlers (Mouse / Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartPosRef.current.x;
    const deltaY = e.clientY - dragStartPosRef.current.y;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };

    if (tourMode === '360_panorama') {
      setPanoramaYaw((y) => (y - deltaX * 0.35) % 360);
      setPanoramaPitch((p) => Math.max(-40, Math.min(40, p - deltaY * 0.25)));
    } else {
      setRotY((y) => (y + deltaX * 0.35) % 360);
      setRotX((x) => Math.max(-45, Math.min(45, x - deltaY * 0.25)));
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Stamp appreciation Hanko mark
  const handleHankoStamp = (id: string) => {
    playWoodenKnock(1.3);
    setArtworks((prev) =>
      prev.map((art) => (art.id === id ? { ...art, hankoStamps: (art.hankoStamps || 0) + 1 } : art)),
    );
  };

  // Mount artwork onto an empty slot
  const handleMountStudyToSlot = (title: string, dataUrl: string) => {
    if (!targetSlotId) return;
    playWoodenKnock(1.2);
    playSuzuBell();

    setArtworks((prev) =>
      prev.map((art) =>
        art.id === targetSlotId
          ? {
              ...art,
              title: title.trim() || 'My Bruegel Study',
              author: currentUserNickname || 'Cinema Master',
              description: `Oil study created live during the screening in ${roomName}.`,
              curationNote: 'Exhibited on Baltic oak panel with imperial Austrian baroque frame.',
              imageDataUrl: dataUrl,
              isEmptySlot: false,
              tributeCount: 1,
              hankoStamps: 1,
            }
          : art,
      ),
    );
    setIsPaintingModalOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`khm-walkthrough-viewport ${isBackstageView ? 'backstage-mode' : ''} mode-${tourMode}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      tabIndex={0}
      role="application"
      aria-label="Photographic 360 and 3D Walkthrough of KHM Vienna Bruegel Room"
    >
      {/* 3D FLOATING HEADS-UP DISPLAY (HUD) */}
      <div className="khm-hud-overlay">
        {/* Topbar Info & Controls */}
        <div className="khm-hud-topbar">
          <div className="khm-title-badge">
            <span className="khm-crest">🏰</span>
            <div>
              <h3 className="khm-title">KHM Vienna • Saal X (Bruegel Room)</h3>
              <p className="khm-subtext">Photographic Stitched Interior — As seen in Jem Cohen's <em>Museum Hours</em></p>
            </div>
          </div>

          <div className="khm-hud-actions">
            {/* View Mode Toggle Switch */}
            <div className="khm-tour-mode-switch">
              <button
                type="button"
                className={`khm-mode-btn ${tourMode === '360_panorama' ? 'active' : ''}`}
                onClick={() => setTourMode('360_panorama')}
                title="View authentic 360° photographic stitched interior"
              >
                📸 360° Stitched Photo
              </button>
              <button
                type="button"
                className={`khm-mode-btn ${tourMode === '3d_wasd' ? 'active' : ''}`}
                onClick={() => setTourMode('3d_wasd')}
                title="Free-roam 3D architectural gallery with WASD controls"
              >
                🎮 3D WASD Tour
              </button>
            </div>

            {/* RETURN TO MOVIE BUTTON (ALWAYS VISIBLE & PROMINENT) */}
            {onReturnToMovie && (
              <button
                type="button"
                className="khm-hud-btn khm-return-movie-btn"
                onClick={() => {
                  playWoodenKnock(1);
                  onReturnToMovie();
                }}
                title="Return directly to the active cinema movie screening on stage"
              >
                🎬 Return to Movie
              </button>
            )}

            {onOpenEasel && (
              <button
                type="button"
                className="khm-hud-btn khm-easel-btn"
                onClick={onOpenEasel}
                title="Open the Easel Studio to paint on Baltic oak panels"
              >
                🎨 Easel Studio
              </button>
            )}
          </div>
        </div>

        {/* Nintendo-Style Interaction Prompt (Appears near paintings in 3D WASD mode) */}
        {tourMode === '3d_wasd' && activeNearbyArtwork && !inspectedArtwork && !isPaintingModalOpen && (
          <div
            className="khm-proximity-prompt"
            onClick={() => {
              playWoodenKnock(1.1);
              if (activeNearbyArtwork.isEmptySlot) {
                setTargetSlotId(activeNearbyArtwork.id);
                setIsPaintingModalOpen(true);
              } else {
                setInspectedArtwork(activeNearbyArtwork);
              }
            }}
          >
            <span className="prompt-key-badge">E</span>
            <div className="prompt-text-group">
              <strong>{activeNearbyArtwork.isEmptySlot ? '🖼️ Exhibit Your Painting' : `🔍 Examine: ${activeNearbyArtwork.title}`}</strong>
              <span className="prompt-subtext">{activeNearbyArtwork.isEmptySlot ? 'Click to hang your oil study here' : 'Press [E] or Click to Curate'}</span>
            </div>
          </div>
        )}

        {/* Bottom Navigation & Controls Legend */}
        <div className="khm-hud-footer">
          <div className="khm-controls-legend">
            {tourMode === '360_panorama' ? (
              <>
                <span>🖱️ <strong>Click & Drag</strong>: Look 360° around Saal X</span>
                <span>📍 <strong>Click Hotspots</strong>: 40k Gigapixel Inspection</span>
              </>
            ) : (
              <>
                <span>🕹️ <strong>WASD / Arrow Keys</strong>: Walk</span>
                <span>🖱️ <strong>Mouse Drag</strong>: Look 360°</span>
                <span>⚡ <strong>Shift</strong>: Sprint</span>
                <span>[E]: Examine / Curate</span>
              </>
            )}
          </div>

          {/* Compass / Coordinate HUD */}
          <div className="khm-compass-hud">
            <span className="compass-needle" style={{ transform: `rotate(${tourMode === '360_panorama' ? panoramaYaw : -rotY}deg)` }}>▲</span>
            <span className="compass-label">Saal X • KHM Vienna</span>
          </div>
        </div>
      </div>

      {/* 360° PHOTOGRAPHIC STITCHED PANORAMA VIEWPORT */}
      {tourMode === '360_panorama' && (
        <div className="khm-360-panorama-viewport">
          <div
            className="khm-360-cylinder-track"
            style={{
              transform: `translate3d(0, ${panoramaPitch * 4}px, 0) rotateY(${panoramaYaw}deg)`,
            }}
          >
            {/* Real Photographic Panorama Wall Panels */}
            <div className="khm-pano-wall pano-north">
              <div className="pano-wall-title">NORTH WING • DIE JÄGER IM SCHNEE</div>
            </div>
            <div className="khm-pano-wall pano-east">
              <div className="pano-wall-title">EAST WING • BAUERNHOCHZEIT</div>
            </div>
            <div className="khm-pano-wall pano-south">
              <div className="pano-wall-title">SOUTH WING • KINDERSPIELE</div>
            </div>
            <div className="khm-pano-wall pano-west">
              <div className="pano-wall-title">WEST WING • KREUZTRAGUNG</div>
            </div>

            {/* Interactive Masterpiece Hotspots Stitched in Spatial 360 Position */}
            {artworks.map((art, idx) => {
              // Calculate spatial angle in the 360 panorama
              const angle = art.wall === 'north' ? (art.x < 0 ? 330 : 30)
                : art.wall === 'east' ? 90 + (art.z < 0 ? -20 : 20)
                : art.wall === 'south' ? 180 + (art.x < 0 ? -20 : 20)
                : 270 + (art.z < 0 ? -20 : 20);

              return (
                <div
                  key={art.id}
                  className="khm-pano-hotspot-pin"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(480px)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playWoodenKnock(1.1);
                    if (art.isEmptySlot) {
                      setTargetSlotId(art.id);
                      setIsPaintingModalOpen(true);
                    } else {
                      setInspectedArtwork(art);
                    }
                  }}
                >
                  <div className="hotspot-frame-preview">
                    {art.imageDataUrl ? (
                      <img src={art.imageDataUrl} alt={art.title} className="hotspot-img-thumbnail" />
                    ) : (
                      <span className="hotspot-icon">🖼️</span>
                    )}
                  </div>
                  <div className="hotspot-label-pill">
                    <strong>{art.title}</strong>
                    <span>{art.author} ({art.year}) • Click to Examine 40k</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3D ARCHITECTURAL ROOM STAGE (CSS 3D MATRIX ENGINE) */}
      {tourMode === '3d_wasd' && (
      <div className="khm-3d-scene-container">
        <div
          className="khm-3d-camera"
          style={{
            transform: `translateZ(600px) rotateX(${rotX}deg) rotateY(${-rotY}deg) translateY(${headBob}px) translate3d(${-posX}px, 0, ${-posZ}px)`,
          }}
        >
          {/* AUSTRIAN HERRINGBONE PARQUET FLOOR */}
          <div className="khm-room-surface surface-floor" />

          {/* VAULTED CEILING WITH GILDED CORNICES */}
          <div className="khm-room-surface surface-ceiling">
            <div className="khm-chandelier-spotlight" />
          </div>

          {/* NORTH WALL (Facing Z = -350) */}
          <div className="khm-room-surface surface-wall-north">
            <div className="khm-wall-crest-sign">KUNSTHISTORISCHES MUSEUM WIEN • SAAL X</div>
          </div>

          {/* SOUTH WALL (Facing Z = 350) */}
          <div className="khm-room-surface surface-wall-south">
            <div className="khm-wall-crest-sign">PIETER BRUEGEL DER ÄLTERE (1525–1569)</div>
          </div>

          {/* EAST WALL (Facing X = 350) */}
          <div className="khm-room-surface surface-wall-east" />

          {/* WEST WALL (Facing X = -350) */}
          <div className="khm-room-surface surface-wall-west" />

          {/* 3D MOUNTED ARTWORKS ON THE GALLERY WALLS */}
          {artworks.map((art) => {
            const isNear = activeNearbyArtwork?.id === art.id;

            return (
              <div
                key={art.id}
                className={`khm-3d-artwork-frame ${isNear ? 'is-highlighted' : ''} ${art.isEmptySlot ? 'is-empty-slot' : ''}`}
                style={{
                  transform: `translate3d(${art.x}px, ${art.y}px, ${art.z}px) rotateY(${art.rotationY}deg)`,
                  width: `${art.width * 1.8}px`,
                  height: `${art.height * 1.8}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  playWoodenKnock(1.1);
                  if (art.isEmptySlot) {
                    setTargetSlotId(art.id);
                    setIsPaintingModalOpen(true);
                  } else {
                    setInspectedArtwork(art);
                  }
                }}
              >
                {/* Gilded Austrian Baroque Molding */}
                <div className="khm-3d-gilt-frame">
                  {/* Brass Picture Spotlight Lamp */}
                  <div className="khm-3d-brass-lamp">
                    <div className="lamp-bulb" />
                    <div className="lamp-light-cone" />
                  </div>

                  {/* Canvas / Baltic Oak Image Surface */}
                  <div className="khm-3d-canvas-surface">
                    {art.imageDataUrl ? (
                      <img src={art.imageDataUrl} alt={art.title} className="khm-painting-img" />
                    ) : art.isEmptySlot ? (
                      <div className="khm-empty-slot-view">
                        <span className="empty-slot-icon">🖼️</span>
                        <strong>Open Wall Space</strong>
                        <p>Click to Exhibit Study</p>
                      </div>
                    ) : (
                      <div className="khm-masterpiece-placeholder">
                        <span className="placeholder-icon">🏰</span>
                        <strong className="placeholder-title">{art.title}</strong>
                        <span className="placeholder-year">{art.year}</span>
                      </div>
                    )}
                  </div>

                  {/* Brass Museum Placard Plaque */}
                  <div className="khm-brass-placard">
                    <strong className="placard-title">{art.title}</strong>
                    <span className="placard-author">{art.author} ({art.year})</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CENTRAL VELVET MUSEUM SETTEE (For guard contemplation) */}
          <div className="khm-3d-settee" style={{ transform: 'translate3d(0, 70px, 0)' }}>
            <div className="settee-top" />
            <div className="settee-base" />
          </div>
        </div>
      </div>
      )}

      {/* MACRO INSPECTION & CURATION MODAL */}
      {inspectedArtwork && (
        <div className="gallery-modal-backdrop" onClick={() => setInspectedArtwork(null)}>
          <div className="gallery-inspect-modal-card khm-inspect-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="inspect-art-title">
            <button
              type="button"
              className="gallery-modal-close"
              onClick={() => setInspectedArtwork(null)}
              aria-label="Close inspection"
            >
              ×
            </button>

            <div className="gallery-inspect-body khm-gigapixel-inspect-body">
              <div className="khm-gigapixel-viewer-column">
                <div className="khm-scientific-layer-bar">
                  <span className="layer-bar-label">🔬 Scientific Layer:</span>
                  <button
                    type="button"
                    className={`layer-btn ${scientificLayer === 'visible' ? 'active' : ''}`}
                    onClick={() => setScientificLayer('visible')}
                    title="Visible Light 40k Archival Master"
                  >
                    ☀️ Visible Master
                  </button>
                  <button
                    type="button"
                    className={`layer-btn ${scientificLayer === 'irr' ? 'active' : ''}`}
                    onClick={() => setScientificLayer('irr')}
                    title="Infrared Reflectography: Reveals graphite underdrawing preparatory sketches"
                  >
                    🔬 Infrared (IRR)
                  </button>
                  <button
                    type="button"
                    className={`layer-btn ${scientificLayer === 'xray' ? 'active' : ''}`}
                    onClick={() => setScientificLayer('xray')}
                    title="X-Ray Radiography: Shows lead white density and Baltic oak panel grain"
                  >
                    🩻 X-Ray Panel
                  </button>
                </div>

                <div className={`gallery-inspect-img-wrap khm-inspect-img-frame layer-${scientificLayer}`}>
                  {inspectedArtwork.imageDataUrl ? (
                    <img
                      src={inspectedArtwork.imageDataUrl}
                      alt={inspectedArtwork.title}
                      className="inspect-highres-img"
                      style={{
                        transform: `scale(${inspectZoom})`,
                        filter:
                          scientificLayer === 'irr'
                            ? 'grayscale(100%) contrast(160%) brightness(90%) invert(10%)'
                            : scientificLayer === 'xray'
                            ? 'grayscale(100%) contrast(220%) brightness(120%) invert(85%)'
                            : 'contrast(1.05) saturate(1.08)',
                      }}
                    />
                  ) : (
                    <div className="khm-inspect-placeholder">
                      <span className="placeholder-grand-icon">🏰</span>
                      <strong>{inspectedArtwork.germanTitle}</strong>
                      <span className="placeholder-date">{inspectedArtwork.year}</span>
                    </div>
                  )}
                </div>

                {/* Deep-Zoom Controls */}
                <div className="khm-zoom-control-bar">
                  <span className="zoom-label">🔍 Zoom:</span>
                  {[1, 2, 4, 8].map((z) => (
                    <button
                      key={z}
                      type="button"
                      className={`zoom-preset-btn ${inspectZoom === z ? 'active' : ''}`}
                      onClick={() => setInspectZoom(z)}
                    >
                      {z}x {z === 8 ? '(Macro)' : ''}
                    </button>
                  ))}
                  <span className="zoom-hint">Drag image to inspect microscopic craquelure</span>
                </div>
              </div>

              <div className="gallery-inspect-meta">
                <div className="khm-archival-badge">
                  <span>💎 PUBLIC DOMAIN ARCHIVAL MASTER</span>
                  <span className="badge-res">Up to 40,000px Gigapixel Resolution</span>
                </div>

                <h3 id="inspect-art-title" className="inspect-title">{inspectedArtwork.title}</h3>
                <p className="inspect-german-title"><em>{inspectedArtwork.germanTitle}</em> ({inspectedArtwork.year})</p>
                <p className="inspect-author">Artist: <strong>{inspectedArtwork.author}</strong> • KHM Vienna Saal X</p>

                <blockquote className="inspect-inscription">
                  "{inspectedArtwork.description}"
                </blockquote>

                {inspectedArtwork.curationNote && (
                  <div className="khm-curatorial-insight">
                    <span className="insight-badge">🎬 Museum Hours Curatorial Insight:</span>
                    <p>{inspectedArtwork.curationNote}</p>
                  </div>
                )}

                {/* External Gigapixel Archival Deep Links */}
                <div className="khm-archival-links-card">
                  <span className="links-title">🏛️ Archival Master Sources:</span>
                  <div className="links-row">
                    <a
                      href="https://www.insidebruegel.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="archival-link-btn inside-bruegel-link"
                      title="Explore the 40k gigapixel multiresolution scans on Inside Bruegel (KHM Vienna)"
                    >
                      🔬 Inside Bruegel (40k Gigapixel Platform) ↗
                    </a>
                    {inspectedArtwork.imageDataUrl && (
                      <a
                        href={inspectedArtwork.imageDataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="archival-link-btn wikimedia-link"
                        title="Download uncompressed public domain master photograph from Wikimedia Commons"
                      >
                        📥 Full Master Photograph (Direct) ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="inspect-actions-row">
                  <button
                    type="button"
                    className="inspect-stamp-btn"
                    onClick={() => handleHankoStamp(inspectedArtwork.id)}
                  >
                    💮 Stamp Hanko Appreciation ({inspectedArtwork.hankoStamps || 0})
                  </button>

                  {onShareToChat && (
                    <button
                      type="button"
                      className="inspect-share-btn"
                      onClick={() => {
                        onShareToChat(`🏛️ Contemplating Pieter Bruegel's 40k gigapixel master "${inspectedArtwork.title}" in KHM Saal X!`);
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
