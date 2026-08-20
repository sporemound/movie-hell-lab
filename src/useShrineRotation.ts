import { useState, useRef, useEffect, useCallback } from 'react';
import { playCordRustle } from './shrineSound';

interface ShrineRotationOptions {
  facetCount?: number;
  friction?: number;
  sensitivity?: number;
}

export function useShrineRotation({
  facetCount = 6,
  friction = 0.93,
  sensitivity = 0.45,
}: ShrineRotationOptions = {}) {
  const [rotationY, setRotationY] = useState(0);
  const [tiltX, setTiltX] = useState(-6);
  const [isDragging, setIsDragging] = useState(false);

  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const lastSoundAngleRef = useRef(0);

  // Keep ref in sync
  rotationRef.current = rotationY;

  // Inertia decay loop
  const updateInertia = useCallback(() => {
    if (isDraggingRef.current) return;

    if (Math.abs(velocityRef.current) > 0.02) {
      velocityRef.current *= friction;
      rotationRef.current += velocityRef.current;
      setRotationY(rotationRef.current);

      // Subtle audio feedback when revolving past facets
      const facetAngle = 360 / facetCount;
      if (Math.abs(rotationRef.current - lastSoundAngleRef.current) >= facetAngle * 0.9) {
        playCordRustle();
        lastSoundAngleRef.current = rotationRef.current;
      }

      animFrameRef.current = requestAnimationFrame(updateInertia);
    } else {
      velocityRef.current = 0;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [friction, facetCount]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click or single touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isDraggingRef.current = true;
    setIsDragging(true);
    lastPointerXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) {
      // Subtle parallax tilt when moving cursor without dragging
      const rect = e.currentTarget.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      setTiltX(-6 + relY * 12);
      return;
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dx = e.clientX - lastPointerXRef.current;

    const instantVelocity = (dx / dt) * 16 * sensitivity;
    velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;

    rotationRef.current += dx * sensitivity;
    setRotationY(rotationRef.current);

    lastPointerXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    animFrameRef.current = requestAnimationFrame(updateInertia);
  };

  // Programmatic smooth rotation to specific facet angle
  const rotateToFacet = (facetIndex: number) => {
    const facetAngle = 360 / facetCount;
    const targetAngle = -facetIndex * facetAngle;
    velocityRef.current = 0;
    setRotationY(targetAngle);
    rotationRef.current = targetAngle;
    playCordRustle();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    rotationY,
    tiltX,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    rotateToFacet,
    setRotationY,
  };
}
