import { Component, signal } from "@angular/core";
import { createCallable, createMutationFlow, injectCallRef, type MutationFn } from "ngx-call";

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface OptionalProps {
  message: string;
  // Optional: typing it as possibly-undefined unlocks `.orEnd(value)`.
  mutationFn?: MutationFn<boolean>;
}

// One callable that supports both an instant close and an async handler,
// depending on whether the caller supplies a mutationFn.
@Component({
  selector: "optional-confirm-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-body">{{ call.props().message }}</p>
        <div class="ad-actions">
          <button class="btn" [disabled]="submit.pending()" (click)="call.end(false)">Cancel</button>
          <button class="btn btn-primary" [disabled]="submit.pending()" (click)="submit().orEnd(true)">
            {{ submit.pending() ? "Working…" : "Confirm" }}
          </button>
        </div>
      </div>
    </div>
  `
})
class OptionalConfirmDialog {
  protected readonly call = injectCallRef<OptionalProps, boolean>();
  protected readonly submit = createMutationFlow(this.call, this.call.props().mutationFn);
}

const OptionalConfirm = createCallable<OptionalProps, boolean>(OptionalConfirmDialog);

@Component({
  selector: "optional-mutation-example",
  template: `
    <div class="ex-row">
      <button class="btn" (click)="discard()">Discard draft</button>
      <button class="btn btn-primary" (click)="publish()">Publish post</button>
    </div>
    <span class="ex-status">{{ status() }}</span>
  `
})
export class OptionalMutationExample {
  protected readonly status = signal("→ awaiting click…");

  // No mutationFn: `submit().orEnd(true)` closes instantly with the fallback.
  protected async discard(): Promise<void> {
    const ok = await OptionalConfirm.call({ message: "Discard your draft?" });
    this.status.set(ok ? "→ draft discarded" : "→ kept");
  }

  // With a mutationFn: `.orEnd` is a no-op; the handler owns the close.
  protected async publish(): Promise<void> {
    const ok = await OptionalConfirm.call({
      message: "Publish this post now?",
      mutationFn: async call => {
        await sleep(900);
        call.end(true);
      }
    });
    this.status.set(ok ? "→ published" : "→ cancelled");
  }
}
