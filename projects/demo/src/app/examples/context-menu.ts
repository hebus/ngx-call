import { Component, ElementRef, signal, viewChild } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

interface Action {
  id: string;
  label: string;
  destructive?: boolean;
}

// A right-click menu positioned at the cursor: the caller forwards the click
// coordinates as plain props, applied via fixed top/left.
@Component({
  selector: "context-menu",
  host: {
    "(document:keydown.escape)": "call.end(null)",
    "(document:mousedown)": "onDoc($event)"
  },
  template: `
    <div #menu class="ad-menu" role="menu" [style.top.px]="call.props().y" [style.left.px]="call.props().x">
      @for (action of call.props().actions; track action.id) {
        <button role="menuitem" [class.is-danger]="action.destructive" (click)="call.end(action.id)">{{ action.label }}</button>
      }
    </div>
  `
})
class ContextMenu {
  protected readonly call = injectCallRef<{ x: number; y: number; actions: readonly Action[] }, string | null>();
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>("menu");

  protected onDoc(event: MouseEvent): void {
    if (!this.menu().nativeElement.contains(event.target as Node)) this.call.end(null);
  }
}

const ContextMenuCall = createCallable<{ x: number; y: number; actions: readonly Action[] }, string | null>(ContextMenu);

const ACTIONS: readonly Action[] = [
  { id: "rename", label: "Rename" },
  { id: "duplicate", label: "Duplicate" },
  { id: "archive", label: "Archive" },
  { id: "delete", label: "Delete", destructive: true }
];

@Component({
  selector: "context-menu-example",
  template: `
    <div class="ex-target" (contextmenu)="open($event)">Right-click me</div>
    <span class="ex-status" [class.ex-status--ok]="!!last()">{{ last() ? "→ " + last() : "→ no action yet" }}</span>
  `
})
export class ContextMenuExample {
  protected readonly last = signal<string | null>(null);

  protected async open(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const action = await ContextMenuCall.call({ x: event.clientX, y: event.clientY, actions: ACTIONS });
    if (action) this.last.set(action);
  }
}
