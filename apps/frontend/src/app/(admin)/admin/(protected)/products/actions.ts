'use server';

import { revalidatePath } from 'next/cache';

import { BackendApiError } from '@/lib/http/backend-api';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '@/services/products/admin-products';
import { uploadProductImage } from '@/services/uploads/admin-uploads';
import type {
  ProductImageMutationInput,
  ProductMutationInput,
} from '@/types/catalog/catalog.types';

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
  images: ProductImageFormValue[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: string;
};

type ProductImageFormValue = {
  url: string;
  altText: string;
  displayOrder: string;
  isPrimary: boolean;
};

type ProductFieldErrors = {
  categoryId?: string;
  subcategoryId?: string;
  code?: string;
  slug?: string;
  title?: string;
  price?: string;
  images?: string;
  displayOrder?: string;
};

type ProductFormParseResult =
  | {
      fieldErrors: ProductFieldErrors;
      values: ProductFormValues;
    }
  | {
      input: ProductMutationInput;
      values: ProductFormValues;
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

export type ProductImageUploadState =
  | {
      status: 'success';
      image: {
        url: string;
        filename: string;
        mimeType: string;
        size: number;
      };
    }
  | {
      status: 'error';
      message: string;
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
      images: [createEmptyImageFormValue()],
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

export async function uploadProductImageAction(
  formData: FormData,
): Promise<ProductImageUploadState> {
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return {
      status: 'error',
      message: 'Selecione uma imagem antes de enviar.',
    };
  }

  try {
    const uploadedImage = await uploadProductImage(file);

    return {
      status: 'success',
      image: {
        url: uploadedImage.url,
        filename: uploadedImage.filename,
        mimeType: uploadedImage.mimeType,
        size: uploadedImage.size,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: extractActionErrorMessage(error),
    };
  }
}

function parseProductFormData(formData: FormData): ProductFormParseResult {
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '')
    .trim()
    .toLowerCase();
  const values: ProductFormValues = {
    categoryId: String(formData.get('categoryId') ?? '').trim(),
    subcategoryId: String(formData.get('subcategoryId') ?? '').trim(),
    code: String(formData.get('code') ?? '').trim() || generateProductCode(slug || title),
    slug,
    title,
    shortDescription: String(formData.get('shortDescription') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    price: String(formData.get('price') ?? '').trim(),
    images: [],
    isFeatured: formData.get('isFeatured') === 'on',
    isActive: formData.get('isActive') === 'on',
    displayOrder: String(formData.get('displayOrder') ?? '0').trim(),
  };
  const parsedImages = parseProductImagesPayload(String(formData.get('images') ?? '[]'));
  values.images = parsedImages.images;

  const fieldErrors: ProductFieldErrors = {};

  if (!values.categoryId) {
    fieldErrors.categoryId = 'Selecione a categoria do produto.';
  } else if (!uuidPattern.test(values.categoryId)) {
    fieldErrors.categoryId = 'Categoria invalida.';
  }

  if (!values.subcategoryId) {
    fieldErrors.subcategoryId = 'Selecione o material/acabamento do produto.';
  } else if (!uuidPattern.test(values.subcategoryId)) {
    fieldErrors.subcategoryId = 'Subcategoria invalida.';
  }

  if (!values.code) {
    fieldErrors.code = 'Informe o código do produto.';
  } else if (values.code.length > 80) {
    fieldErrors.code = 'O código deve ter no máximo 80 caracteres.';
  }

  if (!values.slug) {
    fieldErrors.slug = 'Informe o slug do produto.';
  } else if (values.slug.length > 160) {
    fieldErrors.slug = 'O slug deve ter no máximo 160 caracteres.';
  } else if (!productSlugPattern.test(values.slug)) {
    fieldErrors.slug =
      'Use apenas letras minusculas, numeros e hifens simples entre termos.';
  }

  if (!values.title) {
    fieldErrors.title = 'Informe o título do produto.';
  } else if (values.title.length > 160) {
    fieldErrors.title = 'O título deve ter no máximo 160 caracteres.';
  }

  if (!values.price) {
    fieldErrors.price = 'Informe o preço do produto.';
  }

  const normalizedPrice = values.price.replace(',', '.');
  const parsedPrice = Number(normalizedPrice);

  if (
    values.price &&
    (!Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !/^\d+(?:[.,]\d{1,2})?$/.test(values.price))
  ) {
    fieldErrors.price = 'Informe um preço válido com até 2 casas decimais.';
  }

  if (parsedImages.invalidPayload) {
    fieldErrors.images = 'Não foi possível interpretar as imagens informadas.';
  }

  const primaryImagesCount = values.images.filter((image) => image.isPrimary).length;

  if (primaryImagesCount > 1) {
    fieldErrors.images = 'Defina apenas uma imagem principal por produto.';
  }

  for (const image of values.images) {
    if (!image.url) {
      fieldErrors.images = 'Cada imagem precisa ter uma URL valida ou ser removida.';
      break;
    }

    try {
      new URL(image.url);
    } catch {
      fieldErrors.images = 'Revise as URLs informadas na galeria do produto.';
      break;
    }

    const parsedImageOrder = Number(image.displayOrder);

    if (!Number.isInteger(parsedImageOrder) || parsedImageOrder < 0) {
      fieldErrors.images =
        'A ordem de cada imagem deve ser um inteiro maior ou igual a zero.';
      break;
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
    subcategoryId: values.subcategoryId,
    code: values.code,
    slug: values.slug,
    title: values.title,
    shortDescription: values.shortDescription || null,
    description: values.description || null,
    price: parsedPrice,
    images: normalizeImagesForMutation(values.images),
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

  return 'Não foi possível concluir a operação agora. Tente novamente.';
}

function parseProductImagesPayload(payload: string) {
  if (!payload.trim()) {
    return {
      images: [],
      invalidPayload: false,
    };
  }

  try {
    const parsed = JSON.parse(payload);

    if (!Array.isArray(parsed)) {
      return {
        images: [createEmptyImageFormValue()],
        invalidPayload: true,
      };
    }

    const images = parsed
      .map((image) => ({
        url: String(image?.url ?? '').trim(),
        altText: String(image?.altText ?? '').trim(),
        displayOrder: String(image?.displayOrder ?? '0').trim(),
        isPrimary: Boolean(image?.isPrimary),
      }))
      .filter((image) => {
        return image.url.length > 0 || image.altText.length > 0;
      });

    return {
      images,
      invalidPayload: false,
    };
  } catch {
    return {
      images: [createEmptyImageFormValue()],
      invalidPayload: true,
    };
  }
}

function normalizeImagesForMutation(
  images: ProductImageFormValue[],
): ProductImageMutationInput[] {
  const filledImages = images
    .filter((image) => image.url.trim().length > 0)
    .map((image, index) => ({
      url: image.url.trim(),
      altText: image.altText.trim() || null,
      displayOrder: Number(image.displayOrder.trim() || index),
      isPrimary: image.isPrimary,
    }));

  if (filledImages.length === 0) {
    return [];
  }

  if (!filledImages.some((image) => image.isPrimary)) {
    filledImages[0] = {
      ...filledImages[0],
      isPrimary: true,
    };
  }

  return filledImages;
}

function createEmptyImageFormValue(): ProductImageFormValue {
  return {
    url: '',
    altText: '',
    displayOrder: '0',
    isPrimary: true,
  };
}

function generateProductCode(value: string) {
  const normalizedValue = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 48);
  const suffix = Date.now().toString(36).toUpperCase();

  return `${normalizedValue || 'PRODUTO'}-${suffix}`;
}
