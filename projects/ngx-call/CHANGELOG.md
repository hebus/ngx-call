# ngx-call

## 0.2.0

### Minor Changes

- [`c502a87`](https://github.com/hebus/ngx-call/commit/c502a8700b35049e156e5ec89a83b476485ff9cc) Thanks [@hebus](https://github.com/hebus)! - `CallOptions` gains `destroyRef`. When it is destroyed while the dialog is still open, the call ends and its promise resolves with `undefined` instead of staying pending forever. The registration is dropped when the call ends normally.
