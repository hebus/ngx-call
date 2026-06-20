import { afterNextRender, Component, computed, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

const UNMOUNT_DELAY = 300; // matches the CSS transition so it can animate out

interface SheetAction {
  id: string;
  label: string;
  icon?: string;
}

// A mobile-pattern panel that slides up from the bottom. The exit animation is
// driven by `entered && !call.ended()`, with a matching unmount delay.
@Component({
  selector: "bottom-sheet",
  host: {
    "(document:keydown.escape)": "call.end(null)",
    "(document:mousedown)": "onDoc($event)"
  },
  template: `
    <div class="ad-overlay ad-overlay--bottom ad-overlay--animated" [class.is-closing]="!open()" role="dialog" aria-modal="true" [attr.aria-label]="call.props().title">
      <div #sheet class="ad-sheet" [class.is-closing]="!open()">
        <div class="ad-grabber" aria-hidden="true"></div>
        <p class="ad-title" style="padding: 0.25rem 0.5rem">{{ call.props().title }}</p>
        <ul class="ad-list">
          @for (a of call.props().actions; track a.id) {
            <li>
              <button (click)="call.end(a.id)" style="padding: 0.75rem">
                <span style="display: flex; align-items: center; gap: 0.75rem">
                  @if (a.icon) {
                    <span aria-hidden="true">{{ a.icon }}</span>
                  }
                  <span>{{ a.label }}</span>
                </span>
              </button>
            </li>
          }
        </ul>
      </div>
    </div>
  `
})
class BottomSheet {
  protected readonly call = injectCallRef<{ title: string; actions: readonly SheetAction[] }, string | null>();
  private readonly sheet = viewChild.required<ElementRef<HTMLElement>>("sheet");
  private readonly entered = signal(false);
  protected readonly open = computed(() => this.entered() && !this.call.ended());

  constructor() {
    afterNextRender(() => this.entered.set(true));
  }

  protected onDoc(event: MouseEvent): void {
    if (!this.sheet().nativeElement.contains(event.target as Node)) this.call.end(null);
  }
}

// Second arg = unmount delay (ms) so the slide-out can play before teardown.
const Sheet = createCallable<{ title: string; actions: readonly SheetAction[] }, string | null>(BottomSheet, UNMOUNT_DELAY);

const SHEET_ACTIONS: readonly SheetAction[] = [
  { id: "share", label: "Share", icon: "⇪" },
  { id: "copy-link", label: "Copy link", icon: "⤴" },
  { id: "pin", label: "Pin", icon: "📌" },
  { id: "archive", label: "Archive", icon: "🗄" }
];

@Component({
  selector: "bottom-sheet-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Quick actions</button>
    <span class="ex-status" [class.ex-status--ok]="!!last()">{{ last() ? "→ " + last() : "→ no action yet" }}</span>
  `
})
export class BottomSheetExample {
  protected readonly last = signal<string | null>(null);

  protected async run(): Promise<void> {
    const id = await Sheet.call({ title: "Quick actions", actions: SHEET_ACTIONS });
    if (id) this.last.set(id);
  }
}
