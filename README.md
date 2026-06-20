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

## Install

```bash
npm i ngx-call
```

Then capture the root injector at bootstrap:

```typescript
bootstrapApplication(App, { providers: [provideCallable()] });
```

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
