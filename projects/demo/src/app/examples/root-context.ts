import { Component, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

interface GreeterProps {
  message: string;
}

// The third generic types the ambient root props — read via `call.root()` —
// kept separate from the per-call props. The caller never forwards them.
interface GreeterRoot {
  userName: string;
}

@Component({
  selector: "greeter-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-subtle">Signed in as {{ call.root().userName }}</p>
        <p class="ad-body" style="margin-top: 0.5rem">{{ call.props().message }}</p>
        <div class="ad-actions">
          <button class="btn" (click)="call.end(false)">Not now</button>
          <button class="btn btn-primary" (click)="call.end(true)">Enable</button>
        </div>
      </div>
    </div>
  `
})
class GreeterDialog {
  protected readonly call = injectCallRef<GreeterProps, boolean, GreeterRoot>();
}

const Greeter = createCallable<GreeterProps, boolean, GreeterRoot>(GreeterDialog);
// Ambient context, set once (the equivalent of mounting <Root userName="…" />).
Greeter.setRoot({ userName: "Ada Lovelace" });

@Component({
  selector: "greeter-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Review security</button>
    <span class="ex-status" [class.ex-status--ok]="status() === 'enabled'">{{ label() }}</span>
  `
})
export class GreeterExample {
  protected readonly status = signal<"idle" | "enabled" | "dismissed">("idle");
  protected label(): string {
    return this.status() === "idle" ? "→ awaiting click…" : this.status() === "enabled" ? "→ 2FA enabled" : "→ dismissed";
  }

  protected async run(): Promise<void> {
    // Only the per-call message is passed — userName comes from the root.
    const enabled = await Greeter.call({ message: "Enable two-factor authentication for your account?" });
    this.status.set(enabled ? "enabled" : "dismissed");
  }
}
