import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { requestBackend, BackendApiError } from '@/lib/http/backend-api';
import type { SafeAdmin } from '@/types/auth/auth.types';

const ADMIN_ACCESS_TOKEN_COOKIE = 'eloc_admin_access_token';

export async function setAdminAccessTokenCookie(accessToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminAccessTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE);
}

export async function getAdminAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getAuthenticatedAdmin() {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return null;
  }

  try {
    return await requestBackend<SafeAdmin>('auth/me', {
      accessToken,
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function requireAuthenticatedAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  return admin;
}

export async function redirectIfAuthenticatedAdmin() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    redirect('/admin/dashboard');
  }
}
