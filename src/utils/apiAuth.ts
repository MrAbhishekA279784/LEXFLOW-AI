import { auth } from '../lib/firebase';

let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Retrieves an authentication token for API calls.
 * Prioritizes:
 * 1. Active Firebase auth token
 * 2. Cached in-memory valid token
 * 3. Stored localStorage token
 * 4. Fresh JWT session from backend /api/v1/auth/session
 */
export async function getAuthToken(): Promise<string | null> {
  // 1. Firebase Auth user token
  try {
    if (auth.currentUser) {
      const fbToken = await auth.currentUser.getIdToken();
      if (fbToken) return fbToken;
    }
  } catch {
    // Ignore Firebase errors and fallback
  }

  // 2. In-memory cached token
  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 30000) {
    return cachedToken;
  }

  // 3. LocalStorage cached token
  try {
    const stored = localStorage.getItem('lexflow_auth_token');
    if (stored) {
      const parts = stored.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 > now + 30000) {
          cachedToken = stored;
          tokenExpiry = payload.exp * 1000;
          return stored;
        }
      }
    }
  } catch {
    // Ignore localStorage parsing errors
  }

  // 4. Request signed session token from backend
  try {
    const res = await fetch('/api/v1/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'usr-default-ahamed',
        email: 'ahamed@gmail.com',
        name: 'Ahamed Khan'
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data?.token) {
        cachedToken = json.data.token;
        tokenExpiry = now + 3600 * 1000;
        try {
          localStorage.setItem('lexflow_auth_token', cachedToken);
        } catch {}
        return cachedToken;
      }
    }
  } catch {
    // Server fetch fallback
  }

  return null;
}

/**
 * Returns header object with Bearer authorization if a token exists
 */
export async function getAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    ...extraHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}
