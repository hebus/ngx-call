import { Component, signal } from "@angular/core";

interface InstallTab {
  id: string;
  label: string;
  command: string;
}

/** Tabbed install snippet: the npm package (npm / pnpm / yarn / bun) and the AI agent skill. */
@Component({
  selector: "install-block",
  template: `
    <div class="install-block">
      <div class="tabs" role="tablist">
        @for (tab of tabs; track tab.id) {
          <button
            class="tab"
            role="tab"
            type="button"
            [class.tab--active]="active() === tab.id"
            [attr.aria-selected]="active() === tab.id"
            (click)="active.set(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
      @for (tab of tabs; track tab.id) {
        @if (active() === tab.id) {
          <div class="cmd" role="tabpanel">
            <span class="prompt" aria-hidden="true">$</span>
            <code class="cmd-text">{{ tab.command }}</code>
            <button class="copy" type="button" (click)="copy(tab.command)">
              {{ copied() ? "Copied ✓" : "Copy" }}
            </button>
          </div>
        }
      }
      <p class="hint">
        @if (active() === "skill") {
          Teaches your coding agent (Claude Code, Cursor, Copilot…) how to use ngx-call.
        } @else {
          Then register <code>provideCallable()</code> once in your <code>bootstrapApplication</code> providers.
        }
      </p>
    </div>
  `,
  styles: [
    `
      .install-block {
        width: 100%;
        max-width: 44rem;
        text-align: left;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 0.85rem;
        overflow: hidden;
      }

      .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        padding: 0.5rem 0.6rem 0;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-bg-subtle);
      }

      .tab {
        font: inherit;
        font-family: var(--font-code);
        font-size: 0.78rem;
        padding: 0.5rem 0.85rem;
        color: var(--color-fg-subtle);
        background: transparent;
        border: 0;
        border-bottom: 2px solid transparent;
        cursor: pointer;
      }

      .tab:hover {
        color: var(--color-fg);
      }

      .tab--active {
        color: var(--color-accent);
        border-bottom-color: var(--color-accent);
      }

      .cmd {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.1rem;
      }

      .prompt {
        color: var(--color-accent);
        font-family: var(--font-code);
      }

      .cmd-text {
        flex: 1;
        min-width: 0;
        overflow-x: auto;
        white-space: nowrap;
        padding: 0;
        background: none;
        color: var(--color-fg);
        font-size: 0.9rem;
      }

      .copy {
        font: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        color: var(--color-fg-muted);
        background: transparent;
        border: 1px solid var(--color-border-strong);
        border-radius: 0.45rem;
        cursor: pointer;
      }

      .copy:hover {
        color: var(--color-accent);
        border-color: var(--color-accent);
      }

      .hint {
        margin: 0;
        padding: 0 1.1rem 1rem;
        font-size: 0.8rem;
        color: var(--color-fg-subtle);
      }
    `
  ]
})
export class InstallBlock {
  protected readonly tabs: readonly InstallTab[] = [
    { id: "npm", label: "npm", command: "npm install ngx-call" },
    { id: "pnpm", label: "pnpm", command: "pnpm add ngx-call" },
    { id: "yarn", label: "yarn", command: "yarn add ngx-call" },
    { id: "bun", label: "bun", command: "bun add ngx-call" },
    { id: "skill", label: "AI skill", command: "npx skills add hebus/ngx-call --skill ngx-call" }
  ];
  protected readonly active = signal("npm");
  protected readonly copied = signal(false);

  protected async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // clipboard unavailable (insecure context): the command stays selectable.
    }
  }
}
