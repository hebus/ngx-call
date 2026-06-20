import { Component, computed, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

type Stage = "placed" | "packing" | "shipped" | "out" | "delivered";
const STAGES: Stage[] = ["placed", "packing", "shipped", "out", "delivered"];
const LABELS: Record<Stage, string> = {
  placed: "Order placed",
  packing: "Packing your order",
  shipped: "Handed to carrier",
  out: "Out for delivery",
  delivered: "Delivered"
};

// A pinned status pill the caller drives from the outside, by pushing new props
// into this exact open call via its promise handle.
@Component({
  selector: "live-status",
  template: `
    <div class="ad-floating" [style.right.px]="24" [style.bottom.px]="24">
      <div class="ad-pill">
        <div class="ad-actions ad-actions--split" style="margin-top: 0">
          <div>
            <p class="ad-subtle">Order #4821</p>
            <p class="ad-body" style="font-size: 0.875rem; font-weight: 500; margin-top: 0.15rem">{{ label() }}</p>
          </div>
          <button class="ad-close" [attr.aria-label]="done() ? 'Dismiss' : 'Stop watching'" (click)="call.end()">×</button>
        </div>
        <div class="ad-segments">
          @for (s of STAGES; track s; let i = $index) {
            <span [class.is-done]="i <= stepIndex()"></span>
          }
        </div>
      </div>
    </div>
  `
})
class LiveStatus {
  protected readonly STAGES = STAGES;
  protected readonly call = injectCallRef<{ stage: Stage }, void>();
  protected readonly stepIndex = computed(() => STAGES.indexOf(this.call.props().stage));
  protected readonly done = computed(() => this.call.props().stage === "delivered");
  protected label(): string {
    return LABELS[this.call.props().stage];
  }
}

const Status = createCallable<{ stage: Stage }, void>(LiveStatus);

@Component({
  selector: "live-status-example",
  template: `<button class="btn btn-primary" [disabled]="running()" (click)="run()">{{ running() ? "Watching order…" : "Place order" }}</button>`
})
export class LiveStatusExample {
  protected readonly running = signal(false);
  private readonly sequence: Stage[] = ["packing", "shipped", "out", "delivered"];

  protected async run(): Promise<void> {
    this.running.set(true);
    // The promise IS the call's identity — hold it to target updates at it.
    const promise = Status.call({ stage: "placed" });

    let dismissed = false;
    promise.then(() => (dismissed = true));

    for (const stage of this.sequence) {
      await sleep(900);
      if (dismissed) break;
      Status.update(promise, { stage }); // re-render this one call with new props
    }

    await promise;
    this.running.set(false);
  }
}
