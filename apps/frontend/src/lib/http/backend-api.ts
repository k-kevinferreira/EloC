import 'server-only';

import { getBackendApiUrl } from '@/lib/config/env';

type BackendRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  accessToken?: string | null;
  body?: unknown;
  headers?: HeadersInit;
};

export class BackendApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

export async function requestBackend<T>(
  path: string,
  options: BackendRequestOptions = {},
) {
  const url = new URL(path, withTrailingSlash(getBackendApiUrl()));
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type');
  const responseBody =
    contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new BackendApiError(
      extractErrorMessage(responseBody, response.status),
      response.status,
      responseBody,
    );
  }

  return responseBody as T;
}

function extractErrorMessage(body: unknown, status: number) {
  if (
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return body.message;
  }

  return `Backend request failed with status ${status}.`;
}

function withTrailingSlash(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}
