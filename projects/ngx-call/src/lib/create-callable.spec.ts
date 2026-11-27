import { Component, createComponent, createEnvironmentInjector, EnvironmentInjector, inject, InjectionToken, Injector } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createCallable } from "./create-callable";
import { DialogService } from "./dialog.service";

@Component({ selector: "ngx-call-probe", template: "probe" })
class ProbeComponent {}

describe("Callable.call — container", () => {
  it("mounts the instance in document.body by default", () => {
    const injector = TestBed.inject(Injector);
    const probe = createCallable<void, string>(ProbeComponent);
    const before = document.body.querySelectorAll("ngx-call-probe").length;

    const pending = probe.call(undefined, { injector });

    expect(document.body.querySelectorAll("ngx-call-probe")).toHaveLength(before + 1);
    expect(document.body.querySelector("ngx-call-probe")?.parentElement).toBe(document.body);
    TestBed.inject(DialogService).closeAll("done");
    return pending;
  });

  it("mounts the instance in the given container instead of document.body", () => {
    const injector = TestBed.inject(Injector);
    const probe = createCallable<void, string>(ProbeComponent);
    const container = document.createElement("div");
    document.body.appendChild(container);

    const pending = probe.call(undefined, { injector, container });

    expect(container.children).toHaveLength(1);
    expect(container.children[0].tagName.toLowerCase()).toBe("ngx-call-probe");
    TestBed.inject(DialogService).closeAll("done");
    return pending.finally(() => container.remove());
  });
});

/** Stands for the component that opens a dialog: its `Injector` is a node injector, as real callers pass. */
@Component({ selector: "ngx-call-scoped-host", template: "" })
class ScopedHostComponent {
  readonly injector = inject(Injector);
}

const SCOPED = new InjectionToken<string>("SCOPED", { providedIn: "root", factory: () => "root" });

@Component({ selector: "ngx-call-scoped-probe", template: "" })
class ScopedProbeComponent {
  readonly scoped = inject(SCOPED);
}

/*
 * A provider declared on the caller's environment injector (a lazy route, say) must reach the instance: the element
 * injector chain does not see environment providers, so `environmentInjector` has to be the caller's.
 */
describe("Callable.call — environment injector of the caller", () => {
  const scopedOf = (service: DialogService) =>
    // The mounted instances are only exposed through the private `instances` signal.
    (service as unknown as { instances: () => { ref: { instance: ScopedProbeComponent } }[] }).instances()[0].ref.instance.scoped;

  it("resolves the providers of the caller's environment injector", async () => {
    const service = TestBed.inject(DialogService);
    const routeInjector = createEnvironmentInjector([{ provide: SCOPED, useValue: "route" }], TestBed.inject(EnvironmentInjector));
    // The caller is a component living under that environment injector (a lazy route): its `Injector` is a node injector.
    const host = createComponent(ScopedHostComponent, { environmentInjector: routeInjector });
    const callable = createCallable<void, string>(ScopedProbeComponent);

    const pending = callable.call(undefined, { injector: host.instance.injector });

    expect(scopedOf(service)).toBe("route");
    service.closeAll("done");
    await pending;
    host.destroy();
    routeInjector.destroy();
  });

  it("still resolves the root providers when the caller is the root injector", async () => {
    const service = TestBed.inject(DialogService);
    const callable = createCallable<void, string>(ScopedProbeComponent);

    const pending = callable.call(undefined, { injector: TestBed.inject(Injector) });

    expect(scopedOf(service)).toBe("root");
    service.closeAll("done");
    await pending;
  });
});
