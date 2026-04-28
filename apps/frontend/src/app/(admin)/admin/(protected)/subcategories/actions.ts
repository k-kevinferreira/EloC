'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import {
  createSubcategory,
  deleteSubcategory,
  updateSubcategory,
} from '@/services/subcategories/admin-subcategories';
import type { SubcategoryMutationInput } from '@/types/catalog/catalog.types';

const subcategorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SubcategoryFormValues = {
  categoryId: string;
  name: string;
  slug: string;
  displayOrder: string;
  isActive: boolean;
};

type SubcategoryFieldErrors = {
  categoryId?: string;
  name?: string;
  slug?: string;
  displayOrder?: string;
};

type SubcategoryFormParseResult =
  | {
      fieldErrors: SubcategoryFieldErrors;
      values: SubcategoryFormValues;
    }
  | {
      input: SubcategoryMutationInput;
      values: SubcategoryFormValues;
    };

export type SubcategoryFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors: SubcategoryFieldErrors;
  values: SubcategoryFormValues;
};

export type SubcategoryDeleteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createSubcategoryAction(
  _previousState: SubcategoryFormState,
  formData: FormData,
): Promise<SubcategoryFormState> {
  const parsed = parseSubcategoryFormData(formData);

  if ('fieldErrors' in parsed) {
    return {
      status: 'error',
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  try {
    await createSubcategory(parsed.input);
  } catch (error) {
    return toSubcategoryFormErrorState(error, parsed.values);
  }

  revalidatePath('/admin/subcategories');

  return {
    status: 'success',
    message: 'Subcategoria criada com sucesso.',
    fieldErrors: {},
    values: {
      categoryId: '',
      name: '',
      slug: '',
      displayOrder: '0',
      isActive: true,
    },
  };
}

export async function updateSubcategoryAction(
  subcategoryId: string,
  _previousState: SubcategoryFormState,
  formData: FormData,
): Promise<SubcategoryFormState> {
  const parsed = parseSubcategoryFormData(formData);

  if ('fieldErrors' in parsed) {
    return {
      status: 'error',
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  try {
    await updateSubcategory(subcategoryId, parsed.input);
  } catch (error) {
    return toSubcategoryFormErrorState(error, parsed.values);
  }

  revalidatePath('/admin/subcategories');

  return {
    status: 'success',
    message: 'Subcategoria atualizada com sucesso.',
    fieldErrors: {},
    values: parsed.values,
  };
}

export async function deleteSubcategoryAction(
  subcategoryId: string,
  _previousState: SubcategoryDeleteState,
  _formData: FormData,
): Promise<SubcategoryDeleteState> {
  try {
    await deleteSubcategory(subcategoryId);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }

  revalidatePath('/admin/subcategories');

  return {
    status: 'success',
    message: 'Subcategoria removida com sucesso.',
  };
}

function parseSubcategoryFormData(formData: FormData): SubcategoryFormParseResult {
  const values: SubcategoryFormValues = {
    categoryId: String(formData.get('categoryId') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    slug: String(formData.get('slug') ?? '')
      .trim()
      .toLowerCase(),
    displayOrder: String(formData.get('displayOrder') ?? '0').trim(),
    isActive: formData.get('isActive') === 'on',
  };

  const fieldErrors: SubcategoryFieldErrors = {};

  if (!values.categoryId) {
    fieldErrors.categoryId = 'Selecione a categoria pai.';
  } else if (!uuidPattern.test(values.categoryId)) {
    fieldErrors.categoryId = 'Categoria invalida.';
  }

  if (!values.name) {
    fieldErrors.name = 'Informe o nome da subcategoria.';
  } else if (values.name.length > 100) {
    fieldErrors.name = 'O nome deve ter no máximo 100 caracteres.';
  }

  if (!values.slug) {
    fieldErrors.slug = 'Informe o slug da subcategoria.';
  } else if (values.slug.length > 120) {
    fieldErrors.slug = 'O slug deve ter no máximo 120 caracteres.';
  } else if (!subcategorySlugPattern.test(values.slug)) {
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
    fieldErrors.displayOrder =
      'A ordem de exibicao deve ser um inteiro maior ou igual a zero.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      values,
    };
  }

  const input: SubcategoryMutationInput = {
    categoryId: values.categoryId,
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

function toSubcategoryFormErrorState(
  error: unknown,
  values: SubcategoryFormValues,
): SubcategoryFormState {
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
