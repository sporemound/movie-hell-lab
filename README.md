# Movie Hell (Uniflora Rebuild Lab)

> **A small, collectively influenced, decentralized community media platform and synchronized screening lounge for international film and video appreciators.**

Movie Hell is built from the ground up as an open digital commons. The platform decouples identity, media transport, realtime chat, and collaborative canvas atelier tools so the community never depends on a single commercial streaming provider, identity vendor, or central administrator.

---

## 🧭 Core Architectural Principles

- **No Passwords & Zero Email Tracking**: Users enter pseudonymously with local capability-based session tokens. No email verification, no tracking, and no central password silos.
- **Universal Multi-Pipeline Media Ingest**: Video transport supports three resilient, low-latency broadcast paths:
  1. **VDO.Ninja Direct Screen & System Audio**: Zero-software browser WebRTC capture transmitting 1080p 60FPS video and stereo audio directly into the stage.
  2. **MediaMTX RTMP-to-WebRTC Router**: Standard, indestructible OBS RTMP ingest (`rtmp://localhost:1935/live`) converted to sub-second WebRTC WHEP / Low-Latency HLS.
  3. **Cloudflare Stream Anycast Ingest**: Global Anycast RTMPS & WHIP backed by Cloudflare's enterprise TURN relay network.
  4. **Platform Embeds**: Native support for Picarto, Kick, Twitch, and SMPTE offline calibration bars.
- **Public Room + Secret Stream Token Security Model**: Public rooms remain discoverable (`?room=auditorium`), while broadcaster stream keys are protected by 64-bit cryptographic session secrets to prevent stream hijacking on public instances.
- **Dynamic On-Demand Room Creation**: Rooms referenced in URL queries or friend invite links (`?room=my_room&stream=...`) are registered on-demand with instant WebSocket ticket negotiation.
- **Fail-Soft Creative Atelier**: Live collaborative multi-page sketching and on-stage film tracing are isolated within fault boundaries.
- **Pitch-Black Fullscreen Experience**: Solid black `#000000` backdrop with zero borders, dark color schemes, and closed velvet curtains by default to prevent white loading flashes.
- **12-Factor & Zero-PII Compliance**: Strict separation of config from code ([12-Factor App](https://12factor.net/config)) and automated pre-commit privacy scanning.

---

## 🎥 Projection Booth & Broadcasting Guide

The **Projection Booth** (accessible from the top bar or stage controls) provides four distinct broadcasting methods:

### Method 1: VDO.Ninja Screen & System Audio (Recommended — Zero Installs)

> [!TIP]
> Best for streaming full desktop audio, movie players, or OBS Fullscreen Projectors without installing extra software or virtual audio loopbacks.

1. Open **Projection Booth** $\to$ stay on **`🖥️ VDO.Ninja (Screen & Audio)`**.
2. Click **`🚀 1. Launch Broadcaster Studio (New Tab)`**.
3. In Chrome/Edge's screen share popup:
   - Choose your **OBS Fullscreen Projector** or media player window.
   - **Crucial**: Ensure the **"Share system audio"** / **"Also share tab audio"** checkbox is checked.
   - Click **Share**.
4. Return to Movie Hell and click **`🎬 2. Project Stream to Stage`**.
5. Click **`📋 Copy Private Screening Link`** to share the synchronized screening with friends.

---

### Method 2: MediaMTX Media Router (Standard OBS RTMP $\to$ Sub-Second WebRTC)

> [!NOTE]
> Best for traditional OBS RTMP setups. Streams over standard TCP (indestructible across VPNs and firewalls) while stage viewers receive sub-second WebRTC WHEP.

1. Download the standalone, portable binary: **[MediaMTX for Windows (GitHub Releases)](https://github.com/bluenviron/mediamtx/releases)**.
2. Extract the zip and double-click **`mediamtx.exe`** (a lightweight terminal window opens showing RTMP on `:1935` and WebRTC on `:8889`).
3. In OBS Studio (**Settings $\to$ Stream**):
   - **Service**: `Custom...`
   - **Server**: `rtmp://localhost:1935/live` (or copy from Projection Booth)
   - **Stream Key**: Copy the secret room key from the **`⚡ MediaMTX`** tab (e.g. `auditorium_k8f9a2_3m1`).
4. In OBS Studio (**Settings $\to$ Output**):
   - **Video Encoder**: Set to **`NVIDIA NVENC H.264`** or **`x264`** (WebRTC requires H.264).
   - **Audio Encoder**: Set to **`Opus`** or **`AAC`**.
5. In OBS, click **Start Streaming**.
6. In Movie Hell, click **`🎬 Project MediaMTX Stream to Stage`**.

---

### Method 3: Cloudflare Stream (Global Anycast & Enterprise TURN)

1. In OBS, set Service to **Custom...** and Server to `rtmps://live.cloudflare.com:443/live/`.
2. Paste your Cloudflare Live Input **Stream Key** into OBS.
3. In Movie Hell's **`☁️ Cloudflare Stream`** tab, enter your Customer Domain and Live Stream ID.
4. Click **`🎬 Project Cloudflare Stream to Stage`**.

---

## 🛠️ Local Development

### Requirements
- **Node.js**: `v22+` and `npm`
- **Python**: `3.11+` (for mathematical reference suite)

### 1. Install Dependencies
```bash
npm ci
npm run worker:typegen
```

### 2. Run Local Stack
Run the client and Worker in separate terminals:

```powershell
# Terminal 1: Vite Frontend (:5173)
npm run dev

# Terminal 2: Local Worker + D1 SQLite (:8787)
npm run worker:dev
```

Open `http://127.0.0.1:5173` in your browser. Enter any cinema handle to join the lounge.

---

## 🧪 Testing & Validation

Movie Hell maintains a strict multi-stage validation pipeline:

```powershell
# 1. Run full project validation (Privacy Scan + Typechecks + Build + Dry-Run + Audit)
npm run validate

# 2. Run automated privacy scan only
npm run privacy:scan

# 3. Run frontend and worker typechecks
npm run typecheck

# 4. Run Grassroots mathematical reference tests
python research/math/movie_hell_math.py
```

---

## 🚀 Deployment (Private Test Cohort)

Deployments use an untracked, gitignored `wrangler.local.jsonc` configuration:

```powershell
# 1. Generate local deployment configuration (with your real D1 UUID)
node scripts/create-local-config.mjs <D1_DATABASE_ID>

# 2. Apply remote D1 schema migrations
node scripts/apply-remote-migrations.mjs

# 3. Build frontend assets and deploy worker
npm run deploy
```

---

## 📚 Repository Structure

```
video-hell/
├── src/
│   ├── shell/
│   │   ├── media/             # Universal Media Adapters (VDO.Ninja, MediaMTX, Cloudflare)
│   │   │   ├── adapters/      # Broadcaster & Viewer URL builders
│   │   │   └── ProjectionBoothModal.tsx # Multi-pipeline broadcast control center
│   │   └── canvas/            # Canvas Error Boundaries & Fail-soft wrappers
│   ├── utils/channelParser.ts # Multi-platform stream address parser
│   ├── TheaterStage.tsx       # Cinema stage player, velvet curtains & trace overlay
│   ├── KritaStudio.tsx        # Collaborative multi-page sketchpad
│   ├── Faq.tsx                # Community FAQ component
│   └── App.tsx                # Passwordless Cinema Lounge & Room Router
├── worker.ts                  # Cloudflare Worker, D1 Persistence & ChatRoom DO
├── migrations/                # D1 SQLite schema migrations (0001-0012)
├── research/
│   └── math/                  # Grassroots systems & relay-tree reference math
├── scripts/                   # Automated privacy scanning & deployment tools
├── wrangler.jsonc             # Template config (strictly 00000000 UUIDs)
└── PRIVACY_BOUNDARIES.md      # Zero-PII & 12-Factor specification
```

---

## 🔒 Security & Privacy Directives

- **Zero Real PII**: No real user emails, passwords, or personal handles are ever stored or committed.
- **Privacy Scanner**: `npm run privacy:scan` automatically validates all files before git commits.
- **Reporting Vulnerabilities**: See [SECURITY.md](./SECURITY.md) for private reporting procedures.
