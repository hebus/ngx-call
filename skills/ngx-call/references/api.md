# ngx-call API reference

Source of truth: `projects/ngx-call/src/public-api.ts` and `projects/ngx-call/src/lib/*.ts`.

## Exports

| Export | Kind | Role |
| --- | --- | --- |
| `createCallable(component, unmountDelay = 0)` | function | Binds a standalone component, returns `Callable<P, R, RP>`. |
| `provideCallable()` | function | `EnvironmentProviders`; captures the root injector via an app initializer. |
| `injectCallRef<P, R, RP>()` | function | Typed `CallRef` inside the callable component (injection context). |
| `CallRef`, `CALL_REF` | class / token | Handle + DI token behind `injectCallRef`. |
| `Callable`, `CallOptions` | types | Return type of `createCallable` / options of `call` & `upsert`. |
| `DialogService` | service (root) | Low-level `mount()`, `closeAll(result?)`, `openCount` signal. |
| `createMutationFlow(call, fn?)` | function | Async submit with `pending` signal. |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` | components | Optional wrappers over native `<dialog>`. |
| `DIALOG_REF`, `DialogRef`, `DialogEvent`, `DialogResult` | token / types | Close handle and event names. |

## `Callable<P, R, RP>`

```ts
call(props: P, options?: CallOptions): Promise<R>;      // stacks a new instance
upsert(props: P, options?: CallOptions): Promise<R>;    // singleton create-or-update
update(handle: Promise<R>, props: Partial<P>): void;    // one instance, shallow merge
update(props: Partial<P>): void;                        // broadcast to all open instances
end(): void;                                            // all, resolve with undefined
end(result: R): void;                                   // all, resolve with result
end(handle: Promise<R>, result: R): void;               // one instance
setRoot(props: RP): void;                               // ambient props, reactive
```

- The promise returned by `call`/`upsert` is the instance's identity for `update(handle, …)` / `end(handle, …)`.
- `upsert` returns the same promise for the singleton's lifetime.
- Stack metadata (`index`, `stackSize`) is per callable.

## `CallOptions`

| Option | Meaning |
| --- | --- |
| `injector` | Injector used to resolve `DialogService` and parent the instance DI. Defaults to the one captured by `provideCallable()`. |
| `unmountDelay` | ms between resolution and teardown (exit animation). Overrides the `createCallable` default. |
| `destroyRef` | When destroyed, the call ends and resolves with `undefined` — check before touching the caller after `await`. |
| `container` | Element to mount into (default `document.body`). Ignored by `upsert` when reusing a live instance. |

## `CallRef<P, R, RP>`

| Member | Type | Notes |
| --- | --- | --- |
| `props` | `Signal<P>` | Per-call arguments, updated by `update()`/`upsert()`. |
| `root` | `Signal<RP>` | Ambient props from `setRoot()`. |
| `ended` | `Signal<boolean>` | `true` after `end()`; drive exit animations. |
| `index` | `Signal<number>` | 0-based position in this callable's stack. |
| `stackSize` | `Signal<number>` | Live instances of this callable. |
| `end(result: R)` | method | Resolves the promise and tears down. Idempotent. |

## `DialogService`

- `mount(component, callRef, parentInjector, container?)` → `DialogHandle` (`destroy()`); used by `createCallable`.
- `closeAll(result?)` — ends every mounted instance across all callables.
- `openCount` — `Signal<number>` of mounted instances.
- Keeps a single visible backdrop: instances above the first get the `ad-dialog--behind` host class.

## Errors

`[ngx-call] createCallable: no injector available…` → `provideCallable()` missing at bootstrap and no `{ injector }` passed.
