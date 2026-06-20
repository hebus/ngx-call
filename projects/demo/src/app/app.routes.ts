import { Routes } from "@angular/router";
import { ExamplesHome } from "./home";
import { ExamplePage } from "./example-page";

export const routes: Routes = [
  { path: "", component: ExamplesHome, title: "ngx-call — examples" },
  { path: "examples/:slug", component: ExamplePage },
  { path: "**", redirectTo: "" }
];
