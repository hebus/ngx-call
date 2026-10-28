import { Routes } from "@angular/router";
import { ExamplesHome } from "./home";
import { ExamplesPage } from "./examples-page";
import { ExamplePage } from "./example-page";

export const routes: Routes = [
  { path: "", component: ExamplesHome, title: "ngx-call — examples" },
  { path: "examples", component: ExamplesPage, title: "ngx-call — all examples" },
  { path: "examples/:slug", component: ExamplePage },
  { path: "**", redirectTo: "" }
];
