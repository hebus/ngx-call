import { afterNextRender, Component, computed, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

const UNMOUNT_DELAY = 300;

type Theme = "system" | "light" | "dark";

interface Settings {
  notifications: boolean;
  syncOnLaunch: boolean;
  theme: Theme;
}

// A side panel that owns its own form state, seeded from `initial`. Resolves
// with the saved Settings, or null on cancel / dismiss. Slides out on close.
@Component({
  selector: "settings-drawer",
  host: {
    "(document:keydown.escape)": "call.end(null)",
    "(document:mousedown)": "onDoc($event)"
  },
  template: `
    <div class="ad-overlay ad-overlay--end ad-overlay--animated" [class.is-closing]="!open()" role="dialog" aria-modal="true" aria-label="Settings">
      <div #drawer class="ad-drawer" [class.is-closing]="!open()">
        <div class="ad-drawer-head">
          <p class="ad-title">Settings</p>
          <button class="ad-close" aria-label="Close" (click)="call.end(null)">×</button>
        </div>

        <div class="ad-drawer-body">
          <div class="ad-row">
            <div>
              <p style="font-weight: 500; margin: 0">Notifications</p>
              <p class="hint">Browser notifications for new mentions.</p>
            </div>
            <input type="checkbox" [checked]="settings().notifications" (change)="patch({ notifications: $any($event.target).checked })" />
          </div>
          <div class="ad-row">
            <div>
              <p style="font-weight: 500; margin: 0">Sync on launch</p>
              <p class="hint">Fetch latest data on app start.</p>
            </div>
            <input type="checkbox" [checked]="settings().syncOnLaunch" (change)="patch({ syncOnLaunch: $any($event.target).checked })" />
          </div>
          <div class="ad-row">
            <div>
              <p style="font-weight: 500; margin: 0">Theme</p>
              <p class="hint">Visual theme used across the app.</p>
            </div>
            <select class="ad-select" style="width: auto; margin: 0" [value]="settings().theme" (change)="patch({ theme: $any($event.target).value })">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div class="ad-drawer-foot">
          <button class="btn" (click)="call.end(null)">Cancel</button>
          <button class="btn btn-primary" (click)="call.end(settings())">Save</button>
        </div>
      </div>
    </div>
  `
})
class SettingsDrawer {
  protected readonly call = injectCallRef<{ initial: Settings }, Settings | null>();
  protected readonly settings = signal<Settings>(this.call.props().initial);
  private readonly drawer = viewChild.required<ElementRef<HTMLElement>>("drawer");
  private readonly entered = signal(false);
  protected readonly open = computed(() => this.entered() && !this.call.ended());

  constructor() {
    afterNextRender(() => this.entered.set(true));
  }

  protected patch(part: Partial<Settings>): void {
    this.settings.update(s => ({ ...s, ...part }));
  }

  protected onDoc(event: MouseEvent): void {
    if (!this.drawer().nativeElement.contains(event.target as Node)) this.call.end(null);
  }
}

const Drawer = createCallable<{ initial: Settings }, Settings | null>(SettingsDrawer, UNMOUNT_DELAY);

@Component({
  selector: "settings-drawer-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Open settings</button>
    <span class="ex-status">
      notifications={{ settings().notifications }} · sync={{ settings().syncOnLaunch }} · theme={{ settings().theme }}
    </span>
  `
})
export class SettingsDrawerExample {
  protected readonly settings = signal<Settings>({ notifications: true, syncOnLaunch: false, theme: "system" });

  protected async run(): Promise<void> {
    const next = await Drawer.call({ initial: this.settings() });
    if (next) this.settings.set(next);
  }
}
