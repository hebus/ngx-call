# Mutation flow

`createMutationFlow(call, mutationFn?)` wires a `CallRef` to an async action and tracks `pending` for you (counterpart of react-call's `useMutationFlow`).

```ts
type MutationFn<R, A = void> = (call: CallRef<any, R, any>, args: A) => void | Promise<void>;

interface MutationFlow<R, A = void> {
  (args: A): Pendable<R>;          // runs the flow
  readonly pending: Signal<boolean>;
}
interface Pendable<R> { orEnd(fallback: R): void }
```

## Behaviour

- **With a `mutationFn`**: `submit(args)` runs it and toggles `submit.pending()`. The function decides when to close, by calling `call.end(result)`. If it throws / rejects, `pending` clears but the dialog **stays open** so the user can fix input and retry. `.orEnd(x)` is a no-op.
- **Without a `mutationFn`**: `submit(args).orEnd(fallback)` closes immediately with `fallback`. One callable can therefore support both "just return the value" and "run my async save first".

## Recipe

```ts
type Props = { mutationFn?: MutationFn<boolean, { name: string }> };

@Component({
  template: `
    <input #name />
    <button [disabled]="submit.pending()" (click)="submit({ name: name.value }).orEnd(true)">Save</button>
  `,
})
class SaveForm {
  protected call = injectCallRef<Props, boolean>();
  protected submit = createMutationFlow(this.call, this.call.props().mutationFn);
}

export const Save = createCallable<Props, boolean>(SaveForm);

// Caller owns the side effect
await Save.call({
  mutationFn: async (call, { name }) => {
    await api.save(name);   // throws → dialog stays open
    call.end(true);         // success → close
  },
});
```

Demo: `projects/demo/src/app/examples/save-form.ts`, `optional-mutation.ts`.
