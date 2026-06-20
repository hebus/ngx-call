import { Component, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// An OAuth-style consent prompt. The response is a tagged union — 'allow' or
// 'deny' — which is self-documenting and extensible (vs a bare boolean).
@Component({
  selector: "permission-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-title">Allow <span style="color: var(--color-accent)">{{ call.props().appName }}</span> to:</p>
        <ul style="margin: 1rem 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem">
          @for (s of call.props().scopes; track s) {
            <li class="ad-body" style="display: flex; gap: 0.5rem; font-size: 0.875rem">
              <span aria-hidden="true" style="color: var(--color-accent)">✓</span>
              {{ s }}
            </li>
          }
        </ul>
        <div class="ad-actions">
          <button class="btn" (click)="call.end('deny')">Deny</button>
          <button class="btn btn-primary" (click)="call.end('allow')">Allow</button>
        </div>
      </div>
    </div>
  `
})
class PermissionDialog {
  protected readonly call = injectCallRef<{ appName: string; scopes: readonly string[] }, "allow" | "deny">();
}

const Permission = createCallable<{ appName: string; scopes: readonly string[] }, "allow" | "deny">(PermissionDialog);

@Component({
  selector: "permission-example",
  template: `
    <button class="btn btn-primary" [disabled]="status() === 'connected'" (click)="run()">
      {{ status() === "connected" ? "Connected" : "Connect with GitHub" }}
    </button>
    <span class="ex-status" [class.ex-status--ok]="status() === 'connected'">{{ label() }}</span>
  `
})
export class PermissionExample {
  protected readonly status = signal<"idle" | "connected" | "denied">("idle");
  protected label(): string {
    return this.status() === "idle" ? "→ awaiting consent…" : this.status() === "connected" ? "→ allowed" : "→ denied";
  }

  protected async run(): Promise<void> {
    const result = await Permission.call({
      appName: "ngx-call demo",
      scopes: ["Read your profile", "Read your repositories", "Subscribe to webhook events"]
    });
    this.status.set(result === "allow" ? "connected" : "denied");
  }
}
