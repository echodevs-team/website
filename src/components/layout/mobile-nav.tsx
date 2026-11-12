"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "../ui/button";

const subscribeReady = () => () => {};

/** Modal dialog supplies native focus containment and background inertness.
 * The child navigation is still server-rendered, not a client dictionary. */
export function MobileNav({ labels, children }: {
  labels: { open: string; close: string; title: string }; children: ReactNode;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);

  function close() { dialog.current?.close(); }
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 64rem)");
    function resized() {
      if (desktop.matches) {
        dialog.current?.close();
      }
    }
    desktop.addEventListener("change", resized);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", resized);
    };
  }, [open]);

  return <div className="mobile-navigation">
    <Button ref={trigger} variant="secondary" aria-expanded={open} aria-controls={id}
      aria-haspopup="dialog" disabled={!ready} onClick={() => {
        dialog.current?.showModal();
        setOpen(true);
        closeButton.current?.focus();
      }}>{labels.open}</Button>
    <dialog ref={dialog} id={id} className="mobile-dialog" aria-label={labels.title}
      onCancel={(event) => { event.preventDefault(); close(); }}
      onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); close(); } }}
      onClose={() => {
        setOpen(false);
        if (window.matchMedia("(min-width: 64rem)").matches) {
          document.querySelector<HTMLElement>(".header-brand")?.focus();
        } else trigger.current?.focus();
      }}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a[href]")) close();
      }}>
      <div className="mobile-dialog-heading">
        <strong>{labels.title}</strong>
        <Button ref={closeButton} variant="secondary" onClick={close}>{labels.close}</Button>
      </div>
      {children}
    </dialog>
  </div>;
}
