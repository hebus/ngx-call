# Recipes

Runnable sources live in `projects/demo/src/app/examples/` (live: https://hebus.github.io/ngx-call/). Pick the closest one when implementing a request.

| Need | Example file | Key idea |
| --- | --- | --- |
| Confirm, returns `boolean` | `confirm-dialog.ts` | `createCallable<{ message }, boolean>`; `call.end(true/false)` |
| Alert, returns `void` | `alert-dialog.ts` | Caller awaits acknowledgement |
| Prompt, returns `string \| null` | `prompt-input.ts` | Replacement for `window.prompt()` |
| Dialog opening itself | `nested-dialog.ts` | Independent promise per instance; `call.index()` |
| Async save, retry on error | `save-form.ts` | `createMutationFlow`, stays open on throw |
| Optional async side effect | `optional-mutation.ts` | `submit().orEnd(x)` fallback when no `mutationFn` |
| App-wide context (user, theme) | `root-context.ts` | `X.setRoot()` + `call.root()` |
| Progress / loading singleton | `progress-toast.ts`, `live-status.ts` | `upsert()` + `update()` |
| Error banner | `error-banner.ts` | Singleton, closed from caller |
| Update all open instances | `broadcast-update.ts` | `X.update(patch)` |
| Close from the caller | `caller-resolve.ts` | `X.end(promise, result)` |
| Pickers | `item-picker.ts`, `color-picker.ts` | Resolve with selected value |
| Menus / palettes | `context-menu.ts`, `command-palette.ts` | Popover / `container` option |
| Drawers / sheets / lightbox | `side-drawer.ts`, `bottom-sheet.ts`, `image-lightbox.ts` | Headless layout + exit animation via `ended` |
| Multi-step flow | `wizard.ts` | One callable, internal step state |
| Permission prompt | `permission-prompt.ts` | Typed union result |

## Porting from react-call

| react-call | ngx-call |
| --- | --- |
| `createCallable<Props, Res>(Component)` | `createCallable<Props, Res>(Component)` |
| `<X.Root />` in the tree | `provideCallable()` once at bootstrap |
| `({ call })` component prop | `const call = injectCallRef<Props, Res>()` |
| `call.end(value)` | `call.end(value)` |
| `call.root` | `call.root()` (signal) |
| `useMutationFlow(call, fn)` | `createMutationFlow(call, fn)` |
| `X.update(promise, props)` / `X.end(promise, v)` | same |
