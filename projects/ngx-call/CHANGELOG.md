# ngx-call

## 0.3.1

### Patch Changes

- [#5](https://github.com/hebus/ngx-call/pull/5) [`02cbbd3`](https://github.com/hebus/ngx-call/commit/02cbbd3edfa7fafc211391b9a2c5d82faae3cf89) Thanks [@hebus](https://github.com/hebus)! - Document the `ngx-call` agent skill (`npx skills add hebus/ngx-call --skill ngx-call`) in the README

## 0.3.0

### Minor Changes

- [#2](https://github.com/hebus/ngx-call/pull/2) [`613e3dc`](https://github.com/hebus/ngx-call/commit/613e3dc7d62dc682fb018a479f8cfd5e7c04115b) Thanks [@hebus](https://github.com/hebus)! - `CallOptions` gains `container`: the element the instance is mounted in (`document.body` by default). Pass the nearest `[popover]` ancestor when calling from inside a native `popover="auto"` — `showModal()` hides every auto popover that is not an ancestor of the dialog, so a dialog mounted in `document.body` closes the popover that opened it. `DialogService.mount()` accepts the same container as an optional 4th argument.

## 0.2.0

### Minor Changes

- [`c502a87`](https://github.com/hebus/ngx-call/commit/c502a8700b35049e156e5ec89a83b476485ff9cc) Thanks [@hebus](https://github.com/hebus)! - `CallOptions` gains `destroyRef`. When it is destroyed while the dialog is still open, the call ends and its promise resolves with `undefined` instead of staying pending forever. The registration is dropped when the call ends normally.
