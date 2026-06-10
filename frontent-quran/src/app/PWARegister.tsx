"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        // Automatically unregister any active service worker in development mode
        // to prevent Next.js HMR/Fast Refresh intercept loop reloads.
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then(() => {
              console.log("[PWA] Unregistered service worker in development:", registration.scope);
            });
          }
        });
        return;
      }

      if ((window as any).workbox === undefined) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.error("[PWA] Service Worker registration failed:", err);
          });
      }
    }
  }, []);

  return null;
}
