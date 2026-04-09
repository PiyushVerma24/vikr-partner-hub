"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.error("SW registration failed:", err));
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-sm">
      <div className="max-w-md mx-auto p-4">
        <div className="bg-bg-card border border-brand-accent/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-main">Install VIKR Hub</h3>
                <p className="text-xs text-text-muted mt-0.5">Add to your home screen for quick access</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-text-muted hover:text-text-main transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-brand-accent text-black font-bold text-xs py-2.5 rounded-lg hover:bg-brand-accent/90 transition-colors uppercase tracking-wide"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-bg-hover text-text-main font-bold text-xs py-2.5 rounded-lg hover:bg-border-subtle transition-colors uppercase tracking-wide"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
