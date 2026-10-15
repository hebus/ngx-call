import { Component, Injector } from "@angular/core";
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
