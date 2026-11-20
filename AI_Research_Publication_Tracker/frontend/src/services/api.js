const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
export function getToken(){ return localStorage.getItem('rt_token'); }
export async function api(path, options={}) {
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const response = await fetch(`${BASE}${path}`, {...options, headers});
  if (!response.ok) {
    let message = 'Something went wrong';
    try { message = (await response.json()).error || message; } catch {}
    if (response.status === 401) { localStorage.removeItem('rt_token'); localStorage.removeItem('rt_user'); }
    throw new Error(message);
  }
  const type = response.headers.get('content-type') || '';
  return type.includes('application/json') ? response.json() : response;
}
