import { Component, computed, inject } from "@angular/core";
import { NgComponentOutlet } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map } from "rxjs";
import { CodeBlock } from "./code-block";
import { findExample } from "./examples/registry";

/** A single example: live demo on top, verbatim source below. */
@Component({
  selector: "example-page",
  imports: [RouterLink, NgComponentOutlet, CodeBlock],
  template: `
    @if (example(); as ex) {
      <a class="back" routerLink="/">← All examples</a>
      <h1>{{ ex.title }}</h1>
      <p class="lede">{{ ex.description }}</p>

      <div class="stage">
        <ng-container *ngComponentOutlet="ex.component" />
      </div>

      <h2>Source</h2>
      <p class="muted hint">The component, the callable, and the trigger — everything you need to reproduce it.</p>
      <code-block [slug]="ex.slug" />
    } @else {
      <p class="lede">Unknown example. <a routerLink="/">Back to all examples →</a></p>
    }
  `,
  styles: [
    `
      .back {
        display: inline-block;
        margin-bottom: 1.5rem;
        font-size: 0.85rem;
        color: var(--color-fg-muted);
        text-decoration: none;
      }

      .back:hover {
        color: var(--color-fg);
      }

      h1 {
        font-family: var(--font-heading);
        font-weight: 400;
        font-size: clamp(1.9rem, 4vw, 2.6rem);
      }

      h2 {
        font-size: 1rem;
        margin: 2.5rem 0 0.25rem;
        color: var(--color-fg);
      }

      .hint {
        margin: 0 0 1rem;
        font-size: 0.8rem;
      }

      .stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        min-height: 14rem;
        margin-top: 1rem;
        padding: 2.5rem 1.5rem;
        text-align: center;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 0.75rem;
        box-shadow: 0 0 50px rgb(212 165 116 / 0.05), 0 24px 48px -28px rgb(0 0 0 / 0.8);
      }
    `
  ]
})
export class ExamplePage {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(this.route.paramMap.pipe(map(p => p.get("slug"))));
  protected readonly example = computed(() => findExample(this.slug() ?? null));
}
