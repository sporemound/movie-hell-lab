const securityPolicyUrl = './SECURITY.md';

export default function Faq() {
  return (
    <section className="faq-page" aria-labelledby="faq-heading">
      <div className="panel faq-hero">
        <p className="panel-kicker">Ask the projection booth · Research &amp; Prototyping Lab</p>
        <h2 id="faq-heading" tabIndex={-1}>Movie Hell FAQ</h2>
        <p className="faq-lede">
          Movie Hell is an experimental, decentralized community media space and synchronized screening lounge.
          We are rebuilding from the ground up as an open digital commons for international film and video appreciators.
        </p>

        <div className="approval-explainer" aria-labelledby="approval-heading">
          <div>
            <p className="panel-kicker">Capability-based authority &amp; consensus</p>
            <h3 id="approval-heading">Decentralized curation adds choices—it never dictates them</h3>
            <p>
              Any attendee may propose or stream a screening channel. In our decentralized model,
              screening choices and catalog additions are governed via capability tokens and multi-party community
              consensus. Once admitted, participants choose their own screen, trace, and chat without central platform lock-in.
            </p>
          </div>
          <ol className="approval-steps">
            <li><span>1</span><strong>Pitch / Push</strong><small>Provide a VDO.Ninja room, Owncast node, or stream link.</small></li>
            <li><span>2</span><strong>Lineup</strong><small>The channel appears on the screening marquee.</small></li>
            <li><span>3</span><strong>Attestation</strong><small>Projectionists and members review stream provenance.</small></li>
            <li><span>4</span><strong>Screening</strong><small>Velvet curtains part to live, ultra-low-latency video.</small></li>
          </ol>
          <p className="faq-note">
            The media transport is fully decoupled from the platform core. If a streaming host goes offline, the auditorium, chat, and collaborative atelier remain active.
          </p>
        </div>
      </div>

      <div className="faq-grid">
        <article className="panel faq-card faq-card-wide">
          <p className="faq-card-label">The Rebuild</p>
          <h3>What is the Movie Hell Rebuild?</h3>
          <p>
            Movie Hell is in an active research and experimentation phase inspired by Subvert.fm, platform cooperativism,
            and Grassroots Distributed Systems (Ehud Shapiro, arXiv:2301.04391). We are creating a small, collectively
            influenced media platform that does not require commercial streaming monopolies, identity trackers, or central server surveillance.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Zero Accounts &amp; Privacy</p>
          <h3>Do I need an email or password to join?</h3>
          <p>
            <strong>No.</strong> Movie Hell completely eliminates passwords and email verification.
            Simply type any pseudonym or click <strong>🎲 Re-roll Handle</strong> on the landing lounge to enter immediately.
            Sessions are capability-based and stored locally in your browser.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Universal Media Adapters</p>
          <h3>How does live video streaming work?</h3>
          <p>
            Movie Hell uses a pluggable Universal Media Adapter architecture:
            <br />
            • <strong>VDO.Ninja P2P WebRTC</strong>: Zero-infrastructure peer-to-peer browser screenshares &amp; camera feeds.
            <br />
            • <strong>Meshcast.io</strong>: Low-latency WebRTC relay scaling VDO.Ninja rooms up to 100+ concurrent viewers.
            <br />
            • <strong>Owncast / HLS</strong>: Self-hosted independent live streaming servers.
            <br />
            • <strong>Synthetic Test Pattern</strong>: Offline SMPTE test bars for lab verification.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">OBS Audio &amp; Codecs</p>
          <h3>Why does OBS WHIP require Opus audio (not AAC)?</h3>
          <p>
            The WebRTC standard natively requires the <strong>Opus</strong> audio codec. Traditional RTMP encoders default to <strong>AAC</strong>, which is incompatible with WebRTC/VDO.Ninja and will fail to connect or output silence.
            <br />
            In OBS: open <strong>Settings</strong> &rarr; <strong>Output</strong> &rarr; set <strong>Audio Encoder</strong> to <strong>Opus</strong>.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Cinema Atelier</p>
          <h3>How does on-stage Trace Mode work?</h3>
          <p>
            Click <strong>📐 Trace Mode</strong> on the video stage to overlay a transparent drawing pane over the video.
            You can sketch film studies, dim the video with the <strong>Trace Opacity</strong> slider, and export snapshots via
            <strong>📸 Frame + Trace</strong> or clean transparent overlays via <strong>🏁 PNG Overlay</strong>.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Fail-Soft Isolation</p>
          <h3>What is Fail-Soft Canvas Isolation?</h3>
          <p>
            The live canvas layer is isolated within its own fault boundary. If a creative tool or client-side canvas error occurs,
            it safely pauses in isolation without freezing your video playback, disconnecting chat, or corrupting room state.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Cinema Controls</p>
          <h3>Why is audio muted when I switch channels?</h3>
          <p>
            Modern web browsers enforce autoplay audio policies. Click the <strong>🔊 Unmute</strong> button on the
            stage floating controls bar to enable sound. You can also click <strong>🗗 Pop-out Theater</strong>
            to watch in a floating standalone window.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Collaborative Sketchpad</p>
          <h3>How does the shared multi-page canvas work?</h3>
          <p>
            Switch to the <strong>🎨 Canvas</strong> tab in the right-hand panel. Each screening room provides
            a synchronized multi-page sketchbook supporting real-time brush strokes, geometric shapes,
            spray tools, palette swatches, and high-resolution transparent PNG exports.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Authority &amp; Governance</p>
          <h3>How does capability-based authority work?</h3>
          <p>
            Instead of rigid hierarchical administrator tiers, authority is divided into narrow, grantable capabilities
            (such as <em>may-host-screening</em>, <em>may-publish-stream</em>, and <em>may-moderate-chat</em>).
            Room governance remains locally autonomous and reviewable.
          </p>
        </article>

        <article className="panel faq-card">
          <p className="faq-card-label">Privacy &amp; 12-Factor Standard</p>
          <h3>Is my personal data protected?</h3>
          <p>
            Yes. Movie Hell operates under strict 12-Factor separation and a non-negotiable Zero Real PII standard.
            Real emails, passwords, and cloud database IDs are never collected, logged, or hardcoded.
          </p>
        </article>

        <article className="panel faq-card faq-card-wide">
          <p className="faq-card-label">Security &amp; Lab Guidelines</p>
          <h3>How do I report a security issue or contribute research?</h3>
          <p>
            Do not post suspected vulnerabilities in public chats or request pitches.
            Follow the repository&apos;s private reporting guidance and allow maintainers time to
            investigate before public disclosure.
          </p>
          <a className="faq-inline-link" href={securityPolicyUrl} target="_blank" rel="noreferrer">
            Read the private-reporting policy <span aria-hidden="true">↗</span>
          </a>
        </article>
      </div>
    </section>
  );
}
