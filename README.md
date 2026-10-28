# ngx-call

> Imperative, type-safe, promise-based dialogs & overlays for Angular — the Angular counterpart of [react-call](https://github.com/desko27/react-call)'s `createCallable`.

**[▶ Live demo & 21 examples → hebus.github.io/ngx-call](https://hebus.github.io/ngx-call/)**

Call a dialog like a function. Await a confirm, resolve a value — no template wiring, no boilerplate.

```typescript
// 1 — bind any component, once
export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog);

// 2 — call it like a function, anywhere
const ok = await Confirm.call({ message: "Delete this item?" });
//    ^ resolves to boolean — fully typed
```

## Features

- **Imperative API** — `call`, `upsert`, `update`, `end`, `setRoot`, mirroring react-call's full surface.
- **Type-safe** — arguments and the resolved value are typed end-to-end.
- **Promise-based** — `await` any overlay; each call stacks an independent instance.
- **Zero dependencies** — built on Angular signals and DI.
- **Anything overlay-shaped** — confirms, prompts, toasts, drawers, command palettes, wizards… see the [demo](https://hebus.github.io/ngx-call/).

## How it differs from react-call

Beyond the obvious Angular-vs-React: **react-call is headless** — it gives you the callable/stacking mechanism and you render and style the overlay yourself. ngx-call keeps that same headless engine (`createCallable`, `injectCallRef`, stacking, `closeAll`) **and** ships optional UI primitives built directly on web-platform standards:

- **Native `<dialog>` element** — the `Dialog` wrapper drives the real element via `showModal()` / `show()`, so you get the browser **top layer**, the native `::backdrop`, focus trapping and <kbd>Esc</kbd>-to-close for free — no re-implemented modal logic.
- **Standard Popover API** — `showPopover()` opens in the top layer with native light-dismiss (`closedby="any"`), ideal for menus, tooltips and non-modal panels — no overlay `<div>`, no manual outside-click handling.
- **Single-backdrop stacking** — stacked native modals would each paint their own `::backdrop` and cumulatively darken the page; ngx-call keeps exactly one visible backdrop across the whole stack.
- **No `<Root/>` to place** — react-call requires you to render `<X.Root />` in your component tree; ngx-call mounts instances imperatively (to `document.body`) once `provideCallable()` is registered, so there's nothing to wire into a template.
- **Signals throughout** — `call.props()`, `call.index()`, `call.stackSize()` and `DialogService.openCount` are Angular signals.

The UI primitives are optional: use the headless `createCallable` with your own markup, or lean on `Dialog` / `DialogContent` for the batteries-included path.

**Familiar by design** — the public API deliberately mirrors react-call's surface (`createCallable`, and `call` / `upsert` / `update` / `end` / `setRoot`). Porting a dialog between React and Angular — in either direction — is closer to a mechanical rename than a rewrite.

## Install

```bash
npm i ngx-call
```

Then capture the root injector at bootstrap:

```typescript
bootstrapApplication(App, { providers: [provideCallable()] });
```

## AI agent skill

Teach your coding agent (Claude Code, Cursor, Copilot…) how to use ngx-call:

```bash
npx skills add hebus/ngx-call --skill ngx-call
```

## Caller destroyed while a call is open

A call outlives the component that made it: if that component is destroyed while the overlay is open, the promise would stay pending and your code would resume later on a destroyed component. Pass the caller's `DestroyRef` to end the call instead — the promise resolves with `undefined` and the instance is torn down:

```typescript
private readonly destroyRef = inject(DestroyRef);

async rename(): Promise<void> {
  const name = await RenameDialog.call({ current: this.name() }, { destroyRef: this.destroyRef });
  if (name === undefined) return; // dismissed, or this component was destroyed
  this.save(name);
}
```

The registration is dropped as soon as the call ends normally. `upsert()` ignores the option when it reuses an already-live instance.

## Development

This is a multi-project Angular workspace: the `ngx-call` library and a `demo` application.

```bash
npm install
npm start              # serves the demo at http://localhost:4200/
npx ng build ngx-call  # builds the library
npx ng build demo      # builds the demo app
npm test               # runs unit tests (Vitest)
```

## Demo deployment

The demo is built and published to GitHub Pages on every push to `main` via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) →
[hebus.github.io/ngx-call](https://hebus.github.io/ngx-call/).

## Credits

A direct port of [desko27/react-call](https://github.com/desko27/react-call) to Angular.
