/*
 * Public API Surface of ngx-call
 *
 * An imperative, type-safe dialog API for Angular — the equivalent of
 * react-call's createCallable: bind a component once and `await Confirm.call(props)`.
 */

/* Callable engine */
export { CallRef, CALL_REF, injectCallRef } from "./lib/call-ref";
export { createCallable, provideCallable } from "./lib/create-callable";
export type { Callable, CallOptions } from "./lib/create-callable";
export { DialogService } from "./lib/dialog.service";
export type { DialogHandle } from "./lib/dialog.service";

/* Mutation flow (async submit with pending tracking + retry) */
export { createMutationFlow } from "./lib/mutation-flow";
export type { MutationFn, MutationFlow, Pendable } from "./lib/mutation-flow";

/* Dialog UI */
export { Dialog } from "./lib/dialog";
export { DialogContent } from "./lib/dialog-content";
export { DialogHeader } from "./lib/dialog-header";
export { DialogTitle } from "./lib/dialog-title";
export { DialogFooter } from "./lib/dialog-footer";
export { DIALOG_REF } from "./lib/dialog.interface";
export type { DialogRef, DialogEvent, DialogResult } from "./lib/dialog.interface";
