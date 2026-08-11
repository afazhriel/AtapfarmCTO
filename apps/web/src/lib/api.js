const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let getToken = async () => '';

export function setTokenProvider(provider) {
  getToken = provider;
}

export class ApiError extends Error {
  constructor(status, message, issues) {
    super(message);
    this.status = status;
    this.issues = issues || [];
  }
}

async function request(method, path, body) {
  if (!API_BASE_URL) throw new ApiError(0, 'API base URL is not configured.');
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      // ignore
    }
    const message = payload?.error || `Request failed with status ${response.status}.`;
    throw new ApiError(response.status, message, payload?.issues);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path)
};
