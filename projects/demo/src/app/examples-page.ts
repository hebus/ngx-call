import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { map } from "rxjs";
import { CATEGORIES, EXAMPLES, TAGS } from "./examples/registry";

/** All examples as a flat grid, filterable by category and tag (kept in the URL query string). */
@Component({
  selector: "examples-page",
  imports: [RouterLink],
  template: `
    <h1 class="title">Examples</h1>
    <p class="lede">Real callables you can interact with — each one with its full source.</p>

    <div class="filters">
      <div class="chips" role="group" aria-label="Filter by category">
        <button type="button" class="chip" [class.chip--on]="!category()" (click)="setCategory(null)">All</button>
        @for (cat of categories; track cat) {
          <button type="button" class="chip" [class.chip--on]="category() === cat" (click)="setCategory(cat)">
            {{ cat }}
          </button>
        }
      </div>
      <div class="chips" role="group" aria-label="Filter by feature">
        @for (t of tags; track t) {
          <button type="button" class="chip chip--tag" [class.chip--on]="tag() === t" (click)="setTag(t)">
            {{ t }}
          </button>
        }
      </div>
    </div>

    <div class="ex-grid">
      @for (ex of filtered(); track ex.slug) {
        <a class="ex-link glow-card" [routerLink]="['/examples', ex.slug]">
          <div class="meta">
            <span class="badge">{{ ex.category }}</span>
            @for (t of ex.tags ?? []; track t) {
              <span class="badge badge--tag">{{ t }}</span>
            }
          </div>
          <h4>{{ ex.title }}</h4>
          <p>{{ ex.description }}</p>
        </a>
      } @empty {
        <p class="empty">
          No example matches these filters.
          <button type="button" class="reset" (click)="reset()">Clear filters</button>
        </p>
      }
    </div>

    <p class="count">{{ filtered().length }} of {{ total }} examples</p>
  `,
  styles: [
    `
      .title {
        font-family: var(--font-heading);
        font-weight: 400;
        font-size: clamp(2rem, 5vw, 3rem);
      }

      .lede {
        margin-bottom: 1.75rem;
      }

      .filters {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        margin-bottom: 1.75rem;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .chip {
        font: inherit;
        font-size: 0.8rem;
        padding: 0.35rem 0.8rem;
        color: var(--color-fg-muted);
        background: transparent;
        border: 1px solid var(--color-border-strong);
        border-radius: 999px;
        cursor: pointer;
        transition:
          color 0.15s ease,
          border-color 0.15s ease,
          background 0.15s ease;
      }

      .chip:hover {
        color: var(--color-fg);
        border-color: var(--color-fg-subtle);
      }

      .chip--tag {
        font-family: var(--font-code);
        font-size: 0.74rem;
      }

      .chip--on {
        color: var(--color-accent-fg);
        background: var(--color-accent);
        border-color: var(--color-accent);
      }

      .chip--on:hover {
        color: var(--color-accent-fg);
        border-color: var(--color-accent-hover);
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
        margin: 0.2rem 0 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-fg);
      }

      .ex-link p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--color-fg-subtle);
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .badge {
        font-family: var(--font-code);
        font-size: 0.66rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-accent);
      }

      .badge--tag {
        padding: 0 0.4rem;
        color: var(--color-fg-subtle);
        border: 1px solid var(--color-border-strong);
        border-radius: 999px;
        text-transform: none;
        letter-spacing: 0;
      }

      .empty {
        grid-column: 1 / -1;
        text-align: center;
        color: var(--color-fg-muted);
      }

      .reset {
        font: inherit;
        color: var(--color-accent);
        background: none;
        border: 0;
        cursor: pointer;
        text-decoration: underline;
      }

      .count {
        margin: 1.5rem 0 0;
        text-align: center;
        font-size: 0.8rem;
        color: var(--color-fg-subtle);
      }
    `
  ]
})
export class ExamplesPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(
    this.route.queryParamMap.pipe(map(p => ({ category: p.get("category"), tag: p.get("tag") }))),
    { initialValue: { category: null as string | null, tag: null as string | null } }
  );

  protected readonly categories = CATEGORIES;
  protected readonly tags = TAGS;
  protected readonly total = EXAMPLES.length;
  protected readonly category = computed(() => this.params().category);
  protected readonly tag = computed(() => this.params().tag);
  protected readonly filtered = computed(() => {
    const category = this.category();
    const tag = this.tag();
    return EXAMPLES.filter(e => (!category || e.category === category) && (!tag || e.tags?.includes(tag)));
  });

  protected setCategory(category: string | null): void {
    this.navigate({ category });
  }

  /** Clicking the active tag again clears it. */
  protected setTag(tag: string): void {
    this.navigate({ tag: this.tag() === tag ? null : tag });
  }

  protected reset(): void {
    this.navigate({ category: null, tag: null });
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true
    });
  }
}
