import { afterNextRender, Component, DestroyRef, inject, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

const BANNER_ROW = 52;

// A transient banner that closes itself after `durationMs`. Multiple calls
// stack — each is an independent instance positioned by its own `index`.
@Component({
  selector: "error-banner",
  template: `
    <div
      class="ad-floating"
      role="alert"
      aria-live="assertive"
      [style.top.px]="24 + call.index() * BANNER_ROW"
      [style.left]="'50%'"
      [style.transform]="'translateX(-50%)'"
    >
      <div class="ad-banner">
        <span aria-hidden="true">⚠</span>
        <span class="grow">{{ call.props().message }}</span>
        <button class="ad-close" aria-label="Dismiss" (click)="call.end()">×</button>
      </div>
    </div>
  `
})
class ErrorBanner {
  protected readonly BANNER_ROW = BANNER_ROW;
  protected readonly call = injectCallRef<{ message: string; durationMs: number }, void>();

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setTimeout(() => this.call.end(), this.call.props().durationMs);
      destroyRef.onDestroy(() => clearTimeout(timer));
    });
  }
}

const ErrorBannerCall = createCallable<{ message: string; durationMs: number }, void>(ErrorBanner);

@Component({
  selector: "error-banner-example",
  template: `
    <button class="btn btn-danger" (click)="trigger()">Simulate error</button>
    <span class="ex-status">{{ count() > 0 ? count() + (count() === 1 ? " error triggered" : " errors triggered") : "no errors yet" }}</span>
  `
})
export class ErrorBannerExample {
  protected readonly count = signal(0);

  protected trigger(): void {
    this.count.update(c => c + 1);
    ErrorBannerCall.call({ message: `Network request failed (#${this.count()})`, durationMs: 1500 });
  }
}
