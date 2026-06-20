import { Component, computed, signal } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

type UploadState = "uploading" | "paused" | "done";
const UPLOAD_ROW = 52;
const STATE_META: Record<UploadState, { icon: string; text: string }> = {
  uploading: { icon: "↑", text: "uploading…" },
  paused: { icon: "⏸", text: "paused" },
  done: { icon: "✓", text: "done" }
};

// Several stacked pills. A single `update(props)` with no handle merges into
// EVERY open instance at once, while each keeps its own filename.
@Component({
  selector: "upload-pill",
  template: `
    <div class="ad-floating" [style.right.px]="24" [style.bottom.px]="24 + call.index() * UPLOAD_ROW">
      <div class="ad-upload">
        <span aria-hidden="true">{{ meta().icon }}</span>
        <span class="grow">{{ call.props().label }}</span>
        <span class="state">{{ meta().text }}</span>
        <button class="ad-close" aria-label="Dismiss" (click)="call.end()">×</button>
      </div>
    </div>
  `
})
class UploadPill {
  protected readonly UPLOAD_ROW = UPLOAD_ROW;
  protected readonly call = injectCallRef<{ label: string; state: UploadState }, void>();
  protected readonly meta = computed(() => STATE_META[this.call.props().state]);
}

const Upload = createCallable<{ label: string; state: UploadState }, void>(UploadPill);

@Component({
  selector: "broadcast-update-example",
  template: `
    <div class="ex-row">
      <button class="btn btn-primary" [disabled]="!idle()" (click)="start()">Start 3 uploads</button>
      <button class="btn" [disabled]="idle()" (click)="toggle()">Toggle connection</button>
      <button class="btn" [disabled]="idle()" (click)="completeAll()">Complete all</button>
    </div>
    <span class="ex-status">{{ idle() ? "→ start some uploads, then broadcast to all of them" : "connection: " + (online() ? "online" : "offline") + " — " + openCount() + " open" }}</span>
  `
})
export class BroadcastUpdateExample {
  private static readonly FILES = ["report.pdf", "photo.jpg", "archive.zip"];
  protected readonly online = signal(true);
  protected readonly openCount = signal(0);
  protected readonly idle = computed(() => this.openCount() === 0);

  protected start(): void {
    this.online.set(true);
    for (const label of BroadcastUpdateExample.FILES) {
      const promise = Upload.call({ label, state: "uploading" });
      this.openCount.update(n => n + 1);
      promise.then(() => this.openCount.update(n => n - 1));
    }
  }

  protected toggle(): void {
    const next = !this.online();
    this.online.set(next);
    // One update, no handle → merges into every open pill; each keeps its label.
    Upload.update({ state: next ? "uploading" : "paused" });
  }

  protected completeAll(): void {
    this.online.set(true);
    Upload.update({ state: "done" });
  }
}
