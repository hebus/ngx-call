import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideMarkdown } from "shikidown";
import { provideCallable } from "ngx-call";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Captures the root injector so `Confirm.call(props)` works without an explicit injector.
    provideCallable(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: "enabled", anchorScrolling: "enabled" })),
    // shikidown: highlight the example sources shown on each page.
    // Vesper: a minimal warm-dark theme (near-black bg, peach-gold accents) that
    // harmonises with the site's terracotta/copper/gold palette.
    provideMarkdown({ theme: "vesper", languages: ["typescript"] })
  ]
};
