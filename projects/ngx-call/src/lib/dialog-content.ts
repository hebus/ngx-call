import { Component } from "@angular/core";

/** Styled card container for a dialog's body. */
@Component({
  selector: "DialogContent",
  standalone: true,
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: grid;
        gap: 1rem;
        width: 100%;
        max-width: 32rem;
        padding: 1.5rem;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.35);
      }
    `
  ]
})
export class DialogContent {}
