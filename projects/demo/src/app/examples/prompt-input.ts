import { afterNextRender, Component, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// A component-based alternative to window.prompt(): resolves with the entered
// string, or null on cancel / empty input. Auto-focuses on open.
@Component({
  selector: "prompt-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <form class="ad-panel" (submit)="submit($event)">
        <label class="ad-title" for="prompt-input">{{ call.props().title }}</label>
        <input
          #input
          id="prompt-input"
          class="ad-input"
          type="text"
          [value]="value()"
          [placeholder]="call.props().placeholder ?? ''"
          (input)="value.set($any($event.target).value)"
        />
        <div class="ad-actions">
          <button type="button" class="btn" (click)="call.end(null)">Cancel</button>
          <button type="submit" class="btn btn-primary">OK</button>
        </div>
      </form>
    </div>
  `
})
class PromptDialog {
  protected readonly call = injectCallRef<{ title: string; placeholder?: string; defaultValue?: string }, string | null>();
  protected readonly value = signal(this.call.props().defaultValue ?? "");
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>("input");

  constructor() {
    afterNextRender(() => this.input().nativeElement.focus());
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.call.end(this.value().trim() || null);
  }
}

const Prompt = createCallable<{ title: string; placeholder?: string; defaultValue?: string }, string | null>(PromptDialog);

@Component({
  selector: "prompt-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Rename</button>
    <span class="ex-status ex-status--ok">→ {{ name() }}</span>
  `
})
export class PromptExample {
  protected readonly name = signal("untitled-file.txt");

  protected async run(): Promise<void> {
    const next = await Prompt.call({ title: "Rename file", defaultValue: this.name(), placeholder: "New filename" });
    if (next) this.name.set(next);
  }
}
