'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Stack } from '@/components/ui/stack';
import { Text } from '@/components/ui/text';
import { useSession } from '../session-context';

/**
 * Dedicated redirect target for the Google OAuth2 full-tab chooser (see
 * `GoogleSigninButton`). Rendering this instead of reusing `/ingresar`
 * avoids flashing the full login form: the server can't see the URL
 * fragment (`#access_token=…`), so if Google redirected back to `/ingresar`
 * itself the SSR response would always paint the plain empty form before
 * hydration could react to the hash. This route's SSR output is just the
 * spinner, so the form never has a chance to flash. Exchanges the token via
 * `loginWithGoogle` and replaces to `state` (the pre-login destination) or
 * back to `/ingresar` with `?error=` on failure/cancel.
 */
export function GoogleCallbackContainer({
  locale,
  pendingMessage,
}: {
  locale: string;
  pendingMessage: string;
}) {
  const router = useRouter();
  const { loginWithGoogle } = useSession();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = hashParams.get('access_token');
    const returnedError = queryParams.get('error');
    const rawState = hashParams.get('state');
    const destination =
      rawState && rawState.startsWith('/') && !rawState.startsWith('//')
        ? rawState
        : `/${locale}/cuenta`;
    const loginUrl = `/${locale}/ingresar`;
    if (!accessToken || returnedError) {
      router.replace(`${loginUrl}?error=access_denied`);
      return;
    }
    void loginWithGoogle({ accessToken }).then((result) => {
      if (!result.ok) {
        router.replace(`${loginUrl}?error=access_denied`);
        return;
      }
      router.replace(destination);
      router.refresh();
    });
  }, [loginWithGoogle, locale, router]);

  return (
    <Container>
      <Section>
        <Stack gap="md" className="mx-auto w-full max-w-md">
          <Card>
            <Stack gap="md" align="center" justify="center" className="py-10 text-center">
              <Text role="status">{pendingMessage}</Text>
              <span
                aria-hidden="true"
                className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent text-primary"
              />
            </Stack>
          </Card>
        </Stack>
      </Section>
    </Container>
  );
}
