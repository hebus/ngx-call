import { EnvironmentProviders, inject, Injector, makeEnvironmentProviders, provideAppInitializer, Type } from "@angular/core";
import { CallRef } from "./call-ref";
import { DialogHandle, DialogService } from "./dialog.service";

/**
 * Root injector captured by {@link provideCallable}, enabling `call(props)`
 * without passing an injector (react-call ergonomics).
 */
let rootInjector: Injector | null = null;

/**
 * Options accepted by {@link Callable.call} / {@link Callable.upsert}.
 */
export interface CallOptions {
  /**
   * Injector used to resolve `DialogService` and parent the instance's DI.
   * Defaults to the root injector captured by {@link provideCallable}.
   */
  injector?: Injector;
  /**
   * Delay in ms between resolution and the actual teardown, leaving time for an
   * exit animation. Overrides the value passed to {@link createCallable}.
   */
  unmountDelay?: number;
}

/**
 * Imperative, type-safe handle returned by {@link createCallable} — the Angular
 * counterpart of react-call's Callable. Mirrors its full surface: `call`,
 * `upsert`, `update`, `end`, plus `setRoot` for ambient props.
 *
 * @template P - Type of the arguments passed to `call(props)`.
 * @template R - Type the `call()` promise resolves with.
 * @template RP - Type of the ambient root props.
 */
export interface Callable<P = void, R = void, RP = void> {
  /**
   * Mounts the bound component and resolves once it (or the caller) ends the
   * call. Each invocation **stacks** an independent instance. The returned
   * promise doubles as the call's identity for {@link update} / {@link end}.
   */
  call(props: P, options?: CallOptions): Promise<R>;

  /**
   * Singleton create-or-update: the first `upsert` mounts the instance; later
   * ones merge `props` into the same instance. The returned promise keeps the
   * same reference for the singleton's lifetime. Mirrors react-call's `upsert`.
   */
  upsert(props: P, options?: CallOptions): Promise<R>;

  /**
   * Updates the props of the call identified by `handle` (shallow merge).
   * Mirrors react-call's targeted `X.update(promise, props)`.
   */
  update(handle: Promise<R>, props: Partial<P>): void;
  /**
   * Broadcasts a shallow prop merge to **every** open instance of this callable.
   * Mirrors react-call's `X.update(props)`.
   */
  update(props: Partial<P>): void;

  /** Ends every open instance of this callable, resolving each with `undefined`. */
  end(): void;
  /** Ends every open instance of this callable, resolving each with `result`. */
  end(result: R): void;
  /**
   * Resolves the single call identified by `handle` with `result`, from the
   * caller side. No-op if already settled. Mirrors react-call's `X.end(promise, value)`.
   */
  end(handle: Promise<R>, result: R): void;

  /**
   * Sets the ambient root props shared by every instance (read via `call.root`),
   * and pushes them to any already-open instances. Mirrors mounting react-call's
   * `<Root {...rootProps} />`. Reactive: later calls re-render open instances.
   */
  setRoot(props: RP): void;
}

const isPromise = (value: unknown): value is Promise<unknown> =>
  typeof value === "object" && value !== null && typeof (value as { then?: unknown }).then === "function";

/**
 * Captures the root injector at bootstrap so {@link Callable.call} can be used
 * from anywhere without an explicit injector — the closest equivalent to
 * react-call's "call from anywhere" ergonomics.
 *
 * @example
 * ```typescript
 * bootstrapApplication(App, { providers: [provideCallable()] });
 * // then, anywhere: await Confirm.call({ message: "Sure?" });
 * ```
 */
export function provideCallable(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      rootInjector = inject(Injector);
    })
  ]);
}

/**
 * Binds a dialog component once and returns a typed, imperative Callable — the
 * Angular counterpart of react-call's `createCallable`.
 *
 * The component receives its arguments and resolution handle via DI
 * (`injectCallRef()`): per-call `props`, ambient `root`, `index`/`stackSize`
 * (scoped to this callable's own stack), `ended`, and `end()`.
 *
 * @example
 * ```typescript
 * export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog);
 * const accepted = await Confirm.call({ message: "Continue?" });
 * ```
 *
 * @template P - Type of the arguments passed to `call(props)`.
 * @template R - Type the `call()` promise resolves with.
 * @template RP - Type of the ambient root props (read via `call.root`).
 * @param component - Standalone component injecting `CALL_REF` (via `injectCallRef`).
 * @param unmountDelay - Default teardown delay (ms) after resolution, for exit animations.
 */
export function createCallable<P = void, R = void, RP = void>(component: Type<unknown>, unmountDelay = 0): Callable<P, R, RP> {
  interface Instance {
    promise: Promise<R>;
    callRef: CallRef<P, R, RP>;
    mounted: DialogHandle;
  }

  const instances: Instance[] = [];
  let rootProps = undefined as RP;

  /** Refreshes per-callable stack metadata after the live set changes. */
  const sync = (): void => {
    const size = instances.length;
    instances.forEach((instance, index) => {
      instance.callRef.index.set(index);
      instance.callRef.stackSize.set(size);
    });
  };

  const teardown = (instance: Instance, delay: number): void => {
    const remove = () => {
      const i = instances.indexOf(instance);
      if (i === -1) return;
      instances.splice(i, 1);
      instance.mounted.destroy();
      sync();
    };
    if (delay > 0) setTimeout(remove, delay);
    else queueMicrotask(remove);
  };

  const open = (props: P, options: CallOptions): Promise<R> => {
    const injector = options.injector ?? rootInjector;
    if (!injector) {
      throw new Error(
        "[ngx-call] createCallable: no injector available. " +
          "Call provideCallable() during bootstrap, or pass { injector } from an injection context."
      );
    }

    const callRef = new CallRef<P, R, RP>();
    callRef.props.set(props);
    callRef.root.set(rootProps);

    let instance: Instance;
    const promise = new Promise<R>(resolve => {
      callRef._attach((result: R) => {
        resolve(result);
        teardown(instance, options.unmountDelay ?? unmountDelay);
      });
    });

    const mounted = injector.get(DialogService).mount(component, callRef as CallRef<unknown, unknown, unknown>, injector);
    instance = { promise, callRef, mounted };
    instances.push(instance);
    sync();
    return promise;
  };

  const findLive = (handle: Promise<R>): Instance | undefined =>
    instances.find(instance => instance.promise === handle && !instance.callRef.ended());

  return {
    call(props: P, options: CallOptions = {}): Promise<R> {
      return open(props, options);
    },

    upsert(props: P, options: CallOptions = {}): Promise<R> {
      const existing = instances.find(instance => !instance.callRef.ended());
      if (existing) {
        existing.callRef.props.set(props);
        return existing.promise;
      }
      return open(props, options);
    },

    update(handleOrProps: Promise<R> | Partial<P>, maybeProps?: Partial<P>): void {
      if (isPromise(handleOrProps)) {
        const instance = findLive(handleOrProps);
        if (instance) instance.callRef.props.update(current => ({ ...current, ...maybeProps }) as P);
        return;
      }
      const patch = handleOrProps;
      instances.forEach(instance => {
        if (!instance.callRef.ended()) instance.callRef.props.update(current => ({ ...current, ...patch }) as P);
      });
    },

    end(handleOrResult?: Promise<R> | R, maybeResult?: R): void {
      if (isPromise(handleOrResult)) {
        findLive(handleOrResult)?.callRef.end(maybeResult as R);
        return;
      }
      const result = handleOrResult as R;
      // Snapshot: ending mutates `instances` via teardown microtasks.
      instances.slice().forEach(instance => instance.callRef.end(result));
    },

    setRoot(props: RP): void {
      rootProps = props;
      instances.forEach(instance => instance.callRef.root.set(props));
    }
  };
}
