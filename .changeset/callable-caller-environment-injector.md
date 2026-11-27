---
"ngx-call": patch
---

A callable instance now resolves the providers of the caller's environment injector, such as the providers of a lazy route, instead of only those of the root injector. A service provided on a route and injected by the dialog component used to resolve a separate root instance of the same token.
