'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@/services/categories/admin-categories';
import type { CategoryMutationInput } from '@/types/catalog/catalog.types';

const categorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type CategoryFormValues = {
  name: string;
  slug: string;
  displayOrder: string;
  isActive: boolean;
};

type CategoryFieldErrors = {
  name?: string;
  slug?: string;
  displayOrder?: string;
};

type CategoryFormParseResult =
  | {
      fieldErrors: CategoryFieldErrors;
      values: CategoryFormValues;
    }
  | {
      input: CategoryMutationInput;
      values: CategoryFormValues;
    };

export type CategoryFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors: CategoryFieldErrors;
  values: CategoryFormValues;
};

export type CategoryDeleteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createCategoryAction(
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = parseCategoryFormData(formData);

  if ('fieldErrors' in parsed) {
    return {
      status: 'error',
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  try {
    await createCategory(parsed.input);
  } catch (error) {
    return toCategoryFormErrorState(error, parsed.values);
  }

  revalidatePath('/admin/categories');

  return {
    status: 'success',
    message: 'Categoria criada com sucesso.',
    fieldErrors: {},
    values: {
      name: '',
      slug: '',
      displayOrder: '0',
      isActive: true,
    },
  };
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = parseCategoryFormData(formData);

  if ('fieldErrors' in parsed) {
    return {
      status: 'error',
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  try {
    await updateCategory(categoryId, parsed.input);
  } catch (error) {
    return toCategoryFormErrorState(error, parsed.values);
  }

  revalidatePath('/admin/categories');

  return {
    status: 'success',
    message: 'Categoria atualizada com sucesso.',
    fieldErrors: {},
    values: parsed.values,
  };
}

export async function deleteCategoryAction(
  categoryId: string,
  _previousState: CategoryDeleteState,
  _formData: FormData,
): Promise<CategoryDeleteState> {
  try {
    await deleteCategory(categoryId);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }

  revalidatePath('/admin/categories');

  return {
    status: 'success',
    message: 'Categoria removida com sucesso.',
  };
}

function parseCategoryFormData(formData: FormData): CategoryFormParseResult {
  const values: CategoryFormValues = {
    name: String(formData.get('name') ?? '').trim(),
    slug: String(formData.get('slug') ?? '')
      .trim()
      .toLowerCase(),
    displayOrder: String(formData.get('displayOrder') ?? '0').trim(),
    isActive: formData.get('isActive') === 'on',
  };

  const fieldErrors: CategoryFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = 'Informe o nome da categoria.';
  } else if (values.name.length > 100) {
    fieldErrors.name = 'O nome deve ter no máximo 100 caracteres.';
  }

  if (!values.slug) {
    fieldErrors.slug = 'Informe o slug da categoria.';
  } else if (values.slug.length > 120) {
    fieldErrors.slug = 'O slug deve ter no máximo 120 caracteres.';
  } else if (!categorySlugPattern.test(values.slug)) {
    fieldErrors.slug =
      'Use apenas letras minusculas, numeros e hifens simples entre termos.';
  }

  if (!values.displayOrder) {
    fieldErrors.displayOrder = 'Informe a ordem de exibicao.';
  }

  const parsedDisplayOrder = Number(values.displayOrder);

  if (
    values.displayOrder &&
    (!Number.isInteger(parsedDisplayOrder) || parsedDisplayOrder < 0)
  ) {
    fieldErrors.displayOrder = 'A ordem de exibicao deve ser um inteiro maior ou igual a zero.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      values,
    };
  }

  const input: CategoryMutationInput = {
    name: values.name,
    slug: values.slug,
    isActive: values.isActive,
    displayOrder: parsedDisplayOrder,
  };

  return {
    input,
    values,
  };
}

function toCategoryFormErrorState(
  error: unknown,
  values: CategoryFormValues,
): CategoryFormState {
  return {
    status: 'error',
    message: extractActionErrorMessage(error),
    fieldErrors: {},
    values,
  };
}

function extractActionErrorMessage(error: unknown) {
  if (error instanceof BackendApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível concluir a operação agora. Tente novamente.';
}
