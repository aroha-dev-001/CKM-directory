/** Types for the parts of the vendored scrollcraft engine this app calls. */
export interface ScrollCraftWorld {
  el: HTMLElement;
  /** Document offset of the flight, in px. */
  top: number;
  /** Sum of the segment weights, in viewport-heights. */
  total: number;
  index: number;
}

export interface ScrollCraftApi {
  layout(): void;
  read(): void;
  worlds: ScrollCraftWorld[];
  lerp: number;
  /** Viewport height the layout was built with; stays put while a phone's URL bar moves. */
  readonly vh: number;
  /** Remove listeners, stop the rAF loops and disconnect observers. */
  destroy(): void;
}

/** Drive every data-sc-* device under `root` from the page scroll. */
export function mount(root: Element | Document | string, opts?: { lerp?: number }): ScrollCraftApi;

export const reduce: boolean;
export const instances: ScrollCraftApi[];

/** Fired (bubbling) on a worldflight when the current segment changes. */
export interface WaypointDetail {
  index: number;
  count: number;
  label: string;
  el: HTMLElement;
  progress: number;
}
