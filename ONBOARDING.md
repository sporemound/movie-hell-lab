# 🎬 Movie Hell: Operator & Attendee Physical Onboarding Guide

A complete spatial guide to navigating the Movie Hell auditorium, projection stage, live chat, interactive canvas, and administrative consoles.

---

## 🗺️ Physical Layout Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [🍿 Movie Hell]   [📺 Screening Lounge]  [❓ Guide]  [👑 Admin]  [🛡️ Mod]   [🍄 Mycotroph] CinemaHost ✏️ [Leave] │ ← Top Bar
├──────────────────────────────────────────────────────────┬─────────────────────────────┤
│                                                          │  [💬 Chat] [🎨 Canvas] [👥] │
│                                                          │ ─────────────────────────── │
│                 📽️ MAIN THEATER STAGE                     │  Live Room Chat Stream      │
│          (Active Live Stream / Native HLS Video)         │                             │
│                                                          │  • Projectionist: Welcome!🍿│
│   [📐 Atelier Trace]  [🔊 Mute]  [🗗 Popout]  [⛶ Full]    │  • Guest-402: glurp         │
│                                                          │                             │
│                                                          │ ─────────────────────────── │
│                                                          │ [ 😀 ] [ Message... ] [Send]│
├─────────────────────────────┬────────────────────────────┴─────────────────────────────┤
│ 🚪 SCREENING ROOMS          │ 📺 CHANNELS & PROVENANCE DIRECTORY                       │
│ • # General Lobby           │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│ • # House Stage             │ │ 🏛️ Couch Live │ │ 🛡️ Studio A │ │ 📼 Archive   │     │
│ • # Midnight Vault          │ │ 🟢 Live • 1080p │ │ 🔴 Offline   │ │ 🟢 Live • 720p│     │
│                             │ └───────────────┘ └───────────────┘ └───────────────┘     │
│ 🗳️ Pitch Channel Proposal   │ 🔄 Refresh Lineup                                        │
└─────────────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 1. Top Navigation Bar (Header)

Located at the very **top of your screen**:

* **🍿 Movie Hell Logo (Far Left)**: Click anytime to return to the default screening lounge and reset views.
* **Navigation Links (Left-Center)**:
  * **`📺 Screening Lounge`**: Returns to the active theater stage, chat, and room selector.
  * **`❓ FAQ & Guide`**: Opens the system documentation, security rules, and troubleshooting tips.
  * **`👑 Admin Desk`** *(Visible to Admins)*: Opens the backend operations dashboard (Channels, Users, Session Passes, Multi-Sig Approvals, Audit Logs).
  * **`🛡️ Mod Desk`** *(Visible to Moderators & Admins)*: Quick moderation desk to review community channel proposals and chat moderation.
* **Attendee Account Pill (Far Right)**:
  * **Role Badge (`👑 Admin` / `🛡️ Mod` / `🍄 Mycotroph` / `🎟️ Member`)**: Displays your verified status.
  * **Handle / Nickname**: Your current display name (e.g. `SporeWatcher-482`).
  * **`✏️` Edit Handle Button**: Click the small pencil icon to immediately rename or finalize your display handle without disconnecting.
  * **`Leave` Button**: Securely ends your current session and returns to the guest reception desk.

---

## 2. The Main Projection Stage (Top Center)

The centerpiece of the auditorium hosting the active video stream:

* **Primary Video Screen**: Plays synchronized native HLS video or embedded feeds.
* **Stage Floating Toolbar (Bottom Right of Video Container)**:
  * **`📐 Cinema Atelier / Trace Mode`**: Toggles the interactive transparent drawing glass directly over the live video frame.
  * **`🔊 Sound / Mute Toggle`**: Unmutes stream audio (browsers mute by default on initial autoplay).
  * **`🗗 Pop-out Theater`**: Launches the video stream into a separate, resizable floating picture-in-picture window.
  * **`⛶ Fullscreen`**: Expands the video stage to fill your entire display.
* **Provenance Guild Crest (Top Left of Video Container)**:
  * **`🏛️ House`**: Official canonical screening channel.
  * **`🛡️ Community`**: Verified community streamer.
  * **`📼 Archive`**: Preserved recording or historic playback.

---

## 3. Cinema Atelier & Trace Mode (On-Screen Glass)

When clicking **`📐 Trace Mode`**, a transparent canvas overlays the live stream:

* **Floating Trace Toolbar (Top Center of Video)**:
  * **`✏️ Pen` / `🧹 Soft Eraser` / `🧼 Hard Eraser`**: Selects your active stylus tool.
  * **`🖌️ Size` Dropdown**: Adjusts line thickness from hairline detail (`2px`) to broad strokes (`32px`).
  * **Color Swatches**: Click any dot to pick **Projection Gold**, **Neon Cyan**, **Cinema Crimson**, **Laser Lime**, **Electric Magenta**, or **Chalk White**.
  * **Custom Color Input (Square Box)**: Pick any custom hex color.
  * **`Trace Opacity` Slider**: Dims the underlying video so your tracing lines stand out with high contrast.
  * **`📸 Frame + Trace`**: Captures the exact video frame under your drawing, layers them together at your chosen opacity, and downloads a composite PNG.
  * **`🏁 PNG Overlay`**: Exports only your drawing as a clean, transparent PNG with layer alpha preserved.
  * **`✕ Exit Trace`**: Closes trace mode while preserving your drawing state.

---

## 4. Screening Rooms & Channel Request Box (Bottom Left Column)

Located in the **lower left column**:

* **🚪 Screening Rooms Drawer**:
  * Click any room card (`# General Lobby`, `# House Stage`, etc.) to switch chat audiences and collaborative canvases.
* **🗳️ Channel Request Box (Below Room List)**:
  * **`Channel Name`**: Enter the title of the stream you want to broadcast.
  * **`Platform Binding`**: Select `Kick`, `Owncast`, or `Picarto`.
  * **`Channel Identifier / Slug`**: Enter the channel handle or instance domain.
  * **`Reason for Proposal`**: Short justification for the screening.
  * Click **`🗳️ Submit Channel Proposal`** to submit it to the community and moderators for voting.

---

## 5. Channels Lineup & Provenance Directory (Bottom Center Column)

Located in the **lower center area**:

* **Lineup Grid**: Displays real-time status cards for all authorized streams.
  * **`🟢 Live` / `🔴 Offline`**: Live status indicators.
  * **`On Stage` Badge**: Highlights which stream is currently projecting on the stage above.
  * **Switching Channels**: Click any card in this grid to instantly switch the main stage projector to that stream.
* **`🔄 Refresh Lineup` Button**: Re-polls upstream status endpoints for live viewer counts and stream titles.

---

## 6. Live Chat & Collaborative Canvas (Right Column)

Located in the **docked panel on the right**:

* **Panel Tab Selector (Top of Right Panel)**:
  * **`💬 Chat` Tab**: Active room message feed with timestamps, badges, and mentions.
  * **`🎨 Canvas` Tab**: Full collaborative multi-layer canvas with brushes, sprayers, geometry tools, and layer clearing.
  * **`👥 Chatters` Tab**: Searchable list of all attendees currently in the room. Click the `@` icon next to any name to mention them in chat.
* **Chat Composer (Bottom of Right Panel)**:
  * **`😀 Emoji Picker`**: Opens the custom emoji drawer containing house server stickers.
  * **Message Input**: Type your message or paste URLs.
  * **`Send` Button (or `Enter` key)**: Broadcasts message instantly across the WebSocket mesh.

---

## 7. Admin Control Room ([`/admin`](https://movie-hell.pages.dev/admin))

For operators with `👑 Admin` credentials:

| Tab Icon & Name | Exact Location | Primary Function |
| :--- | :--- | :--- |
| **`📺 Channels & Streams`** | Tab Bar (1st Tab) | Register, edit, boundarize, quarantine, or delete stream provenance and direct HLS feeds. |
| **`🎟️ Session Passes`** | Tab Bar (2nd Tab) | Generate 1-click guest invite links with custom expiration timers and auto-assigned handles. |
| **`👥 Users & Access`** | Tab Bar (3rd Tab) | View user IDs, revoke sessions, delete accounts, and click **`🍄 Grant / Revoke Mycotroph`**. |
| **`🗳️ Channel Approvals`** | Tab Bar (4th Tab) | Cast multi-sig approval or override votes on community channel proposals. |
| **`📜 Audit Log`** | Tab Bar (5th Tab) | Inspect timestamped cryptographic audit events for all operator actions. |
