import { Component, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

interface Item {
  id: string;
  name: string;
  hint?: string;
}

// List selection: resolves with the chosen item, or null on cancellation.
@Component({
  selector: "item-picker",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true" [attr.aria-label]="call.props().title">
      <div class="ad-panel" style="max-width: 24rem; padding: 0.5rem">
        <div class="ad-actions ad-actions--split" style="margin: 0; padding: 0.5rem 0.75rem">
          <p class="ad-title" style="font-size: 0.9rem">{{ call.props().title }}</p>
          <button class="ad-close" aria-label="Cancel" (click)="call.end(null)">×</button>
        </div>
        <ul class="ad-list">
          @for (item of call.props().items; track item.id) {
            <li>
              <button (click)="call.end(item)">
                <span>{{ item.name }}</span>
                @if (item.hint) {
                  <span class="hint">{{ item.hint }}</span>
                }
              </button>
            </li>
          }
        </ul>
      </div>
    </div>
  `
})
class ItemPicker {
  protected readonly call = injectCallRef<{ title: string; items: readonly Item[] }, Item | null>();
}

const Picker = createCallable<{ title: string; items: readonly Item[] }, Item | null>(ItemPicker);

const FRUITS: readonly Item[] = [
  { id: "apple", name: "Apple", hint: "🍎" },
  { id: "banana", name: "Banana", hint: "🍌" },
  { id: "cherry", name: "Cherry", hint: "🍒" },
  { id: "grape", name: "Grape", hint: "🍇" },
  { id: "mango", name: "Mango", hint: "🥭" }
];

@Component({
  selector: "item-picker-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Pick a fruit</button>
    <span class="ex-status" [class.ex-status--ok]="!!picked()">{{ picked() ? "→ " + picked() : "→ nothing picked yet" }}</span>
  `
})
export class ItemPickerExample {
  protected readonly picked = signal<string | null>(null);

  protected async run(): Promise<void> {
    const choice = await Picker.call({ title: "Pick a fruit", items: FRUITS });
    this.picked.set(choice ? choice.name : null);
  }
}
