import { Component } from "@angular/core";
import { createCallable, injectCallRef } from "ngx-call";

// A full-image overlay, closable via backdrop click or the Escape key.
@Component({
  selector: "image-lightbox",
  host: { "(document:keydown.escape)": "call.end()" },
  template: `
    <div class="ad-overlay ad-overlay--image" role="dialog" aria-modal="true" [attr.aria-label]="call.props().alt" (click)="call.end()">
      <img class="ad-lightbox-img" [src]="call.props().src" [alt]="call.props().alt" />
      <button class="ad-lightbox-close" aria-label="Close" (click)="call.end()">×</button>
    </div>
  `
})
class Lightbox {
  protected readonly call = injectCallRef<{ src: string; alt: string }, void>();
}

const LightboxCall = createCallable<{ src: string; alt: string }, void>(Lightbox);

interface Thumb {
  thumb: string;
  full: string;
  alt: string;
}

const THUMBNAILS: readonly Thumb[] = [
  {
    thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&h=120&fit=crop",
    full: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
    alt: "Circuit board macro"
  },
  {
    thumb: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=160&h=120&fit=crop",
    full: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200",
    alt: "Forest path"
  },
  {
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=160&h=120&fit=crop",
    full: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    alt: "Mountains at dusk"
  }
];

@Component({
  selector: "image-lightbox-example",
  template: `
    <div class="ex-thumbs">
      @for (t of thumbnails; track t.thumb) {
        <button class="ex-thumb" (click)="open(t)"><img [src]="t.thumb" [alt]="t.alt" /></button>
      }
    </div>
    <span class="ex-status">click a thumbnail → lightbox</span>
  `
})
export class ImageLightboxExample {
  protected readonly thumbnails = THUMBNAILS;

  protected open(t: Thumb): void {
    LightboxCall.call({ src: t.full, alt: t.alt });
  }
}
