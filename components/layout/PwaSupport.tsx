'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function PwaSupport() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    setIsStandalone(standalone);
    setIsMobileDevice(/android|iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const isiPhoneOrIpad = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /safari/i.test(window.navigator.userAgent) && !/crios|fxios|edgios|chrome/i.test(window.navigator.userAgent);
    setShowIosHint(isiPhoneOrIpad && isSafari && !standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
      }, { once: true });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  const showBanner = !isStandalone && !dismissed && (deferredPrompt || showIosHint || isMobileDevice);

  if (!showBanner) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
      <div className="pointer-events-auto w-full max-w-md rounded-[24px] border border-white/10 bg-[#0d0d0d]/92 p-4 text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#1db954]/10">
            <img src="/Applogo.png" alt="Soul Sound app logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Soul Sound</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              {deferredPrompt
                ? 'Get a full-screen mobile app with faster reloads and offline fallback.'
                : showIosHint
                  ? 'On iPhone, tap Share and choose Add to Home Screen for the app experience.'
                  : 'Use your browser menu and tap Add to Home Screen to install this app.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss install banner"
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            onClick={() => setDismissed(true)}
          >
            ×
          </button>
        </div>
        {deferredPrompt ? (
          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-[#1db954] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            onClick={handleInstall}
          >
            Install app
          </button>
        ) : (
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            onClick={() => setShowManualHelp((prev) => !prev)}
          >
            {showManualHelp ? 'Hide install steps' : 'Show install steps'}
          </button>
        )}

        {showManualHelp && !deferredPrompt && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs leading-5 text-white/75">
            <p>Android: Browser menu → Add to Home screen</p>
            <p>iPhone: Share icon → Add to Home Screen</p>
          </div>
        )}
      </div>
    </div>
  );
}