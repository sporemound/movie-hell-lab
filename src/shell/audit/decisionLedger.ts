/**
 * Architecture Decision Ledger for Movie Hell / Uniflora Rebuild.
 * 
 * Provides structured traceability from community feedback and survey inputs
 * to concrete engineering decisions and accountability records.
 */

export interface ArchitectureDecision {
  id: string; // e.g. "UF-ARCH-0001"
  title: string;
  status: 'PROPOSED' | 'APPROVED' | 'IMPLEMENTED' | 'REVISED' | 'SUPERSEDED';
  origin: string; // e.g. "Security Review + CryptPad Foundations Survey"
  context: string;
  decision: string;
  rationale: string;
  tradeoffs: {
    advantages: string[];
    disadvantages: string[];
  };
  reversibility: 'EASY' | 'MODERATE' | 'DIFFICULT';
  date: string;
}

export const DECISION_RECORDS: ArchitectureDecision[] = [
  {
    id: 'UF-ARCH-0001',
    title: 'Complete Elimination of Passwords and Email Verification',
    status: 'IMPLEMENTED',
    origin: 'Rebuild Security Directives & Zero-PII Boundaries',
    context: 'Traditional password hashing and email verification create central honeypots, credential stuffing vectors, and unnecessary user surveillance.',
    decision: 'Replace login/registration forms with local pseudonymous lounge handles and capability-based session tokens.',
    rationale: 'Community participants can enter and chat immediately without surrendering PII or creating durable attack surfaces.',
    tradeoffs: {
      advantages: ['Zero password leak risk', 'Zero email harvesting', 'Frictionless guest entry', 'Complete user pseudonymity'],
      disadvantages: ['No persistent cross-device password recovery (by design)']
    },
    reversibility: 'EASY',
    date: '2026-08-19'
  },
  {
    id: 'UF-ARCH-0002',
    title: 'Universal Media Adapter Architecture (Decoupled Video Transport)',
    status: 'IMPLEMENTED',
    origin: 'Platform Cooperativism & Replaceability Research',
    context: 'Hardcoding a single commercial streaming vendor creates catastrophic dependency if that provider changes policies, pricing, or bans users.',
    decision: 'Decouple media transport into pluggable adapters: VDO.Ninja (P2P WebRTC), Meshcast.io, Owncast, and MediaMTX.',
    rationale: 'If any media provider disappears or fails, the core platform (chat, rooms, canvas, discovery) survives without disruption.',
    tradeoffs: {
      advantages: ['Zero infrastructure cost for P2P screenings', 'No single point of failure', 'Provider-agnostic interface'],
      disadvantages: ['Different stream types have varying latency profiles']
    },
    reversibility: 'EASY',
    date: '2026-08-19'
  },
  {
    id: 'UF-ARCH-0003',
    title: 'Fail-Soft Creative Atelier & Canvas Isolation',
    status: 'IMPLEMENTED',
    origin: 'Feminist/Autonomous Server Practice & Repairability',
    context: 'Past live-canvas errors could cause uncaught React exceptions that crashed video playback and disconnected active chat sessions.',
    decision: 'Wrap live canvas overlays and trace tools in isolated React error boundaries and separate rendering contexts.',
    rationale: 'Creative tool crashes must fail soft: canvas pauses in isolation while video and chat continue uninterrupted.',
    tradeoffs: {
      advantages: ['100% video and chat uptime during drawing failures', 'Graceful recovery UI'],
      disadvantages: ['Slightly more component boundary boilerplate']
    },
    reversibility: 'EASY',
    date: '2026-08-19'
  },
  {
    id: 'UF-ARCH-0004',
    title: 'Grassroots Blocklace DAG Control Plane',
    status: 'IMPLEMENTED',
    origin: 'Ehud Shapiro arXiv:2301.04391 Formal Research',
    context: 'Centralized server state machines create single administrator choke points and lack transparent, verifiable causal history.',
    decision: 'Model control-plane room transitions as an authenticated multi-parent blocklace DAG b = (h_p, H, x).',
    rationale: 'Guarantees causal ordering, non-interference, and reviewable auditability for decentralized projectionist actions.',
    tradeoffs: {
      advantages: ['Verifiable event causality', 'Decentralized consensus ready', 'Multi-parent redundancy'],
      disadvantages: ['Requires DAG traversal for state projection']
    },
    reversibility: 'MODERATE',
    date: '2026-08-19'
  },
  {
    id: 'UF-ARCH-0005',
    title: 'WebRTC Opus Audio Codec Standard & AAC Incompatibility Mitigation',
    status: 'IMPLEMENTED',
    origin: 'Live Ingest Verification & WebRTC Specifications',
    context: 'Traditional RTMP encoders (OBS Studio) default to AAC audio. WebRTC natively requires the Opus codec, causing AAC streams to fail connection negotiation or output silence.',
    decision: 'Enforce Opus audio encoder guidance in UI modals and documentation, providing clear configuration presets for OBS Studio WHIP.',
    rationale: 'Prevents silent playback and connection errors during community live broadcasts.',
    tradeoffs: {
      advantages: ['High-fidelity, ultra-low-latency audio', 'Native browser WebRTC compliance'],
      disadvantages: ['Broadcasters must ensure OBS audio encoder is set to Opus rather than default AAC']
    },
    reversibility: 'EASY',
    date: '2026-08-19'
  }
];
