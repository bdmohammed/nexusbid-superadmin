'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, EyeOff } from 'lucide-react';

export default function ImpersonationBanner() {
  const [impersonated, setImpersonated] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    // Check localStorage for active impersonation session
    const checkImpersonation = () => {
      const stored = localStorage.getItem('impersonatedUser');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user?.name) {
            setImpersonated({ name: user.name, email: user.email });
          }
        } catch {
          // Ignore parse errors
        }
      } else {
        setImpersonated(null);
      }
    };

    checkImpersonation();

    // Listen to local storage changes (in case impersonation starts/ends in other tabs)
    window.addEventListener('storage', checkImpersonation);
    // Custom event to trigger re-checks on the same window
    window.addEventListener('impersonationChange', checkImpersonation);

    return () => {
      window.removeEventListener('storage', checkImpersonation);
      window.removeEventListener('impersonationChange', checkImpersonation);
    };
  }, []);

  const handleEndSession = () => {
    localStorage.removeItem('impersonatedUser');
    localStorage.removeItem('impersonatedToken');

    // Dispatch event to notify listeners
    window.dispatchEvent(new Event('impersonationChange'));

    // Optionally redirect back or refresh the page to update the context
    window.location.reload();
  };

  if (!impersonated) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between text-sm shadow-md transition-all duration-300 animate-slide-down sticky top-0 z-50">
      <div className="flex items-center gap-2 mx-auto">
        <AlertTriangle size={16} className="text-amber-100 animate-pulse" />
        <span className="font-medium">
          You are impersonating{' '}
          <strong className="text-white underline">{impersonated.name}</strong> (
          {impersonated.email})
        </span>
        <span className="hidden md:inline text-xs text-amber-100 ml-1">
          (Actions perform as this user, recorded in audit log)
        </span>
      </div>
      <button
        onClick={handleEndSession}
        className="flex items-center gap-1.5 bg-amber-800/80 hover:bg-amber-950 text-white font-semibold px-3 py-1 rounded-lg text-xs transition border border-amber-500/30 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      >
        <EyeOff size={13} />
        End Session
      </button>
    </div>
  );
}
