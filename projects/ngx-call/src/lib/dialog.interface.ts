import { InjectionToken } from "@angular/core";

export type DialogEvent = "dialog-close" | "dialog-cancel" | "dialog-confirm" | "dialog-no" | "dialog-yes";

export type DialogResult = DialogEvent | { type: DialogEvent; [key: string]: unknown };

/**
 * Minimal handle to close the surrounding {@link Dialog}, provided by it via DI.
 * Lets nested pieces (e.g. a header close button) dismiss the dialog.
 */
export interface DialogRef {
  close(eventType?: DialogEvent): void;
}

export const DIALOG_REF = new InjectionToken<DialogRef>("DIALOG_REF");
