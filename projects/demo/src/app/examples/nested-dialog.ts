import { Component, computed } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

const DOM_LIMIT = 10; // only render the topmost N instances; older ones stay in the stack

// A callable that opens itself, producing a stack of independent instances —
// each with its own promise resolved by its own `call.end()`. `index` and
// `stackSize` are scoped to this callable's own stack.
@Component({
  selector: "nested-dialog",
  template: `
    @if (call.index() >= call.stackSize() - DOM_LIMIT) {
      <div [class]="isTopmost() ? 'ad-overlay' : 'ad-overlay ad-overlay--bare'" role="dialog" aria-modal="true">
        <div class="ad-panel" [style.transform]="offset()">
          <div class="ad-actions ad-actions--split" style="margin-top: 0">
            <p class="ad-subtle">Level {{ call.props().level }} · #{{ call.index() + 1 }} of {{ call.stackSize() }}</p>
            <button class="ad-close" aria-label="Close" (click)="call.end()">×</button>
          </div>
          <p class="ad-body" style="margin-top: 0.75rem">
            A Callable can open itself. Each open instance has its own promise, resolved by its own
            <code>call.end()</code>.
          </p>
          <div class="ad-actions ad-actions--split">
            <button class="btn btn-ghost" (click)="closeAll()">Close all</button>
            <div class="ex-row">
              <button class="btn" (click)="call.end()">Close</button>
              <button class="btn btn-primary" (click)="openNested()">Open nested</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.ad-overlay--bare .ad-panel { pointer-events: auto; }`]
})
class NestedDialog {
  protected readonly DOM_LIMIT = DOM_LIMIT;
  protected readonly call = injectCallRef<{ level: number }, void>();
  protected readonly isTopmost = computed(() => this.call.index() + 1 === this.call.stackSize());
  protected readonly offset = computed(() => {
    const px = (this.call.index() % 6) * 18;
    return `translate(${px}px, ${px}px)`;
  });

  protected openNested(): void {
    Nested.call({ level: this.call.props().level + 1 });
  }

  protected closeAll(): void {
    Nested.end(); // end every open instance of this callable at once
  }
}

const Nested = createCallable<{ level: number }, void>(NestedDialog);

@Component({
  selector: "nested-example",
  template: `<button class="btn btn-primary" (click)="open()">Open dialog</button>`
})
export class NestedExample {
  protected open(): void {
    Nested.call({ level: 1 });
  }
}
