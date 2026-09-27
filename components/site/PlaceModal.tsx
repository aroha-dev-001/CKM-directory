"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, type ReactNode, type RefObject, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { catLabel, placeById, popularFor, t } from "@/lib/data";
import { useLang } from "@/lib/lang";
import { prefersReduced } from "@/components/ui/motion";

type OpenPlace = (id: string) => void;

const PlaceModalContext = createContext<OpenPlace>(() => {});

/** Open the visitor-notes modal for a destination id. */
export function useOpenPlace(): OpenPlace {
  return useContext(PlaceModalContext);
}

// "opening" renders the modal with the panel at rest; one frame later "open" lets the
// CSS transition scale it in. "closing" plays the exit before the modal is hidden.
type Phase = "closed" | "opening" | "open" | "closing";

export function PlaceModalProvider({ children }: { children: ReactNode }) {
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [phase, setPhaseState] = useState<Phase>("closed");
  const phaseRef = useRef<Phase>("closed");
  const lastFocus = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef(0);
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const openedAt = useRef<string | null>(null);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const open = useCallback<OpenPlace>(
    (id) => {
      if (!placeById(id)) return;
      window.clearTimeout(closeTimer.current);
      lastFocus.current = document.activeElement as HTMLElement | null;
      openedAt.current = pathRef.current;
      setPlaceId(id);
      setPhase("opening");
    },
    [setPhase]
  );

  const close = useCallback(
    (restoreFocus = true) => {
      if (phaseRef.current === "closed" || phaseRef.current === "closing") return;
      setPhase("closing");
      const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")) || 150;
      closeTimer.current = window.setTimeout(
        () => {
          setPhase("closed");
          if (restoreFocus) lastFocus.current?.focus?.();
        },
        prefersReduced() ? 0 : ms
      );
    },
    [setPhase]
  );

  useEffect(() => {
    if (phase !== "opening") return;
    const raf = requestAnimationFrame(() => setPhase("open"));
    panelRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, [phase, setPhase]);

  useEffect(() => {
    if (phase === "closed") return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [phase, close]);

  // Layout effects run before the new page's effects, so a page that opens the
  // modal on arrival (/places?id=…) records the path it opened on.
  useLayoutEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  // Leaving the page (back button, a link in the modal) takes the modal with it.
  useEffect(() => {
    if (openedAt.current && openedAt.current !== pathname) close(false);
  }, [pathname, close]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <PlaceModalContext.Provider value={open}>
      {children}
      <PlaceModal placeId={placeId} phase={phase} panelRef={panelRef} onClose={close} />
    </PlaceModalContext.Provider>
  );
}

function PlaceModal({
  placeId,
  phase,
  panelRef,
  onClose,
}: {
  placeId: string | null;
  phase: Phase;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: (restoreFocus?: boolean) => void;
}) {
  const lang = useLang();
  const place = placeById(placeId);
  const extra = place ? popularFor(place.id) : undefined;
  const panelClass = phase === "open" ? " is-open" : phase === "closing" ? " is-closing" : "";

  return (
    <div className={`modal${phase === "opening" || phase === "open" ? " is-open" : ""}`} id="place-modal" hidden={phase === "closed"}>
      <div className="modal-backdrop" onClick={() => onClose()} />
      <div
        ref={panelRef}
        className={`modal-panel t-modal${panelClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <button className="icon-close" type="button" aria-label="Close" onClick={() => onClose()}>
          ×
        </button>
        <div className="modal-media">
          {place && <img id="modal-image" src={place.image} alt={place.name} width={1800} height={1200} />}
        </div>
        <div className="modal-body" id="modal-body">
          {place && (
            <>
              <p className="kicker">
                {catLabel(place.category, lang)} · {place.taluk}
                {place.elevation ? ` · ${place.elevation}` : ""}
              </p>
              <h2 id="modal-title">{place.name}</h2>
              <p className="kn">{place.kannada}</p>
              <p>{place.summary}</p>
              {extra && (
                <>
                  <div className="visitor-card">
                    <h3 className="kicker">Published visitor hours</h3>
                    <p>
                      <strong>{extra.hours}</strong>
                    </p>
                    <p>{extra.hoursDetail}</p>
                    {extra.hoursSource && (
                      <p className="visitor-source">
                        <a href={extra.hoursSource.url} rel="noopener noreferrer">
                          {extra.hoursSource.label}
                        </a>
                      </p>
                    )}
                  </div>
                  <h3 className="kicker" style={{ marginTop: "1.1rem" }}>
                    Why travellers stop here
                  </h3>
                  <p>{extra.why}</p>
                </>
              )}
              <h3 className="kicker" style={{ marginTop: "1.1rem" }}>
                {t(lang, "visit_notes")}
              </h3>
              <p>{place.visit}</p>
              <p className="visitor-disclaimer">
                Public notes only, not a ticket, permit, fee table or live gate status. Confirm on the official page before you
                go.
              </p>
              <div className="modal-actions">
                <Link
                  className="btn btn-dark"
                  href={place.talukId ? `/taluk/${place.talukId}#place-${place.id}` : "/map"}
                  onClick={() => onClose(false)}
                >
                  {t(lang, "open_map")}
                </Link>
              </div>
              <div className="source-list">
                {(place.sources || []).map((s) => (
                  <a key={s.url + s.label} href={s.url} rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
