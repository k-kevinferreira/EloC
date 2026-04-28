'use server';

import { redirect } from 'next/navigation';

import { BackendApiError, requestBackend } from '@/lib/http/backend-api';
import {
  clearAdminAccessTokenCookie,
  setAdminAccessTokenCookie,
} from '@/lib/auth/session';
import type { LoginResponse } from '@/types/auth/auth.types';

export type LoginActionState = {
  errors: {
    email?: string;
    password?: string;
  };
  message?: string;
};

export async function loginAdminAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const errors: LoginActionState['errors'] = {};

  if (!email) {
    errors.email = 'Informe o e-mail administrativo.';
  }

  if (!password) {
    errors.password = 'Informe a senha administrativa.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
    };
  }

  try {
    const response = await requestBackend<LoginResponse>('auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    await setAdminAccessTokenCookie(response.accessToken);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return {
        errors: {},
        message: error.message,
      };
    }

    return {
      errors: {},
      message: 'Não foi possível autenticar agora. Tente novamente.',
    };
  }

  redirect('/admin/dashboard');
}

export async function logoutAdminAction() {
  await clearAdminAccessTokenCookie();
  redirect('/admin/login');
}
