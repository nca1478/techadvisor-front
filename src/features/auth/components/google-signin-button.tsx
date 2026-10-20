'use client';

import { Button } from '@/components/ui/button';

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

const GOOGLE_SCOPE = 'openid email profile';

/**
 * Google sign-in button styled with the app design system (`dark`, like the
 * "Crear cuenta" CTA). Clicking it navigates the whole tab to the Google
 * account chooser via the plain OAuth2 implicit-flow URL (full-tab redirect,
 * `prompt: 'select_account'`) so the chooser renders full-screen on every
 * viewport — desktop and mobile — instead of a small One Tap bubble or a
 * separate popup window. GIS's `oauth2.initTokenClient` does NOT support a
 * `redirect` ux_mode (that config only exists on `initCodeClient`); passing
 * it is silently ignored and the token client always opens a real popup
 * window, which is the bug this works around. Google returns to `redirectPath`
 * (a dedicated callback route, not this page — see `GoogleCallbackContainer`)
 * with `#access_token=…&state=<next>` in the fragment. Renders nothing when
 * `clientId` is empty (Google not configured).
 */
export function GoogleSigninButton({
  clientId,
  label,
  disabled,
  nextPath,
  redirectPath,
  onError,
}: {
  clientId: string;
  label: string;
  disabled: boolean;
  nextPath: string;
  /** Absolute path (e.g. `/en/ingresar/callback`) registered as the
   * Authorized redirect URI for this client id in Google Cloud Console. */
  redirectPath: string;
  onError: () => void;
}) {
  function handleClick() {
    if (!clientId) {
      onError();
      return;
    }
    const redirectUri = `${window.location.origin}${redirectPath}`;
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: GOOGLE_SCOPE,
        prompt: 'select_account',
        state: nextPath,
        include_granted_scopes: 'false',
      });
      window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    } catch {
      onError();
    }
  }

  if (!clientId) {
    return null;
  }

  return (
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
  );
}
