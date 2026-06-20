import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CATEGORIES, EXAMPLES, ExampleMeta } from "./examples/registry";

/** Landing page: hero + call-to-action, then every example as a card, grouped by category. */
@Component({
  selector: "examples-home",
  imports: [RouterLink],
  template: `
    <!-- ── Hero ──────────────────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>

      <span class="eyebrow anim-rise" style="animation-delay: 0.05s">Angular · Type-safe · Zero boilerplate</span>

      <h1 class="hero-title anim-rise" style="animation-delay: 0.12s">
        Call a dialog like<br />
        a <span class="gradient-text">function</span>.
      </h1>

      <p class="hero-sub anim-rise" style="animation-delay: 0.2s">
        <strong>ngx-call</strong> brings React's <code>createCallable</code> to Angular — imperative, type-safe,
        promise-based overlays. Await a confirm. Resolve a value. No template wiring, no boilerplate.
      </p>

      <div class="hero-cta anim-rise" style="animation-delay: 0.28s">
        <a class="btn-cta btn-cta--primary" [href]="repoUrl" target="_blank" rel="noopener">
          <span aria-hidden="true">★</span> Star on GitHub
        </a>
        <a class="btn-cta btn-cta--ghost" routerLink="/" fragment="examples">Explore 21 examples ↓</a>
      </div>

      <div class="code-window anim-rise" style="animation-delay: 0.36s">
        <div class="win-titlebar">
          <span class="win-dot win-dot--r"></span>
          <span class="win-dot win-dot--y"></span>
          <span class="win-dot win-dot--g"></span>
          <span class="win-file">confirm.ts</span>
        </div>
        <pre class="code-body"><code><span class="t-key">import</span> <span class="t-pun">&#123;</span> createCallable <span class="t-pun">&#125;</span> <span class="t-key">from</span> <span class="t-str">"ngx-call"</span><span class="t-pun">;</span>

<span class="t-com">// 1 — bind any component, once</span>
<span class="t-key">export const</span> <span class="t-fn">Confirm</span> <span class="t-pun">=</span> <span class="t-fn">createCallable</span><span class="t-type">&lt;&#123; message: string &#125;, boolean&gt;</span><span class="t-pun">(</span>ConfirmDialog<span class="t-pun">);</span>

<span class="t-com">// 2 — call it like a function, anywhere</span>
<span class="t-key">const</span> ok <span class="t-pun">=</span> <span class="t-key">await</span> <span class="t-fn">Confirm</span>.<span class="t-fn">call</span><span class="t-pun">(&#123;</span> message: <span class="t-str">"Delete this item?"</span> <span class="t-pun">&#125;);</span>
<span class="t-com">//    ^ resolves to boolean — fully typed</span></code></pre>
      </div>
    </section>

    <!-- ── Proof line ────────────────────────────────────────────────────── -->
    <div class="proof anim-rise" style="animation-delay: 0.44s">
      <span><b>21</b> live examples</span><span class="sep">·</span>
      <span><b>0</b> dependencies</span><span class="sep">·</span>
      <span><b>100%</b> type-safe</span><span class="sep">·</span>
      <span>Angular <b>20+</b></span>
    </div>

    <!-- ── Examples ──────────────────────────────────────────────────────── -->
    <div id="examples">
      <div class="examples-head">
        <h2>Every pattern, live.</h2>
        <p>The 21 official react-call examples, ported to Angular — each one with its full source.</p>
      </div>

      @for (cat of categories; track cat) {
        <section class="cat">
          <h3 class="cat-title">{{ cat }}</h3>
          <div class="ex-grid">
            @for (ex of byCategory(cat); track ex.slug) {
              <a class="ex-link glow-card" [routerLink]="['/examples', ex.slug]">
                <h4>{{ ex.title }}</h4>
                <p>{{ ex.description }}</p>
                <span class="go">View example →</span>
              </a>
            }
          </div>
        </section>
      }
    </div>

    <!-- ── Final CTA ─────────────────────────────────────────────────────── -->
    <section class="final-cta">
      <h2>If it saved you boilerplate, <span class="gradient-text">star it.</span></h2>
      <p>Every star helps more Angular developers discover ngx-call.</p>
      <div class="final-actions">
        <a class="btn-cta btn-cta--primary" [href]="repoUrl" target="_blank" rel="noopener">
          <span aria-hidden="true">★</span> Star on GitHub
        </a>
        <code class="install">npm i ngx-call</code>
      </div>
    </section>
  `,
  styles: [
    `
      /* Hero */
      .hero {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5rem 0 1rem;
      }

      .hero > *:not(.hero-glow) {
        position: relative;
        z-index: 1;
      }

      .hero-glow {
        position: absolute;
        top: -7rem;
        left: 50%;
        transform: translateX(-50%);
        width: min(92vw, 52rem);
        height: 34rem;
        background: radial-gradient(50% 50% at 50% 50%, rgb(212 165 116 / 0.2), transparent 70%);
        filter: blur(36px);
        pointer-events: none;
        z-index: 0;
      }

      .eyebrow {
        font-family: var(--font-code);
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-accent);
        padding: 0.4rem 0.9rem;
        border: 1px solid rgb(212 165 116 / 0.3);
        border-radius: 999px;
        background: rgb(212 165 116 / 0.06);
        margin-bottom: 1.6rem;
      }

      .hero-title {
        font-family: var(--font-heading);
        font-weight: 400;
        font-size: clamp(2.75rem, 9vw, 6rem);
        line-height: 1.03;
        letter-spacing: -0.01em;
        margin: 0 0 1.4rem;
        color: var(--color-fg);
      }

      .hero-sub {
        max-width: 40rem;
        margin: 0 0 2rem;
        font-size: clamp(1rem, 1.6vw, 1.15rem);
        color: var(--color-fg-muted);
      }

      .hero-sub strong {
        color: var(--color-fg);
        font-weight: 600;
      }

      .hero-cta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.85rem;
        justify-content: center;
        margin-bottom: 3rem;
      }

      /* Code window */
      .code-window {
        width: 100%;
        max-width: 44rem;
        overflow: hidden;
        text-align: left;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 0.85rem;
        box-shadow: 0 0 60px rgb(212 165 116 / 0.08), 0 30px 60px -25px rgb(0 0 0 / 0.9);
      }

      .win-file {
        margin-left: 0.55rem;
        font-family: var(--font-code);
        font-size: 0.72rem;
        color: var(--color-fg-subtle);
      }

      .code-body {
        margin: 0;
        padding: 1.1rem 1.35rem;
        overflow-x: auto;
        font-family: var(--font-code);
        font-size: 0.82rem;
        line-height: 1.7;
        color: var(--color-fg-muted);
      }

      /* Mirrors the Vesper shiki theme used on the example pages, for consistency. */
      .t-com {
        color: #8b8b8b;
        font-style: italic;
      }
      .t-key {
        color: #a0a0a0;
      }
      .t-fn,
      .t-type {
        color: #ffc799;
      }
      .t-str {
        color: #99ffe4;
      }
      .t-pun {
        color: #a0a0a0;
      }

      /* Proof line */
      .proof {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem 1rem;
        padding: 2rem 0 0.5rem;
        font-size: 0.9rem;
        color: var(--color-fg-muted);
      }

      .proof b {
        color: var(--color-accent);
        font-weight: 700;
      }

      .proof .sep {
        color: var(--color-border-strong);
      }

      /* Examples */
      #examples {
        scroll-margin-top: 5rem;
      }

      .examples-head {
        text-align: center;
        margin: 3.5rem 0 1rem;
      }

      .examples-head h2 {
        font-family: var(--font-heading);
        font-weight: 400;
        font-size: clamp(1.7rem, 4vw, 2.4rem);
        margin: 0 0 0.4rem;
        color: var(--color-fg);
      }

      .examples-head p {
        margin: 0;
        color: var(--color-fg-muted);
        font-size: 0.95rem;
      }

      .cat {
        padding: 1.75rem 0;
        border-top: 1px solid var(--color-border);
      }

      .cat-title {
        font-family: var(--font-code);
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin: 0 0 1rem;
        color: var(--color-fg-subtle);
      }

      .ex-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
        gap: 1rem;
      }

      .ex-link {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding: 1.1rem 1.25rem;
        text-decoration: none;
        color: inherit;
      }

      .ex-link h4 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-fg);
      }

      .ex-link p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--color-fg-subtle);
      }

      .go {
        margin-top: 0.35rem;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--color-accent);
      }

      /* Final CTA */
      .final-cta {
        margin-top: 3.5rem;
        padding: 3.25rem 2rem;
        text-align: center;
        border: 1px solid rgb(212 165 116 / 0.25);
        border-radius: 1rem;
        background: radial-gradient(120% 130% at 50% 0%, rgb(212 165 116 / 0.1), var(--color-bg) 60%);
      }

      .final-cta h2 {
        font-family: var(--font-heading);
        font-weight: 400;
        font-size: clamp(1.8rem, 4.5vw, 2.9rem);
        margin: 0 0 0.6rem;
        color: var(--color-fg);
      }

      .final-cta p {
        margin: 0 0 1.85rem;
        color: var(--color-fg-muted);
      }

      .final-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        justify-content: center;
      }

      .install {
        font-family: var(--font-code);
        font-size: 0.85rem;
        padding: 0.6rem 1rem;
        border: 1px dashed var(--color-border-strong);
        border-radius: 0.6rem;
        background: rgb(255 255 255 / 0.02);
        color: var(--color-fg-muted);
      }
    `
  ]
})
export class ExamplesHome {
  /** Single point of truth for the GitHub CTA. */
  protected readonly repoUrl = "https://github.com/hebus/ngx-call";
  protected readonly categories = CATEGORIES;
  protected byCategory(category: string): ExampleMeta[] {
    return EXAMPLES.filter(e => e.category === category);
  }
}
