'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

/** Multicolor "G" mark shown inside the dark button (Google brand asset). */
function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

/**
 * Google sign-in button styled with the app design system (`dark`, like the
 * "Crear cuenta" CTA). Clicking it opens the Google account chooser in a
 * popup (OAuth2 token flow) and the resulting access token goes to the
 * parent container for the BFF exchange. The popup works on mobile, where
 * the One Tap prompt is unreliable (suppressed/clipped). A closed popup
 * stays silent; a missing token surfaces `onError`. Renders nothing when
 * `clientId` is empty (Google not configured).
 */
export function GoogleSigninButton({
  clientId,
  label,
  disabled,
  onCredential,
  onError,
}: {
  clientId: string;
  label: string;
  disabled: boolean;
  onCredential: (accessToken: string) => void;
  onError: () => void;
}) {
  const scriptReady = useRef(false);
  const callbacks = useRef({ onCredential, onError });

  useEffect(() => {
    callbacks.current = { onCredential, onError };
  }, [onCredential, onError]);

  const markReady = useCallback(() => {
    scriptReady.current = true;
  }, []);

  function handleClick() {
    const google = window.google;
    if (!clientId || !google) {
      onError();
      return;
    }
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: (response) => {
          if (response.access_token) {
            callbacks.current.onCredential(response.access_token);
          } else {
            callbacks.current.onError();
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch {
      onError();
    }
  }

  if (!clientId) {
    return null;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={markReady}
      />
      <Button
        variant="dark"
        size="lg"
        className="w-full"
        data-testid="google-signin-button"
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
      >
        <GoogleMark />
        {label}
      </Button>
    </>
  );
}
