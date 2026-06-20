import { Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/">
        ngx<span class="brand-dot">·</span>call
      </a>
      <nav class="nav">
        <a class="nav-link" routerLink="/" fragment="examples">Examples</a>
        <a class="nav-link nav-link--muted" href="https://github.com/desko27/react-call" target="_blank" rel="noopener"
          >inspired by react-call ↗</a
        >
        <a
          class="btn-cta btn-cta--primary nav-star"
          href="https://github.com/hebus/ngx-call"
          target="_blank"
          rel="noopener"
          aria-label="Star ngx-call on GitHub"
        >
          <span aria-hidden="true">★</span><span class="nav-star-label">Star on GitHub</span>
        </a>
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .topbar {
        position: sticky;
        top: 0;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem 1.5rem;
        background: color-mix(in srgb, var(--bg) 80%, transparent);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgb(212 165 116 / 0.12);
      }

      .brand {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        letter-spacing: 0.01em;
        color: var(--color-fg);
        text-decoration: none;
      }

      .brand-dot {
        color: var(--color-accent);
      }

      .nav {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .nav-link {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--color-fg-muted);
        text-decoration: none;
        transition: color 0.15s ease;
      }

      .nav-link:hover {
        color: var(--color-fg);
      }

      .nav-link--muted {
        color: var(--color-fg-subtle);
      }

      .nav-star {
        padding: 0.5rem 0.95rem;
        font-size: 0.82rem;
      }

      @media (max-width: 560px) {
        .nav-link--muted {
          display: none;
        }
        .nav-star-label {
          display: none;
        }
        .nav-star {
          padding: 0.5rem 0.7rem;
        }
      }
    `
  ]
})
export class App {}
