# ngx-call

[![npm version](https://img.shields.io/npm/v/ngx-call.svg)](https://www.npmjs.com/package/ngx-call)
[![npm downloads](https://img.shields.io/npm/dm/ngx-call.svg)](https://www.npmjs.com/package/ngx-call)
[![license](https://img.shields.io/npm/l/ngx-call.svg)](https://github.com/hebus/ngx-call/blob/main/LICENSE)

> Imperative, type-safe, promise-based dialogs & overlays for Angular — the Angular counterpart of [react-call](https://github.com/desko27/react-call)'s `createCallable`.

Call a dialog like a function. Bind a component once, then `await Confirm.call(props)` and get the user's response back as a typed promise. Stacking, "close all" and a single-backdrop policy are built in — no global state, no template wiring.

**[▶ Live demo & 21 examples → hebus.github.io/ngx-call](https://hebus.github.io/ngx-call/)**

```ts
export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog);

const ok = await Confirm.call({ message: "Delete this item?" });
//    ^ resolves to boolean — fully typed
```

## Features

- **Imperative API** — `call`, `upsert`, `update`, `end`, `setRoot`, mirroring react-call's full surface.
- **Type-safe** — arguments and the resolved value are typed end-to-end.
- **Promise-based** — `await` any overlay; each call stacks an independent instance.
- **Anything overlay-shaped** — confirms, prompts, toasts, drawers, command palettes, wizards… ([see the demo](https://hebus.github.io/ngx-call/)).
- **Async mutations** — `createMutationFlow` for submit-with-pending tracking and retry-by-staying-open.
- **Tiny** — only `tslib` at runtime; built on Angular signals and DI.

## Install

```bash
npm install ngx-call
```

## Quick start

**1. Define a callable dialog.** The component injects its arguments and resolution handle via `injectCallRef()` — no interface to implement.

```typescript
import { afterNextRender, Component, viewChild } from '@angular/core';
import {
  createCallable, injectCallRef, Dialog,
  DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from 'ngx-call';

@Component({
  selector: 'confirm-dialog',
  imports: [Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter],
  template: `
    <dialog #dialog (closed)="call.end($event)">
      <DialogContent>
        <DialogHeader><DialogTitle>{{ call.props().title }}</DialogTitle></DialogHeader>
        <p>{{ call.props().message }}</p>
        <DialogFooter>
          <button (click)="dialog.cancel()">No</button>
          <button (click)="dialog.close('dialog-yes')">Yes</button>
        </DialogFooter>
      </DialogContent>
    </dialog>
  `,
})
export class ConfirmDialog {
  protected call = injectCallRef<{ title: string; message: string }, string>();
  private dialog = viewChild.required(Dialog);
  constructor() { afterNextRender(() => this.dialog().showModal()); }
}

export const Confirm = createCallable<{ title: string; message: string }, string>(ConfirmDialog);
```

**2. Register `provideCallable()` once at bootstrap** so calls work without passing an injector:

```typescript
import { provideCallable } from 'ngx-call';

bootstrapApplication(App, { providers: [provideCallable()] });
```

**3. Call it from anywhere:**

```typescript
const result = await Confirm.call({ title: 'Confirm', message: 'Continue?' });
```

> Without `provideCallable()`, pass an injector explicitly: `Confirm.call(props, { injector })`.

## API

| Export | Role |
| --- | --- |
| `createCallable(component, unmountDelay?)` | Binds a component to a typed `call(props, options?)`; also exposes `upsert` / `update` / `end` / `setRoot`. |
| `injectCallRef<P, R>()` | Inside the component: `props` / `index` / `stackSize` / `ended` signals + `end(result)`. |
| `provideCallable()` | Captures the root injector so `call(props)` works without one. |
| `createMutationFlow(fn)` | Wraps an async submit with `pending` tracking and retry by keeping the dialog open. |
| `DialogService` | Lower-level `call()`, `closeAll(result?)`, `openCount` signal. |
| `Dialog` + `DialogContent / Header / Title / Footer` | Lightweight, self-styled wrappers over the native `<dialog>`. |

### Stacking & backdrop

Each `call()` mounts an independent instance, so calls **stack**. Native modal `<dialog>` backdrops would cumulatively darken the page; `DialogService` keeps a single visible backdrop by tagging every instance above the bottom-most with the `ad-dialog--behind` host class. Add this once to your global styles:

```css
dialog::backdrop { background-color: rgb(0 0 0 / 0.5); }
.ad-dialog--behind dialog::backdrop { background-color: transparent; }
```

`call.index()` / `call.stackSize()` expose the instance's position for position-aware UI (e.g. a cascade offset — apply transforms to `DialogContent`, never to the `<dialog>` element itself, as a transform on a top-layer element breaks its rendering). `DialogService.closeAll(result?)` resolves and tears down every open instance at once.

## Compatibility

Angular **22+** (`@angular/core` and `@angular/common` are peer dependencies, `^22.0.0`). Standalone APIs only.

## Links

- 🎬 [Live demo & examples](https://hebus.github.io/ngx-call/)
- 📦 [GitHub repository](https://github.com/hebus/ngx-call)
- ⚛️ [react-call](https://github.com/desko27/react-call) — the original this ports

## License

[MIT](https://github.com/hebus/ngx-call/blob/main/LICENSE) © hebus
