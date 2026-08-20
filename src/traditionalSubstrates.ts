import type { TraditionalSubstrateId, GalleryFrameStyle, CanvasTool } from './types';

export interface TraditionalSubstrateInfo {
  id: TraditionalSubstrateId;
  name: string;
  kanjiName: string;
  description: string;
  baseColor: string;
  cssTexture: string;
  recommendedTool: CanvasTool;
  recommendedPalette: string[];
  defaultFrame: GalleryFrameStyle;
}

export const TRADITIONAL_SUBSTRATES: TraditionalSubstrateInfo[] = [
  {
    id: 'washi',
    name: 'Echizen Mulberry Washi',
    kanjiName: '越前和紙',
    description: 'Handmade Japanese mulberry paper with fibrous tooth, deckle edges, and wet ink bleed.',
    baseColor: '#f7f2e4',
    cssTexture: 'radial-gradient(circle at 50% 50%, rgba(240, 230, 210, 0.6) 0%, #ede3cc 100%)',
    recommendedTool: 'sumi_brush',
    recommendedPalette: ['#1a1614', '#2d2621', '#4a3f36', '#6b5c4f', '#a83232', '#c9783e', '#e3a857'],
    defaultFrame: 'kakemono_scroll',
  },
  {
    id: 'gold_byobu',
    name: 'Gilded Gold Screen (Byōbu)',
    kanjiName: '金箔 屏風',
    description: 'Hammered metallic gold leaf foil screen with soft warm specular sheen and aged patina.',
    baseColor: '#e0b852',
    cssTexture: 'linear-gradient(135deg, #e5be58 0%, #caa13b 40%, #edd27c 70%, #b8912e 100%)',
    recommendedTool: 'nihonga_mineral',
    recommendedPalette: ['#0f172a', '#1e3a8a', '#065f46', '#991b1b', '#d97706', '#fef08a', '#111827'],
    defaultFrame: 'byobu_screen',
  },
  {
    id: 'hangi_wood',
    name: 'Cedar Woodblock (Hangi)',
    kanjiName: '版木 木版',
    description: 'Burnished cedar woodblock with carved grain ridges for Mokuhanga relief printmaking.',
    baseColor: '#c8955a',
    cssTexture: 'linear-gradient(90deg, #bb8449 0%, #d49f63 25%, #a87239 50%, #cca068 75%, #b37c41 100%)',
    recommendedTool: 'woodcut_gouge',
    recommendedPalette: ['#1c100b', '#dc2626', '#1e40af', '#15803d', '#ea580c', '#ffffff'],
    defaultFrame: 'muku_cedar',
  },
  {
    id: 'kakemono_silk',
    name: 'Ancient Woven Silk',
    kanjiName: '絹本 絵絹',
    description: 'Fine-woven natural silk textile substrate for delicate ink wash scrolls and court paintings.',
    baseColor: '#eee6d4',
    cssTexture: 'radial-gradient(circle at 30% 30%, #f4ede0 0%, #e2d7be 100%)',
    recommendedTool: 'sumi_brush',
    recommendedPalette: ['#111111', '#3f352c', '#852e2e', '#416246', '#2b4764', '#b38234'],
    defaultFrame: 'kakemono_scroll',
  },
  {
    id: 'raw_linen',
    name: 'Belgian Primed Linen',
    kanjiName: '麻布 キャンバス',
    description: 'Heavy textured primed natural linen canvas with coarse weave for thick impasto and oils.',
    baseColor: '#dfd7c6',
    cssTexture: 'linear-gradient(45deg, #e2dacf 25%, #d5ccbe 50%, #e6dec5 75%)',
    recommendedTool: 'impasto_knife',
    recommendedPalette: ['#b91c1c', '#c2410c', '#b45309', '#15803d', '#1d4ed8', '#4338ca', '#f8fafc', '#0f172a'],
    defaultFrame: 'urushi_lacquer',
  },
  {
    id: 'khm_oak',
    name: 'Bruegel Baltic Oak Panel',
    kanjiName: '樫木板 画板',
    description: 'Chalk-primed 16th-century Baltic oak panel as used by Pieter Bruegel in the KHM Vienna collection.',
    baseColor: '#d6b88d',
    cssTexture: 'linear-gradient(90deg, #c7a474 0%, #dbbe96 35%, #b89363 70%, #d4b489 100%)',
    recommendedTool: 'sumi_brush',
    recommendedPalette: ['#1e140d', '#78350f', '#9a3412', '#166534', '#1e3a8a', '#d97706', '#f8fafc'],
    defaultFrame: 'khm_baroque',
  },
  {
    id: 'genko_manga',
    name: 'Manga Manuscript Paper',
    kanjiName: '原稿用紙',
    description: 'Ultra-smooth bright white illustration bristol with cyan blue margin rules and safety grids.',
    baseColor: '#fcfcfc',
    cssTexture: 'linear-gradient(to right, #fcfcfc, #f7f9fa)',
    recommendedTool: 'pen',
    recommendedPalette: ['#000000', '#262626', '#525252', '#0284c7', '#dc2626', '#ffffff'],
    defaultFrame: 'urushi_lacquer',
  },
];

export interface GalleryFrameInfo {
  id: GalleryFrameStyle;
  name: string;
  kanjiName: string;
  description: string;
  borderWidth: string;
  cssStyle: string;
}

export const GALLERY_FRAMES: GalleryFrameInfo[] = [
  {
    id: 'kakemono_scroll',
    name: 'Gilded Silk Hanging Scroll',
    kanjiName: '掛軸 表装',
    description: 'Traditional brocade silk mounting with brass bottom roller and braided cord header.',
    borderWidth: '24px 18px 48px',
    cssStyle: 'linear-gradient(180deg, #442211 0%, #2a140a 100%)',
  },
  {
    id: 'khm_baroque',
    name: 'KHM Vienna Imperial Gilded Baroque Frame',
    kanjiName: '帝室 黄金額装',
    description: 'Ornate Austrian imperial gilded frame with brass gallery picture light and archival plaque.',
    borderWidth: '20px',
    cssStyle: 'linear-gradient(135deg, #ffd700 0%, #b8860b 40%, #d4af37 70%, #8b6508 100%)',
  },
  {
    id: 'urushi_lacquer',
    name: 'Black Urushi Lacquer Frame',
    kanjiName: '漆塗 額縁',
    description: 'Mirror-finish Japanese black lacquer frame with thin burnished gold leaf inner liner.',
    borderWidth: '16px',
    cssStyle: 'linear-gradient(135deg, #1e090f 0%, #080204 100%)',
  },
  {
    id: 'muku_cedar',
    name: 'Natural Muku Cedar Box Frame',
    kanjiName: '無垢 杉木額',
    description: 'Hand-hewn natural aromatic cedar with exposed mitred dovetail corner joints.',
    borderWidth: '18px',
    cssStyle: 'linear-gradient(135deg, #7c4c16 0%, #542d16 100%)',
  },
  {
    id: 'byobu_screen',
    name: '2-Panel Folding Screen (Byōbu)',
    kanjiName: '二曲屏風',
    description: 'Gold-leaf paneled folding screen with black lacquered timber borders and silk hinges.',
    borderWidth: '12px 14px',
    cssStyle: 'linear-gradient(90deg, #2b1509 0%, #150803 100%)',
  },
];
