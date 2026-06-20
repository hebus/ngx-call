import { Component, computed, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// The dialog, bound once. It reads its arguments from `call.props()` and
// resolves the awaiting caller with `call.end(value)`.
@Component({
  selector: "confirm-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-body">{{ call.props().message }}</p>
        <div class="ad-actions">
          <button class="btn" (click)="call.end(false)">Cancel</button>
          <button class="btn btn-primary" (click)="call.end(true)">Continue</button>
        </div>
      </div>
    </div>
  `
})
class ConfirmDialog {
  protected readonly call = injectCallRef<{ message: string }, boolean>();
}

// Typed, imperative entry point: `await Confirm.call({ message })`.
const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog);

// The trigger: any component, anywhere, just awaits the call.
@Component({
  selector: "confirm-example",
  template: `
    <button class="btn btn-danger" (click)="run()">Delete item</button>
    <span class="ex-status" [class.ex-status--ok]="status() === 'deleted'">{{ label() }}</span>
  `
})
export class ConfirmExample {
  protected readonly status = signal<"idle" | "deleted" | "cancelled">("idle");
  protected readonly label = computed(() =>
    this.status() === "idle" ? "→ awaiting click…" : this.status() === "deleted" ? "→ deleted" : "→ cancelled"
  );

  protected async run(): Promise<void> {
    const accepted = await Confirm.call({ message: "Delete this item? This action cannot be undone." });
    this.status.set(accepted ? "deleted" : "cancelled");
  }
}
