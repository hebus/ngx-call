import { ApplicationRef, ComponentRef, computed, createComponent, Injectable, Injector, signal, Type } from "@angular/core";
import { CALL_REF, CallRef } from "./call-ref";

interface MountedInstance {
  ref: ComponentRef<unknown>;
  callRef: CallRef<unknown, unknown, unknown>;
}

/**
 * Low-level handle returned by {@link DialogService.mount}. Tearing it down
 * detaches and destroys the dynamically created component.
 */
export interface DialogHandle {
  /** Detaches the view and destroys the component. Idempotent. */
  destroy(): void;
}

/**
 * Imperative mounting engine for callable components. Creates a component
 * dynamically, injects its {@link CallRef} on the element injector, attaches it
 * to the application and the DOM, and keeps a global list of live instances so a
 * single shared backdrop can be maintained across stacked dialogs.
 *
 * Per-callable stack metadata (`index`, `stackSize`) is owned by
 * `createCallable`, not here — each callable has its own stack, mirroring
 * react-call's one-Root-per-Callable model.
 */
@Injectable({
  providedIn: "root"
})
export class DialogService {
  /** Every callable instance currently mounted, across all callables. */
  private readonly instances = signal<MountedInstance[]>([]);

  /** Number of callable instances currently mounted (all callables combined). */
  readonly openCount = computed(() => this.instances().length);

  constructor(private appRef: ApplicationRef) {}

  /**
   * Mounts `component`, exposing `callRef` on its element injector via
   * {@link CALL_REF}, attaches it to the DOM/app, and returns a handle to tear
   * it down. The caller (createCallable) owns the promise and stack metadata.
   *
   * @param component - Standalone component injecting `CALL_REF` (via `injectCallRef`).
   * @param callRef - The instance's resolution handle and reactive props.
   * @param parentInjector - Injector to parent the instance's DI to.
   */
  mount(component: Type<unknown>, callRef: CallRef<unknown, unknown, unknown>, parentInjector: Injector): DialogHandle {
    const elementInjector = Injector.create({
      parent: parentInjector,
      providers: [{ provide: CALL_REF, useValue: callRef }]
    });

    const ref = createComponent(component, {
      environmentInjector: this.appRef.injector,
      elementInjector
    });

    document.body.appendChild(ref.location.nativeElement);
    this.appRef.attachView(ref.hostView);
    this.instances.update(list => [...list, { ref, callRef }]);
    this.syncBackdrops();

    return {
      destroy: () => this.unmount(ref)
    };
  }

  /**
   * Ends every mounted callable instance at once (across all callables),
   * resolving each pending promise with `result`. Prefer the per-callable
   * `Callable.end()` for scoped teardown.
   */
  closeAll(result?: unknown): void {
    this.instances().forEach(({ callRef }) => callRef.end(result));
  }

  private unmount(ref: ComponentRef<unknown>): void {
    if (!this.instances().some(instance => instance.ref === ref)) return;
    this.instances.update(list => list.filter(instance => instance.ref !== ref));
    this.appRef.detachView(ref.hostView);
    ref.destroy();
    this.syncBackdrops();
  }

  /**
   * Keeps a single visible backdrop for the whole stack: every instance except
   * the bottom-most gets the `ad-dialog--behind` host class, which neutralises
   * its native `::backdrop`. Anchoring the visible backdrop to the bottom
   * instance keeps it stable while upper dialogs close top-down — so no backdrop
   * fades transparent→dim mid-close, avoiding a flicker.
   */
  private syncBackdrops(): void {
    this.instances().forEach(({ ref }, index) => {
      (ref.location.nativeElement as HTMLElement).classList.toggle("ad-dialog--behind", index > 0);
    });
  }
}
