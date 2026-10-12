---
"ngx-call": minor
---

`CallOptions` gains `destroyRef`. When it is destroyed while the dialog is still open, the call ends and its promise resolves with `undefined` instead of staying pending forever. The registration is dropped when the call ends normally.
