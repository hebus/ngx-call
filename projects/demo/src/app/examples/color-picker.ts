import { Component, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// A grid of swatches with visual selection feedback. Resolves with a hex value,
// or null on Escape / outside-click.
@Component({
  selector: "color-picker",
  host: {
    "(document:keydown.escape)": "call.end(null)",
    "(document:mousedown)": "onDoc($event)"
  },
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true" aria-label="Pick a color">
      <div #panel class="ad-panel" style="width: auto; max-width: none">
        <p class="ad-title" style="margin-bottom: 0.75rem">Pick a color</p>
        <div class="ad-swatches">
          @for (color of call.props().swatches; track color) {
            <button
              class="ad-swatch"
              [class.is-selected]="color === call.props().current"
              [attr.aria-label]="color"
              [style.background]="color"
              (click)="call.end(color)"
            ></button>
          }
        </div>
      </div>
    </div>
  `
})
class ColorPicker {
  protected readonly call = injectCallRef<{ swatches: readonly string[]; current?: string }, string | null>();
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>("panel");

  protected onDoc(event: MouseEvent): void {
    if (!this.panel().nativeElement.contains(event.target as Node)) this.call.end(null);
  }
}

const ColorPickerCall = createCallable<{ swatches: readonly string[]; current?: string }, string | null>(ColorPicker);

const SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#e11d74",
  "#a3a3a3",
  "#000000",
  "#ffffff",
  "#f59e0b"
];

@Component({
  selector: "color-picker-example",
  template: `
    <button class="ex-swatch-trigger" (click)="run()">
      <span class="ex-swatch-chip" [style.background]="color()"></span>
      <span class="ex-status" style="color: var(--color-fg)">{{ color() }}</span>
    </button>
    <span class="ex-status">click to change</span>
  `
})
export class ColorPickerExample {
  protected readonly color = signal("#e11d74");

  protected async run(): Promise<void> {
    const next = await ColorPickerCall.call({ swatches: SWATCHES, current: this.color() });
    if (next) this.color.set(next);
  }
}
