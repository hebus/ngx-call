# Dialog UI (optional)

The engine (`createCallable`, `injectCallRef`) is headless: you can render any markup (see the overlay `div` in the demo's `confirm-dialog.ts`). ngx-call also ships wrappers over the native `<dialog>` element: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`.

## Native `<dialog>` callable

```ts
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
```

- Result is a `DialogEvent`: `dialog-close | dialog-cancel | dialog-confirm | dialog-no | dialog-yes` (or `{ type, ... }`).
- `showModal()` gives top layer, native `::backdrop`, focus trap and Esc-to-close. `show()` is the non-modal variant.
- Nested pieces can close the dialog through `DIALOG_REF` (`DialogRef.close(eventType?)`).

## Stacking and backdrop

Each `call()` stacks. Add once to global styles so only one backdrop shows:

```css
dialog::backdrop { background-color: rgb(0 0 0 / 0.5); }
.ad-dialog--behind dialog::backdrop { background-color: transparent; }
```

`call.index()` / `call.stackSize()` allow position-aware UI (e.g. cascade offset). Apply transforms to `DialogContent`, never to `<dialog>` itself.

## Inside a native popover

`dialog.showModal()` closes every `popover="auto"` that is not an ancestor of the dialog. When calling from inside one, mount the dialog inside it:

```ts
openConfirm(event: Event) {
  const container = (event.target as HTMLElement).closest<HTMLElement>('[popover]') ?? undefined;
  return Confirm.call({ message: 'Delete?' }, { container });
}
```

## Exit animations

Pass `unmountDelay` to `createCallable(Component, 200)` (or per call) and style off `call.ended()`:

```ts
host: { '[class.leaving]': 'call.ended()' }
```
