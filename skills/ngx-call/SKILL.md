---
name: ngx-call
description: Use ngx-call to open Angular dialogs, confirms, prompts, toasts, drawers, pickers and wizards imperatively and `await` their result (`await Confirm.call(props)`). Trigger when the user wants a typed, promise-based overlay in Angular, mentions ngx-call / createCallable / injectCallRef / createMutationFlow, or wants to replace MatDialog / CDK Dialog / a service+template-based modal with an awaitable one. Also covers porting a react-call component to Angular.
---

# ngx-call

`createCallable()` turns an Angular component into something you can `await`. You open it imperatively from anywhere (component, service, guard, plain function) and it resolves with a typed value. Angular port of [react-call](https://github.com/desko27/react-call): same surface (`call`, `upsert`, `update`, `end`, `setRoot`), signals + DI instead of hooks + `<Root />`.

Docs: https://github.com/hebus/ngx-call · Demo: https://hebus.github.io/ngx-call/ · Requires Angular 22+, standalone APIs only.

## When to use

- UI that **returns a value to its caller**: confirm, prompt, form modal, picker, context menu, command palette, wizard.
- Singleton, updatable UI (toast, progress, loading) → `upsert()` + `update()`.

Do **not** use it for presentational components that return nothing or for full-page flows (use the router).

## Mental model: Declare → Provide → Call

1. **Declare** a component that reads its inputs and resolves via `injectCallRef()`, then bind it once with `createCallable`.
2. **Provide** `provideCallable()` once at bootstrap (captures the root injector). There is no `<Root />` to place in templates.
3. **Call** from anywhere and `await` the result.

```ts
@Component({
  selector: 'confirm-dialog',
  template: `
    <p>{{ call.props().message }}</p>
    <button (click)="call.end(false)">Cancel</button>
    <button (click)="call.end(true)">Continue</button>
  `,
})
class ConfirmDialog {
  protected call = injectCallRef<{ message: string }, boolean>();
}

export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog);

// main.ts
bootstrapApplication(App, { providers: [provideCallable()] });

// anywhere
const ok = await Confirm.call({ message: 'Delete this item?' });
```

Generics: `createCallable<Props, Result, RootProps>(Component, unmountDelay?)`.

## Core API

| Need | Use |
| --- | --- |
| Open a new stacked instance | `X.call(props, options?)` → `Promise<R>` |
| Single instance, create-or-update | `X.upsert(props, options?)` |
| Change props of one / all open instances | `X.update(promise, patch)` / `X.update(patch)` (shallow merge) |
| Close from the caller side | `X.end(promise, result)` / `X.end(result)` (all) |
| Data shared by all instances (user, theme) | `X.setRoot(rootProps)` → read `call.root()` |
| Inside the component | `call.props()`, `call.root()`, `call.index()`, `call.stackSize()`, `call.ended()` (signals), `call.end(result)` |
| Async submit with pending + retry | `createMutationFlow(call, mutationFn?)` |
| Close everything | `DialogService.closeAll(result?)` |

`CallOptions`: `injector`, `unmountDelay` (ms, for exit animations — style off `call.ended()`), `destroyRef` (end the call with `undefined` when the caller is destroyed), `container` (mount element, default `document.body`).

Details and signatures: `references/api.md`. Mutation flow: `references/mutation-flow.md`. Native `<dialog>` UI, stacking, popover: `references/dialog-ui.md`. Recipes: `references/examples.md`.

## Hard rules

- Call `provideCallable()` once at bootstrap. Without it, `call()` throws — either fix the bootstrap or pass `{ injector }` explicitly.
- `injectCallRef()` must run in an injection context (field initializer or constructor) of the **callable component**.
- Always give the component a way to call `call.end(...)`; otherwise the promise never settles.
- When the caller can be destroyed before the dialog ends, pass `destroyRef` and handle the `undefined` result after `await`.
- Use `upsert()` for singletons (toasts/progress), not `call()` — `call()` stacks a new instance every time.
- Calling from inside a native `popover="auto"`: pass `container: el.closest('[popover]')` or the popover closes (and destroys the caller).
- Never apply a CSS `transform` to the `<dialog>` element itself (top layer); apply it to `DialogContent`.
- Global styles needed for stacked modals: see `references/dialog-ui.md` (single-backdrop CSS).

## Common mistakes

- Treating the callable component as a normal routed/templated component (it is created by `call()`, not placed in a template).
- Forgetting `showModal()` when using the native `<dialog>` wrapper (`afterNextRender(() => dialog().showModal())`).
- Closing a mutation-flow dialog on error: with a `mutationFn`, a throw keeps the call open for retry; only `call.end()` closes it.
- Reading `call.props` without `()` — it is a signal.
