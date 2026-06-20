import { Component, effect, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

interface WizardResult {
  name: string;
  email: string;
  plan: "free" | "pro" | "team";
}

// A three-step signup. All step state lives inside the dialog; the caller awaits
// a single structured response (or null on cancel).
@Component({
  selector: "wizard-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true" aria-label="Wizard">
      <div class="ad-panel" style="max-width: 28rem">
        <div class="ad-steps">
          @for (i of [0, 1, 2]; track i) {
            <span [class.is-done]="i <= step()"></span>
          }
        </div>

        @if (step() === 0) {
          <p class="ad-subtle">Step 1 of 3</p>
          <p class="ad-title" style="margin-top: 0.25rem">Your name</p>
          <input #nameInput class="ad-input" style="margin-top: 1rem" type="text" placeholder="Ada Lovelace" [value]="name()" (input)="name.set($any($event.target).value)" />
        }
        @if (step() === 1) {
          <p class="ad-subtle">Step 2 of 3</p>
          <p class="ad-title" style="margin-top: 0.25rem">Your email</p>
          <input #emailInput class="ad-input" style="margin-top: 1rem" type="email" placeholder="ada@example.com" [value]="email()" (input)="email.set($any($event.target).value)" />
        }
        @if (step() === 2) {
          <p class="ad-subtle">Step 3 of 3</p>
          <p class="ad-title" style="margin-top: 0.25rem">Pick a plan</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem">
            @for (p of plans; track p) {
              <button class="btn" [class.btn-primary]="p === plan()" (click)="plan.set(p)">{{ p }}</button>
            }
          </div>
        }

        <div class="ad-actions ad-actions--split">
          <button class="btn btn-ghost" (click)="call.end(null)">Cancel</button>
          <div class="ex-row">
            @if (step() > 0) {
              <button class="btn" (click)="step.set(step() - 1)">Back</button>
            }
            @if (step() < 2) {
              <button class="btn btn-primary" [disabled]="nextDisabled()" (click)="step.set(step() + 1)">Next</button>
            } @else {
              <button class="btn btn-primary" (click)="finish()">Finish</button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
class WizardDialog {
  protected readonly call = injectCallRef<void, WizardResult | null>();
  protected readonly plans = ["free", "pro", "team"] as const;
  protected readonly step = signal(0);
  protected readonly name = signal("");
  protected readonly email = signal("");
  protected readonly plan = signal<WizardResult["plan"]>("free");
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>("nameInput");
  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>("emailInput");

  constructor() {
    effect(() => {
      if (this.step() === 0) this.nameInput()?.nativeElement.focus();
      if (this.step() === 1) this.emailInput()?.nativeElement.focus();
    });
  }

  protected nextDisabled(): boolean {
    return (this.step() === 0 && !this.name().trim()) || (this.step() === 1 && !this.email().trim());
  }

  protected finish(): void {
    this.call.end({ name: this.name(), email: this.email(), plan: this.plan() });
  }
}

const Wizard = createCallable<void, WizardResult | null>(WizardDialog);

@Component({
  selector: "wizard-example",
  template: `
    <button class="btn btn-primary" (click)="run()">Sign up</button>
    <span class="ex-status" [class.ex-status--ok]="!!result()">
      {{ result() ? "→ " + result()!.name + " (" + result()!.plan + ")" : "→ no signup yet" }}
    </span>
  `
})
export class WizardExample {
  protected readonly result = signal<WizardResult | null>(null);

  protected async run(): Promise<void> {
    const data = await Wizard.call();
    if (data) this.result.set(data);
  }
}
