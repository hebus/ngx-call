import { Component, computed, input, signal, ViewEncapsulation } from "@angular/core";
import { MarkdownComponent } from "shikidown";
import { SOURCES } from "./examples/_sources.generated";

/**
 * Displays the verbatim source of an example, rendered and syntax-highlighted by
 * shikidown. The source itself is baked in at build time (scripts/gen-code.mjs)
 * so the code shown is exactly the code that runs. Includes a copy button.
 *
 * Uses ViewEncapsulation.None so the (prefixed) styles can reach the highlighted
 * `pre.shiki` markup that shikidown renders.
 */
@Component({
  selector: "code-block",
  imports: [MarkdownComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cb">
      <div class="cb-head">
        <span class="cb-file">{{ slug() }}.ts</span>
        <button class="cb-copy" (click)="copy()">{{ copied() ? "Copied ✓" : "Copy" }}</button>
      </div>
      <shikidown class="cb-body" [content]="markdown()" />
    </div>
  `,
  styles: [
    `
      .cb {
        border: 1px solid var(--color-border);
        border-radius: 0.6rem;
        overflow: hidden;
        background: var(--color-bg);
      }

      .cb-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.85rem;
        background: rgb(255 255 255 / 0.02);
        border-bottom: 1px solid var(--color-border);
      }

      .cb-file {
        font-family: var(--font-code);
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
      }

      .cb-copy {
        font: inherit;
        font-size: 0.72rem;
        padding: 0.25rem 0.6rem;
        color: var(--color-fg-muted);
        background: var(--color-bg-muted);
        border: 1px solid var(--color-border-strong);
        border-radius: 0.4rem;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }

      .cb-copy:hover {
        background: var(--color-bg-subtle);
        color: var(--color-accent);
        border-color: rgb(212 165 116 / 0.5);
      }

      .cb-body {
        display: block;
      }

      .cb-body pre {
        margin: 0;
        padding: 1rem 1.1rem;
        overflow-x: auto;
        font-family: var(--font-code);
        font-size: 0.78rem;
        line-height: 1.6;
        tab-size: 2;
      }

      /* Neutralise the global inline-code styling so it can't bleed over the
         Shiki-highlighted block (which carries its own dark background/colors). */
      .cb-body code {
        background: transparent;
        padding: 0;
        border-radius: 0;
        font-size: inherit;
        font-family: inherit;
      }
    `
  ]
})
export class CodeBlock {
  readonly slug = input.required<string>();
  protected readonly copied = signal(false);

  /** The source wrapped in a TypeScript fenced code block for shikidown. */
  protected readonly markdown = computed(() => "```typescript\n" + (SOURCES[this.slug()] ?? "") + "\n```");

  protected async copy(): Promise<void> {
    await navigator.clipboard.writeText(SOURCES[this.slug()] ?? "");
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
