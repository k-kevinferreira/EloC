import { getBackendApiUrl } from '@/lib/config/env';

type UploadRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(_request: Request, context: UploadRouteContext) {
  const { path = [] } = await context.params;

  if (!isSafeUploadPath(path)) {
    return new Response('Invalid upload path.', { status: 400 });
  }

  const backendUploadsUrl = resolveBackendUploadsUrl(path);
  const backendResponse = await fetch(backendUploadsUrl, {
    cache: 'no-store',
  });

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response('Upload not found.', { status: backendResponse.status });
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type':
        backendResponse.headers.get('content-type') ?? 'application/octet-stream',
    },
  });
}

function resolveBackendUploadsUrl(path: string[]) {
  const backendApiUrl = new URL(getBackendApiUrl());
  const backendUploadsUrl = new URL(backendApiUrl.origin);

  backendUploadsUrl.pathname = `/uploads/${path.map(encodeURIComponent).join('/')}`;

  return backendUploadsUrl;
}

function isSafeUploadPath(path: string[]) {
  return (
    path.length > 0 &&
    path.every((segment) => {
      return (
        segment.length > 0 &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.includes('/') &&
        !segment.includes('\\')
      );
    })
  );
}
