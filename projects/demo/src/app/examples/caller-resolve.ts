import { Component, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// The dialog only offers Decline/Approve — but the call can also be settled from
// the OUTSIDE, without any interaction here, via `Approval.end(handle, value)`.
@Component({
  selector: "approval-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-body" style="color: var(--color-fg)">Approve: {{ call.props().action }}?</p>
        <p class="ad-subtle" style="text-transform: none; margin-top: 0.25rem">Auto-declines from the caller if you don't respond in time.</p>
        <div class="ad-actions">
          <button class="btn" (click)="call.end(false)">Decline</button>
          <button class="btn btn-primary" (click)="call.end(true)">Approve</button>
        </div>
      </div>
    </div>
  `
})
class ApprovalDialog {
  protected readonly call = injectCallRef<{ action: string }, boolean>();
}

const Approval = createCallable<{ action: string }, boolean>(ApprovalDialog);

const TIMEOUT_SECONDS = 4;

@Component({
  selector: "caller-resolve-example",
  template: `
    <button class="btn btn-primary" [disabled]="secondsLeft() !== null" (click)="run()">Request approval</button>
    <span class="ex-status" [class.ex-status--ok]="secondsLeft() !== null">
      {{ secondsLeft() !== null ? "auto-declines in " + secondsLeft() + "s…" : status() }}
    </span>
  `
})
export class CallerResolveExample {
  protected readonly status = signal("→ no request yet");
  protected readonly secondsLeft = signal<number | null>(null);

  protected async run(): Promise<void> {
    this.status.set("awaiting approval…");
    // The promise returned by call() IS the call's identity — hold it so the
    // timeout can settle THIS specific open call from out here.
    const promise = Approval.call({ action: "Deploy to production" });

    let answered = false;
    promise.then(() => (answered = true));

    let left = TIMEOUT_SECONDS;
    this.secondsLeft.set(left);
    const ticker = setInterval(() => {
      left -= 1;
      this.secondsLeft.set(left > 0 ? left : null);
      if (left <= 0) clearInterval(ticker);
    }, 1000);

    let timedOut = false;
    const timer = setTimeout(() => {
      if (answered) return;
      timedOut = true;
      Approval.end(promise, false); // resolve from caller scope, targeted at this call
    }, TIMEOUT_SECONDS * 1000);

    const approved = await promise;
    clearTimeout(timer);
    clearInterval(ticker);
    this.secondsLeft.set(null);
    this.status.set(approved ? "→ approved" : timedOut ? "→ auto-declined (timed out)" : "→ declined");
  }
}
