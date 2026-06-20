import { Type } from "@angular/core";
import { ConfirmExample } from "./confirm-dialog";
import { AlertExample } from "./alert-dialog";
import { PromptExample } from "./prompt-input";
import { NestedExample } from "./nested-dialog";
import { SaveFormExample } from "./save-form";
import { GreeterExample } from "./root-context";
import { OptionalMutationExample } from "./optional-mutation";
import { ProgressToastExample } from "./progress-toast";
import { ErrorBannerExample } from "./error-banner";
import { LiveStatusExample } from "./live-status";
import { BroadcastUpdateExample } from "./broadcast-update";
import { ItemPickerExample } from "./item-picker";
import { ColorPickerExample } from "./color-picker";
import { ContextMenuExample } from "./context-menu";
import { CommandPaletteExample } from "./command-palette";
import { BottomSheetExample } from "./bottom-sheet";
import { SettingsDrawerExample } from "./side-drawer";
import { ImageLightboxExample } from "./image-lightbox";
import { WizardExample } from "./wizard";
import { PermissionExample } from "./permission-prompt";
import { CallerResolveExample } from "./caller-resolve";

/** Metadata for a single example, driving the index, routes and per-example page. */
export interface ExampleMeta {
  /** URL slug — also the source file name under `examples-src/` (matches react-call). */
  slug: string;
  title: string;
  description: string;
  category: string;
  /** The trigger component rendered live on the example page. */
  component: Type<unknown>;
}

/** Every example, in display order, grouped by category. */
export const EXAMPLES: readonly ExampleMeta[] = [
  // ── Dialogs ──────────────────────────────────────────────────────────────
  {
    slug: "confirm-dialog",
    title: "Confirm dialog",
    description: "Destructive-action confirmation, returning a boolean to the caller.",
    category: "Dialogs",
    component: ConfirmExample
  },
  {
    slug: "alert-dialog",
    title: "Alert dialog",
    description: "A single-button notice; the caller awaits acknowledgement (void).",
    category: "Dialogs",
    component: AlertExample
  },
  {
    slug: "prompt-input",
    title: "Prompt for input",
    description: "Component-based alternative to window.prompt(): resolves with a string or null.",
    category: "Dialogs",
    component: PromptExample
  },
  {
    slug: "nested-dialog",
    title: "Nested dialog",
    description: "A callable that opens itself, with independent promise resolution per instance.",
    category: "Dialogs",
    component: NestedExample
  },

  // ── Mutations & context ──────────────────────────────────────────────────
  {
    slug: "save-form",
    title: "Save form with mutation flow",
    description: "Async submit via createMutationFlow: pending tracking, retry by staying open.",
    category: "Mutations & context",
    component: SaveFormExample
  },
  {
    slug: "root-context",
    title: "Account-aware dialog",
    description: "Access root props (user context) via call.root, without passing them each call.",
    category: "Mutations & context",
    component: GreeterExample
  },
  {
    slug: "optional-mutation",
    title: "Confirm with optional async",
    description: "One callable supporting instant close or async handling, per caller.",
    category: "Mutations & context",
    component: OptionalMutationExample
  },

  // ── Notifications ────────────────────────────────────────────────────────
  {
    slug: "progress-toast",
    title: "Progress toast",
    description: "A singleton toast updating itself via upsert() as work progresses.",
    category: "Notifications",
    component: ProgressToastExample
  },
  {
    slug: "error-banner",
    title: "Auto-dismissing error",
    description: "A transient banner closing itself; multiple calls stack independently.",
    category: "Notifications",
    component: ErrorBannerExample
  },
  {
    slug: "live-status",
    title: "Live status update",
    description: "A pinned pill updated from the caller via update(handle, props).",
    category: "Notifications",
    component: LiveStatusExample
  },
  {
    slug: "broadcast-update",
    title: "Broadcast to every call",
    description: "A single update(props) affects all open instances, each keeping its own state.",
    category: "Notifications",
    component: BroadcastUpdateExample
  },

  // ── Pickers ──────────────────────────────────────────────────────────────
  {
    slug: "item-picker",
    title: "Item picker",
    description: "List selection returning the chosen item, or null on cancellation.",
    category: "Pickers",
    component: ItemPickerExample
  },
  {
    slug: "color-picker",
    title: "Color picker",
    description: "A grid of swatches with visual selection, resolving to a hex value or null.",
    category: "Pickers",
    component: ColorPickerExample
  },

  // ── Menus ────────────────────────────────────────────────────────────────
  {
    slug: "context-menu",
    title: "Context menu",
    description: "A right-click menu positioned at the cursor coordinates.",
    category: "Menus",
    component: ContextMenuExample
  },
  {
    slug: "command-palette",
    title: "Command palette (⌘K)",
    description: "A searchable action list with keyboard navigation (arrows, Enter, Esc).",
    category: "Menus",
    component: CommandPaletteExample
  },

  // ── Drawers ──────────────────────────────────────────────────────────────
  {
    slug: "bottom-sheet",
    title: "Bottom sheet",
    description: "A mobile-pattern panel sliding from the bottom with an exit animation.",
    category: "Drawers",
    component: BottomSheetExample
  },
  {
    slug: "side-drawer",
    title: "Settings drawer",
    description: "A side panel owning its form state, resolving with saved values or null.",
    category: "Drawers",
    component: SettingsDrawerExample
  },

  // ── Overlay ──────────────────────────────────────────────────────────────
  {
    slug: "image-lightbox",
    title: "Image lightbox",
    description: "A full-image overlay closable via backdrop or the Escape key.",
    category: "Overlay",
    component: ImageLightboxExample
  },

  // ── Flows ────────────────────────────────────────────────────────────────
  {
    slug: "wizard",
    title: "Multi-step wizard",
    description: "A three-step signup with back/forward navigation and one structured response.",
    category: "Flows",
    component: WizardExample
  },
  {
    slug: "permission-prompt",
    title: "Permission consent",
    description: "An OAuth-style prompt returning a tagged allow/deny response.",
    category: "Flows",
    component: PermissionExample
  },
  {
    slug: "caller-resolve",
    title: "Resolve from the caller",
    description: "External settlement via Approval.end(handle, value), with no dialog interaction.",
    category: "Flows",
    component: CallerResolveExample
  }
];

/** Categories in display order, derived from {@link EXAMPLES}. */
export const CATEGORIES: readonly string[] = [...new Set(EXAMPLES.map(e => e.category))];

/** Look up an example by its slug. */
export const findExample = (slug: string | null): ExampleMeta | undefined => EXAMPLES.find(e => e.slug === slug);
