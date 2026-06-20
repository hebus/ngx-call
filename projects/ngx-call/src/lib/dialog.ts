import { Component, ElementRef, inject, output, signal } from "@angular/core";
import { DIALOG_REF, DialogEvent, DialogRef } from "./dialog.interface";

/**
 * Lightweight wrapper directive/component over the native `<dialog>` element.
 * Projects its content while open and exposes imperative open/close methods.
 * Provides {@link DIALOG_REF} so nested pieces can dismiss it.
 */
@Component({
  selector: "dialog, [dialog]",
  exportAs: "dialog",
  standalone: true,
  providers: [{ provide: DIALOG_REF, useExisting: Dialog }],
  template: `@if (isOpen()) { <ng-content /> }`,
  host: {
    "[attr.open]": "isOpen() ? '' : null",
    "[attr.closedby]": "isPopover() ? 'any' : null",
    "(close)": "close()"
  },
  styles: [
    `
      :host {
        padding: 0;
        border: none;
        background: transparent;
        max-width: 100vw;
        max-height: 100dvh;
        overflow: visible;
        color: inherit;
      }
    `
  ]
})
export class Dialog implements DialogRef {
  private readonly el = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;

  readonly closed = output<DialogEvent>();

  readonly isOpen = signal(false);
  readonly isPopover = signal(false);
  readonly isModal = signal(false);

  /** Opens as a modal (default). */
  open(): void {
    this.showModal();
  }

  /** Opens non-modally (no backdrop, no focus trap). */
  show(): void {
    this.isOpen.set(true);
    this.isModal.set(false);
    if (this.el.tagName === "DIALOG") this.el.show();
  }

  /** Opens as a modal dialog in the top layer (native backdrop, focus trap). */
  showModal(): void {
    this.isOpen.set(true);
    this.isPopover.set(false);
    this.isModal.set(true);
    if (this.el.tagName === "DIALOG") this.el.showModal();
  }

  /** Opens using the native Popover API. */
  showPopover(): void {
    this.isOpen.set(true);
    this.isPopover.set(true);
    if (this.el.tagName === "DIALOG") this.el.showPopover();
  }

  /** Closes the dialog and emits {@link closed}. */
  close(eventType: DialogEvent = "dialog-close"): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.isPopover.set(false);
    if (this.el.tagName === "DIALOG") this.el.close(eventType);
    this.closed.emit(eventType);
  }

  /** Convenience: close with a `dialog-cancel` event. */
  cancel(eventType: DialogEvent = "dialog-cancel"): void {
    this.close(eventType);
  }
}
