---
"ngx-call": minor
---

`CallOptions` gains `container`: the element the instance is mounted in (`document.body` by default). Pass the nearest `[popover]` ancestor when calling from inside a native `popover="auto"` — `showModal()` hides every auto popover that is not an ancestor of the dialog, so a dialog mounted in `document.body` closes the popover that opened it. `DialogService.mount()` accepts the same container as an optional 4th argument.
