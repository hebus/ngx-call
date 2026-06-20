import { Component } from "@angular/core";

/** Footer region of a dialog (typically holds action buttons). */
@Component({
  selector: "DialogFooter",
  standalone: true,
  template: `<ng-content />`,
  styles: [
    `
      :host {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
    `
  ]
})
export class DialogFooter {}
