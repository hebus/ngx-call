import { afterNextRender, Component, computed, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
}

// A searchable action list with keyboard navigation (arrows, Enter, Esc).
// Resolves with the chosen command id, or null on dismiss.
@Component({
  selector: "command-palette",
  host: {
    "(document:keydown)": "onKey($event)",
    "(document:mousedown)": "onDoc($event)"
  },
  template: `
    <div class="ad-overlay ad-overlay--top" role="dialog" aria-modal="true" aria-label="Command palette">
      <div #panel class="ad-palette">
        <input #input type="text" placeholder="Type a command…" [value]="query()" (input)="query.set($any($event.target).value)" />
        <ul class="ad-list">
          @if (filtered().length === 0) {
            <li><span class="hint" style="display: block; padding: 0.5rem 0.75rem">No matches</span></li>
          } @else {
            @for (cmd of filtered(); track cmd.id; let i = $index) {
              <li>
                <button [class.is-active]="i === active()" (mouseenter)="active.set(i)" (click)="call.end(cmd.id)">
                  <span>{{ cmd.label }}</span>
                  @if (cmd.shortcut) {
                    <span class="hint">{{ cmd.shortcut }}</span>
                  }
                </button>
              </li>
            }
          }
        </ul>
      </div>
    </div>
  `
})
class CommandPalette {
  protected readonly call = injectCallRef<{ commands: readonly Command[] }, string | null>();
  protected readonly query = signal("");
  protected readonly active = signal(0);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>("panel");
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>("input");

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.call.props().commands;
    return q ? all.filter(c => c.label.toLowerCase().includes(q)) : all;
  });

  constructor() {
    afterNextRender(() => this.input().nativeElement.focus());
  }

  protected onDoc(event: MouseEvent): void {
    if (!this.panel().nativeElement.contains(event.target as Node)) this.call.end(null);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === "Escape") this.call.end(null);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.active.update(a => Math.min(this.filtered().length - 1, a + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.active.update(a => Math.max(0, a - 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = this.filtered()[this.active()];
      if (item) this.call.end(item.id);
    }
  }
}

const Palette = createCallable<{ commands: readonly Command[] }, string | null>(CommandPalette);

const COMMANDS: readonly Command[] = [
  { id: "new-file", label: "New file", shortcut: "⌘ N" },
  { id: "open", label: "Open…", shortcut: "⌘ O" },
  { id: "save", label: "Save", shortcut: "⌘ S" },
  { id: "find", label: "Find in files", shortcut: "⌘ ⇧ F" },
  { id: "toggle-theme", label: "Toggle theme" },
  { id: "restart", label: "Restart" }
];

@Component({
  selector: "command-palette-example",
  template: `
    <button class="btn btn-mono" (click)="run()">⌘ K</button>
    <span class="ex-status" [class.ex-status--ok]="!!last()">{{ last() ? "→ " + last() : "→ no command run yet" }}</span>
  `
})
export class CommandPaletteExample {
  protected readonly last = signal<string | null>(null);

  protected async run(): Promise<void> {
    const id = await Palette.call({ commands: COMMANDS });
    if (id) this.last.set(id);
  }
}
