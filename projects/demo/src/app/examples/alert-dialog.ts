import { Component, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// A single-button notice. The caller awaits acknowledgement; the response is void.
@Component({
  selector: "alert-dialog",
  template: `
    <div class="ad-overlay" role="alertdialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-title">{{ call.props().title }}</p>
        <p class="ad-body" style="margin-top: 0.5rem">{{ call.props().message }}</p>
        <div class="ad-actions">
          <button class="btn btn-primary" (click)="call.end()">OK</button>
        </div>
      </div>
    </div>
  `
})
class AlertDialog {
  protected readonly call = injectCallRef<{ title: string; message: string }, void>();
}

const Alert = createCallable<{ title: string; message: string }, void>(AlertDialog);

@Component({
  selector: "alert-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Show alert</button>
    <span class="ex-status">{{ acked() ? "→ acknowledged" : "→ awaiting click…" }}</span>
  `
})
export class AlertExample {
  protected readonly acked = signal(false);

  protected async run(): Promise<void> {
    await Alert.call({ title: "Heads up", message: "Your session will expire in 5 minutes. Save your work to keep it." });
    this.acked.set(true);
  }
}
