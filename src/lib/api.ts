export const getAuthToken = () => localStorage.getItem('adminToken');
export const setAuthToken = (token: string) => localStorage.setItem('adminToken', token);
export const removeAuthToken = () => localStorage.removeItem('adminToken');

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    window.location.reload();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'API Request Failed');
  }

  return response.json();
}
