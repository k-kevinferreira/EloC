'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '@/services/products/admin-products';
import type { ProductMutationInput } from '@/types/catalog/catalog.types';

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProductFormValues = {
  categoryId: string;
  subcategoryId: string;
  code: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: string;
};

type ProductFieldErrors = {
  categoryId?: string;
  subcategoryId?: string;
  code?: string;
  slug?: string;
  title?: string;
  price?: string;
  imageUrl?: string;
  displayOrder?: string;
};

export type ProductFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors: ProductFieldErrors;
  values: ProductFormValues;
};

export type ProductDeleteState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export async function createProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductFormData(formData);

  if ('fieldErrors' in parsed) {
    return {
      status: 'error',
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  try {
    await createProduct(parsed.input);
  } catch (error) {
    return toProductFormErrorState(error, parsed.values);
  }

  revalidatePath('/admin/products');

  return {
    status: 'success',
    message: 'Produto criado com sucesso.',
    fieldErrors: {},
    values: {
      categoryId: '',
      subcategoryId: '',
      code: '',
      slug: '',
      title: '',
      shortDescription: '',
      description: '',
      price: '0.00',
      imageUrl: '',
      isFeatured: false,
      isActive: true,
      displayOrder: '0',
    },
  };
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductFormData(formData);

  if ('fieldErrors' in parsed) {
    return {
      status: 'error',
      message: 'Revise os campos destacados e tente novamente.',
      fieldErrors: parsed.fieldErrors,
      values: parsed.values,
    };
  }

  try {
    await updateProduct(productId, parsed.input);
  } catch (error) {
    return toProductFormErrorState(error, parsed.values);
  }

  revalidatePath('/admin/products');

  return {
    status: 'success',
    message: 'Produto atualizado com sucesso.',
    fieldErrors: {},
    values: parsed.values,
  };
}

export async function deleteProductAction(
  productId: string,
  _previousState: ProductDeleteState,
  _formData: FormData,
): Promise<ProductDeleteState> {
  try {
    await deleteProduct(productId);
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }

  revalidatePath('/admin/products');

  return {
    status: 'success',
    message: 'Produto removido com sucesso.',
  };
}

function parseProductFormData(formData: FormData) {
  const values: ProductFormValues = {
    categoryId: String(formData.get('categoryId') ?? '').trim(),
    subcategoryId: String(formData.get('subcategoryId') ?? '').trim(),
    code: String(formData.get('code') ?? '').trim(),
    slug: String(formData.get('slug') ?? '')
      .trim()
      .toLowerCase(),
    title: String(formData.get('title') ?? '').trim(),
    shortDescription: String(formData.get('shortDescription') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    price: String(formData.get('price') ?? '').trim(),
    imageUrl: String(formData.get('imageUrl') ?? '').trim(),
    isFeatured: formData.get('isFeatured') === 'on',
    isActive: formData.get('isActive') === 'on',
    displayOrder: String(formData.get('displayOrder') ?? '0').trim(),
  };

  const fieldErrors: ProductFieldErrors = {};

  if (!values.categoryId) {
    fieldErrors.categoryId = 'Selecione a categoria do produto.';
  } else if (!uuidPattern.test(values.categoryId)) {
    fieldErrors.categoryId = 'Categoria invalida.';
  }

  if (values.subcategoryId && !uuidPattern.test(values.subcategoryId)) {
    fieldErrors.subcategoryId = 'Subcategoria invalida.';
  }

  if (!values.code) {
    fieldErrors.code = 'Informe o codigo do produto.';
  } else if (values.code.length > 80) {
    fieldErrors.code = 'O codigo deve ter no maximo 80 caracteres.';
  }

  if (!values.slug) {
    fieldErrors.slug = 'Informe o slug do produto.';
  } else if (values.slug.length > 160) {
    fieldErrors.slug = 'O slug deve ter no maximo 160 caracteres.';
  } else if (!productSlugPattern.test(values.slug)) {
    fieldErrors.slug =
      'Use apenas letras minusculas, numeros e hifens simples entre termos.';
  }

  if (!values.title) {
    fieldErrors.title = 'Informe o titulo do produto.';
  } else if (values.title.length > 160) {
    fieldErrors.title = 'O titulo deve ter no maximo 160 caracteres.';
  }

  if (!values.price) {
    fieldErrors.price = 'Informe o preco do produto.';
  }

  const normalizedPrice = values.price.replace(',', '.');
  const parsedPrice = Number(normalizedPrice);

  if (
    values.price &&
    (!Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !/^\d+(?:[.,]\d{1,2})?$/.test(values.price))
  ) {
    fieldErrors.price = 'Informe um preco valido com ate 2 casas decimais.';
  }

  if (values.imageUrl) {
    try {
      // The backend accepts URLs without strict TLD validation, which URL() also supports.
      new URL(values.imageUrl);
    } catch {
      fieldErrors.imageUrl = 'Informe uma URL de imagem valida.';
    }
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

  const input: ProductMutationInput = {
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId || null,
    code: values.code,
    slug: values.slug,
    title: values.title,
    shortDescription: values.shortDescription || null,
    description: values.description || null,
    price: parsedPrice,
    imageUrl: values.imageUrl || null,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    displayOrder: parsedDisplayOrder,
  };

  return {
    input,
    values,
  };
}

function toProductFormErrorState(
  error: unknown,
  values: ProductFormValues,
): ProductFormState {
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

  return 'Nao foi possivel concluir a operacao agora. Tente novamente.';
}
