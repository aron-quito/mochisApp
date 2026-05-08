export const getAuthToken = () => localStorage.getItem('adminToken');
export const setAuthToken = (token: string) => localStorage.setItem('adminToken', token);
export const removeAuthToken = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
};

export const getUserRole = (): 'admin' | 'employee' => (localStorage.getItem('userRole') as any) || 'admin';
export const getUserId = () => localStorage.getItem('userId');
export const getUserName = () => localStorage.getItem('userName') || 'Admin';

export const setSession = (token: string, role: string, id: string | null, name: string) => {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('userRole', role);
  localStorage.setItem('userId', id || '');
  localStorage.setItem('userName', name);
};

// --- CONFIGURACIÓN DE URL PARA PRODUCCIÓN ---
const API_BASE_URL = 'http://159.112.145.76:8081/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Cambiamos la ruta relativa por la URL absoluta de tu servidor
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

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