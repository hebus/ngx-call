import { signal, Signal } from "@angular/core";
import { CallRef } from "./call-ref";

/**
 * An async side effect wired to a callable. Runs the work and decides whether to
 * close the dialog via an explicit `call.end(...)`. If it throws, pending clears
 * but the call stays open — so the user can fix their input and retry.
 *
 * Mirrors react-call's `MutationFn<Response, Args>`.
 *
 * @template R - The callable's resolution type.
 * @template A - Payload passed to `submit(args)` (omit for none).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutationFn<R, A = void> = (call: CallRef<any, R, any>, args: A) => void | Promise<void>;

/**
 * Submit handle returned by {@link createMutationFlow}. Call it to run the
 * mutation; read {@link pending} (a signal) to gate spinners/disabled states.
 *
 * @template R - The callable's resolution type.
 * @template A - Payload passed to `submit(args)`.
 */
export interface MutationFlow<R, A = void> {
  /** Runs the mutation. Returns a chainable exposing {@link Pendable.orEnd}. */
  (args: A): Pendable<R>;
  /** `true` while the mutation is running. */
  readonly pending: Signal<boolean>;
}

/**
 * Chainable returned by invoking {@link MutationFlow}. `orEnd(fallback)` resolves
 * the call with `fallback` **only when no mutationFn was supplied** — otherwise
 * the mutation owns closure via `call.end()`, and `orEnd` is a no-op.
 */
export interface Pendable<R> {
  orEnd(fallback: R): void;
}

/**
 * Wires a {@link CallRef} to an async action, tracking pending state for you —
 * the Angular counterpart of react-call's `useMutationFlow(call, mutationFn)`.
 *
 * - With a `mutationFn`: `submit(args)` runs it (toggling `submit.pending`); the
 *   mutation closes the call with `call.end(...)`. A throw clears pending but
 *   keeps the call open for retry. `submit().orEnd(x)` is then a no-op.
 * - Without a `mutationFn`: `submit().orEnd(fallback)` closes immediately with
 *   the fallback — enabling a single callable to support both flows.
 *
 * @example
 * ```typescript
 * protected submit = createMutationFlow(this.call, this.call.props().mutationFn);
 * // template: [disabled]="submit.pending()" (click)="submit({ name }).orEnd(true)"
 * ```
 */
export function createMutationFlow<R, A = void>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call: CallRef<any, R, any>,
  mutationFn?: MutationFn<R, A>
): MutationFlow<R, A> {
  const pending = signal(false);

  const submit = ((args: A): Pendable<R> => {
    if (!mutationFn) {
      return { orEnd: (fallback: R) => call.end(fallback) };
    }
    pending.set(true);
    Promise.resolve(mutationFn(call, args)).finally(() => pending.set(false));
    return { orEnd: () => {} };
  }) as MutationFlow<R, A>;

  (submit as { pending: Signal<boolean> }).pending = pending;
  return submit;
}
