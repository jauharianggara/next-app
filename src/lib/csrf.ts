import Cookies from 'js-cookie';

/**
 * Get CSRF token from cookie
 */
export const getCsrfToken = (): string | undefined => {
  return Cookies.get('XSRF-TOKEN') || Cookies.get('csrf_token') || Cookies.get('_csrf');
};

/**
 * Fetch CSRF token from backend
 * Some backends expose a /csrf endpoint to get the token
 */
export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://axum.synergyinfinity.id/';
    const response = await fetch(`${apiUrl}/csrf`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.token || data.csrfToken || null;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  return null;
};

/**
 * Initialize CSRF token on app load
 * Call this in your root layout or _app
 */
export const initCsrfToken = async (): Promise<void> => {
  const existingToken = getCsrfToken();
  if (!existingToken) {
    await fetchCsrfToken();
  }
};

/**
 * Get CSRF headers for requests
 */
export const getCsrfHeaders = (): Record<string, string> => {
  const token = getCsrfToken();
  if (!token) return {};
  
  return {
    'X-XSRF-TOKEN': token,
    'X-CSRF-TOKEN': token,
  };
};
