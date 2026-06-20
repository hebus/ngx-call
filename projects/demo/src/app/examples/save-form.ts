import { Component, signal } from "@angular/core";
import { createCallable, createMutationFlow, injectCallRef, type MutationFn } from "ngx-call";

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface SaveProps {
  initialName?: string;
  mutationFn: MutationFn<string, { name: string; shouldFail: boolean }>;
}

// `createMutationFlow` wires the dialog to an async action: it tracks `pending`
// for you, and on failure the call stays open so the user can retry.
@Component({
  selector: "save-form-dialog",
  template: `
    <div class="ad-overlay" role="dialog" aria-modal="true">
      <div class="ad-panel">
        <p class="ad-title">Save item</p>
        <input
          class="ad-input"
          type="text"
          [value]="name()"
          [disabled]="submit.pending()"
          placeholder="Item name"
          (input)="name.set($any($event.target).value)"
        />
        <label class="ad-check">
          <input type="checkbox" [checked]="shouldFail()" [disabled]="submit.pending()" (change)="shouldFail.set($any($event.target).checked)" />
          Simulate a failed save
        </label>
        <div class="ad-actions">
          <button class="btn" [disabled]="submit.pending()" (click)="call.end('')">Cancel</button>
          <button class="btn btn-primary" [disabled]="submit.pending() || !name().trim()" (click)="submit({ name: name().trim(), shouldFail: shouldFail() })">
            {{ submit.pending() ? "Saving…" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  `
})
class SaveFormDialog {
  protected readonly call = injectCallRef<SaveProps, string>();
  protected readonly name = signal(this.call.props().initialName ?? "");
  protected readonly shouldFail = signal(false);
  protected readonly submit = createMutationFlow(this.call, this.call.props().mutationFn);
}

const SaveForm = createCallable<SaveProps, string>(SaveFormDialog);

@Component({
  selector: "save-form-example",
  template: `
    <button class="btn btn-primary" (click)="run()">New item</button>
    <span class="ex-status" [class.ex-status--ok]="!!saved()">
      {{ saved() ? '→ saved "' + saved() + '"' : "→ tick “simulate a failed save” to see it stay open" }}
    </span>
  `
})
export class SaveFormExample {
  protected readonly saved = signal<string | null>(null);

  protected async run(): Promise<void> {
    const result = await SaveForm.call({
      mutationFn: async (call, { name, shouldFail }) => {
        await sleep(900);
        // Handle errors inside the mutationFn — not calling call.end() leaves
        // the dialog open so the user can fix things and retry.
        try {
          if (shouldFail) throw new Error("Saving failed — try again.");
          call.end(name);
        } catch {
          // surface this however your UI needs; here we just stay open
        }
      }
    });
    if (result) this.saved.set(result);
  }
}
