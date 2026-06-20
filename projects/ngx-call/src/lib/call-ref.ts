import { inject, InjectionToken, signal } from "@angular/core";

/**
 * Handle injected into a callable dialog component, mirroring react-call's
 * `call` prop. The component reads its arguments from {@link props} and resolves
 * the pending `call()` promise by invoking {@link end}.
 *
 * Obtain it from within the component via {@link injectCallRef}:
 *
 * @example
 * ```typescript
 * protected call = injectCallRef<{ message: string }, boolean>();
 * // template: {{ call.props().message }} ... (click)="call.end(true)"
 * ```
 *
 * @template P - Type of the arguments passed to `call(props)`.
 * @template R - Type the `call()` promise resolves with.
 * @template RP - Type of the ambient root props (see `Callable.setRoot`).
 */
export class CallRef<P = void, R = void, RP = void> {
  /** Arguments passed to `call(props)`, reactive so updates re-render the dialog. */
  readonly props = signal<P>(undefined as P);

  /**
   * Ambient props shared by every instance of the callable, set once via
   * `Callable.setRoot()`. The react-call counterpart of `call.root` — lets a
   * dialog read app-wide context (e.g. the signed-in user) without the caller
   * forwarding it on each `call()`.
   */
  readonly root = signal<RP>(undefined as RP);

  /**
   * `true` once {@link end} has been invoked. Useful to drive an exit
   * animation before the instance is removed (see `unmountDelay`).
   */
  readonly ended = signal(false);

  /** 0-based position of this instance among its callable's stack (maintained by createCallable). */
  readonly index = signal(0);

  /** Total number of instances of this callable currently mounted (maintained by createCallable). */
  readonly stackSize = signal(0);

  private _resolve?: (result: R) => void;

  /**
   * Wires the promise resolver. Called by `createCallable` — not part of
   * the public contract.
   * @internal
   */
  _attach(resolve: (result: R) => void): void {
    this._resolve = resolve;
  }

  /**
   * Resolves the pending `call()` promise with `result` and tears down the
   * instance. Equivalent to react-call's `call.end(value)`. No-op if already ended.
   */
  end(result: R): void {
    if (this.ended()) return;
    this.ended.set(true);
    this._resolve?.(result);
  }
}

/**
 * DI token exposing the {@link CallRef} of the current callable instance.
 * Provided automatically by `createCallable` on the dynamically created
 * component's element injector. Prefer {@link injectCallRef} to obtain a typed
 * handle rather than reading this token directly.
 */
export const CALL_REF = new InjectionToken<CallRef<unknown, unknown, unknown>>("CALL_REF");

/**
 * Injects the current {@link CallRef}, typed to the component's argument and
 * result types. Must run in an injection context (field initializer or constructor).
 *
 * @example
 * ```typescript
 * protected call = injectCallRef<{ message: string }, boolean>();
 * ```
 *
 * @template P - Type of the arguments passed to `call(props)`.
 * @template R - Type the `call()` promise resolves with.
 * @template RP - Type of the ambient root props.
 */
export function injectCallRef<P = void, R = void, RP = void>(): CallRef<P, R, RP> {
  return inject(CALL_REF) as CallRef<P, R, RP>;
}
