import { Component } from "@angular/core";

/** Header region of a dialog (typically wraps a DialogTitle). */
@Component({
  selector: "DialogHeader",
  standalone: true,
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
    `
  ]
})
export class DialogHeader {}
