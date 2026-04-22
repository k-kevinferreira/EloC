import 'server-only';

const fallbackBackendApiUrl = 'http://localhost:3001/api';

export function getBackendApiUrl() {
  return process.env.BACKEND_API_URL ?? fallbackBackendApiUrl;
}
