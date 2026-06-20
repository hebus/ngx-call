import { Component } from "@angular/core";

/** Title text inside a DialogHeader. */
@Component({
  selector: "DialogTitle",
  standalone: true,
  template: `<ng-content />`,
  styles: [
    `
      :host {
        font-weight: 700;
        font-size: 1.125rem;
        line-height: 1.4;
      }
    `
  ]
})
export class DialogTitle {}
