import React, { useState } from 'react';
import { playWoodenKnock, playSuzuBell } from './shrineSound';

export interface EmaVotive {
  id: string;
  title: string;
  authorName: string;
  roomName: string;
  imageDataUrl: string;
  createdAt: string;
  candleCount?: number;
  bellCount?: number;
  inscription?: string;
  slotIndex?: number;
  facetIndex?: number;
  customColor?: string;
}

interface EmaTabletProps {
  ema: EmaVotive;
  onSelect?: (ema: EmaVotive) => void;
  onLightCandle?: (id: string) => void;
  onRingBell?: (id: string) => void;
  isInspected?: boolean;
  compact?: boolean;
}

export function EmaTablet({
  ema,
  onSelect,
  onLightCandle,
  onRingBell,
  isInspected = false,
  compact = false,
}: EmaTabletProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [candleLit, setCandleLit] = useState(false);
  const [bellRung, setBellRung] = useState(false);

  // Deterministic slight natural hanging tilt (-3.5deg to +3.5deg) based on ID
  const naturalTilt = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < ema.id.length; i++) {
      hash = (hash << 5) - hash + ema.id.charCodeAt(i);
      hash |= 0;
    }
    return ((Math.abs(hash) % 70) - 35) / 10;
  }, [ema.id]);

  const handleLightCandle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!candleLit) {
      setCandleLit(true);
      onLightCandle?.(ema.id);
    }
  };

  const handleRingBell = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSuzuBell();
    setBellRung(true);
    setTimeout(() => setBellRung(false), 800);
    onRingBell?.(ema.id);
  };

  const handleClick = () => {
    playWoodenKnock(1.1);
    onSelect?.(ema);
  };

  return (
    <div
      className={`ema-tablet-container ${compact ? 'ema-compact' : ''} ${isHovered ? 'ema-hovered' : ''} ${isInspected ? 'ema-inspected' : ''}`}
      style={{
        ['--natural-tilt' as string]: `${naturalTilt}deg`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ema Votive Artwork: ${ema.title} by ${ema.authorName}`}
    >
      {/* Hanging Braided Red Cord & Brass Ring */}
      <div className="ema-hanging-cord" aria-hidden="true">
        <div className="ema-brass-hook" />
        <div className="ema-silk-knot" />
      </div>

      {/* Wooden Pentagonal Ema Tablet */}
      <div className="ema-wood-tablet">
        {/* Woodgrain & Burnished Texture Overlay */}
        <div className="ema-wood-grain" />

        {/* Ema Header Eyelet & Inscription */}
        <div className="ema-roof-peak">
          <div className="ema-eyelet" />
          <span className="ema-sacred-crest">奉納</span>
        </div>

        {/* Main Artwork Surface */}
        <div className="ema-art-frame">
          {ema.imageDataUrl ? (
            <img
              src={ema.imageDataUrl}
              alt={ema.title}
              className="ema-art-image"
              loading="lazy"
            />
          ) : (
            <div className="ema-art-placeholder">
              <span>🎨</span>
            </div>
          )}
        </div>

        {/* Ema Footer: Title & Red Cinnabar Seal */}
        <div className="ema-footer">
          <div className="ema-title-box">
            <strong className="ema-title">{ema.title || 'Screening Dedication'}</strong>
            {!compact && <span className="ema-meta">{ema.roomName}</span>}
          </div>

          <div className="ema-hanko-seal" title={`Artist: @${ema.authorName}`}>
            <span>{ema.authorName.slice(0, 2).toUpperCase()}</span>
          </div>
        </div>

        {/* Shrine Tributes / Counter Pills (Shown on larger view or hover) */}
        {(!compact || isHovered) && (
          <div className="ema-tributes-row">
            <button
              type="button"
              className={`ema-tribute-btn ${candleLit ? 'active' : ''}`}
              onClick={handleLightCandle}
              title="Light a tribute lantern for this artwork"
            >
              🏮 <span>{(ema.candleCount || 0) + (candleLit ? 1 : 0)}</span>
            </button>

            <button
              type="button"
              className={`ema-tribute-btn ${bellRung ? 'bell-anim' : ''}`}
              onClick={handleRingBell}
              title="Ring sacred Suzu bell chime in tribute"
            >
              🔔 <span>{(ema.bellCount || 0) + (bellRung ? 1 : 0)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
