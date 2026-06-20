# ngx-call

An imperative, type-safe dialog API for Angular 22+ — the equivalent of
[react-call](https://github.com/desko27/react-call)'s `createCallable`. Bind a
component once, then `await Confirm.call(props)` and get the user's response back
as a typed promise. Stacking, "close all" and a single-backdrop policy are built in.

## Install

```bash
npm install ngx-call
```

## Quick start

**1. Define a callable dialog.** The component injects its arguments and resolution
handle via `injectCallRef()` — no need to implement an interface.

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

**2. Call it from anywhere.**

```typescript
const result = await Confirm.call({ title: 'Confirmer', message: 'Continuer ?' });
```

To use the no-injector form above, register `provideCallable()` at bootstrap:

```typescript
import { provideCallable } from 'ngx-call';

bootstrapApplication(App, { providers: [provideCallable()] });
```

Otherwise pass an injector explicitly: `Confirm.call(props, { injector })`.

## Concepts

| API | Role |
| --- | --- |
| `createCallable(component, unmountDelay?)` | Binds a component to a typed `call(props, options?)`. |
| `injectCallRef<P, R>()` | Inside the component: `props` / `index` / `stackSize` / `ended` signals + `end(result)`. |
| `provideCallable()` | Captures the root injector so `call(props)` works without one. |
| `DialogService` | `call()`, `closeAll(result?)`, `openCount` signal. |
| `Dialog` + `DialogContent/Header/Title/Footer` | Lightweight, self-styled wrappers over the native `<dialog>`. |

### Stacking & backdrop

Each `call()` mounts an independent instance, so calls **stack**. Native modal
`<dialog>` backdrops would cumulatively darken the page; `DialogService` keeps a
single visible backdrop by tagging every instance above the bottom-most with the
`ad-dialog--behind` host class. Add this once to your global styles:

```css
dialog::backdrop { background-color: rgb(0 0 0 / 0.5); }
.ad-dialog--behind dialog::backdrop { background-color: transparent; }
```

`call.index()` / `call.stackSize()` expose the instance's position for
position-aware UI (e.g. a cascade offset — apply transforms to `DialogContent`,
never to the `<dialog>` element itself, as a transform on a top-layer element
breaks its rendering).

`DialogService.closeAll(result?)` resolves and tears down every open instance at once.

## Build

```bash
ng build ngx-call
```

See the `demo` app in this workspace (`ng serve demo`) for runnable examples,
including nested self-opening dialogs.
