import { Component, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const TOAST_ROW = 84;

// A singleton toast. `upsert()` creates it on first call, then updates the same
// instance — so consecutive calls mutate one toast instead of stacking.
@Component({
  selector: "progress-toast",
  template: `
    <div class="ad-floating" role="status" aria-live="polite" [style.right.px]="24" [style.bottom.px]="24 + call.index() * TOAST_ROW">
      <div class="ad-toast">
        <div class="ad-actions ad-actions--split" style="margin-top: 0">
          <p class="ad-body" style="font-size: 0.875rem">{{ call.props().message }}</p>
          <button class="ad-close" aria-label="Dismiss" (click)="call.end()">×</button>
        </div>
        @if (call.props().percent !== undefined) {
          <div class="ad-progress"><span [style.width.%]="clamp(call.props().percent!)"></span></div>
        }
      </div>
    </div>
  `
})
class ProgressToast {
  protected readonly TOAST_ROW = TOAST_ROW;
  protected readonly call = injectCallRef<{ message: string; percent?: number }, void>();
  protected clamp(p: number): number {
    return Math.min(100, Math.max(0, p));
  }
}

const Toast = createCallable<{ message: string; percent?: number }, void>(ProgressToast);

@Component({
  selector: "progress-toast-example",
  template: `<button class="btn btn-primary" [disabled]="running()" (click)="run()">{{ running() ? "Downloading…" : "Start download" }}</button>`
})
export class ProgressToastExample {
  protected readonly running = signal(false);

  protected async run(): Promise<void> {
    this.running.set(true);
    let cancelled = false;
    // The promise is stable for the singleton's lifetime — resolve = dismissed.
    const session = Toast.upsert({ message: "Starting download…", percent: 0 });
    session.then(() => (cancelled = true));

    for (let i = 10; i <= 100; i += 10) {
      await sleep(150);
      if (cancelled) {
        this.running.set(false);
        return;
      }
      Toast.upsert({ message: `Downloading… ${i}%`, percent: i });
    }
    Toast.upsert({ message: "Done!", percent: 100 });
    await sleep(800);
    Toast.end();
    this.running.set(false);
  }
}
