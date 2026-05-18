'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
  uploadProductImageAction,
  type ProductDeleteState,
  type ProductFormState,
} from '@/app/(admin)/admin/(protected)/products/actions';
import { ImageWithFallback } from '@/components/catalog/image-with-fallback';
import type { Category, Product, Subcategory } from '@/types/catalog/catalog.types';
import { getPrimaryProductImage, getProductImageAlt } from '@/utils/catalog';
import { formatCurrency } from '@/utils/formatters/currency';

type ProductManagementProps = {
  categories: Category[];
  canDelete: boolean;
  products: Product[];
  subcategories: Subcategory[];
};

type ActiveProductForm =
  | {
      type: 'create';
    }
  | {
      type: 'edit';
      productId: string;
    }
  | null;

type ProductEditorCardProps = {
  categories: Category[];
  canDelete: boolean;
  className?: string;
  onCancel: () => void;
  product: Product;
  subcategories: Subcategory[];
};

type ProductListItemProps = {
  isSelected: boolean;
  onEdit: () => void;
  product: Product;
};

type FormMessageProps = {
  state: ProductFormState | ProductDeleteState;
};

type ProductFormFieldsProps = {
  categories: Category[];
  idPrefix: string;
  isCategorySelectionDisabled: boolean;
  state: ProductFormState;
  subcategories: Subcategory[];
};

type ProductImageFormValue = ProductFormState['values']['images'][number];
type UploadFeedback = {
  status: 'error' | 'pending' | 'success';
  message: string;
};

const initialProductFormState: ProductFormState = {
  status: 'idle',
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
    images: [createEmptyProductImageFormValue()],
    isFeatured: false,
    isActive: true,
    displayOrder: '0',
  },
};

const initialProductDeleteState: ProductDeleteState = {
  status: 'idle',
};

export function ProductManagement({
  categories,
  canDelete,
  products,
  subcategories,
}: ProductManagementProps) {
  const [activeForm, setActiveForm] = useState<ActiveProductForm>(null);
  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Produtos cadastrados</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Gerencie as peças exibidas no catálogo, seus preços, status e imagens.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--foreground)]">
                {products.length}
              </span>{' '}
              produtos
            </div>
            <button
              type="button"
              disabled={!hasCategories}
              onClick={() => setActiveForm({ type: 'create' })}
              className="inline-flex items-center justify-center rounded-full bg-[var(--surface-contrast)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Novo produto
            </button>
          </div>
        </div>

        {!hasCategories ? (
          <div className="rounded-[1.25rem] border border-[rgba(177,59,46,0.18)] bg-[rgba(177,59,46,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            Crie categorias antes de cadastrar produtos.
          </div>
        ) : null}

        {!canDelete ? (
          <div className="rounded-[1.25rem] border border-[rgba(183,121,31,0.18)] bg-[rgba(183,121,31,0.08)] px-4 py-3 text-sm text-[var(--warning)]">
            Seu perfil pode criar e editar produtos. Exclusao permanece restrita a
            `super_admin`.
          </div>
        ) : null}
      </section>

      {activeForm?.type === 'create' ? (
        <CreateProductCard
          categories={categories}
          onCancel={() => setActiveForm(null)}
          subcategories={subcategories}
        />
      ) : null}

      <section className="space-y-3">
        {products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)] shadow-[var(--shadow-md)]">
            Nenhum produto cadastrado.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
            {products.map((product) => {
              const isSelected =
                activeForm?.type === 'edit' && activeForm.productId === product.id;

              return (
                <div key={product.id}>
                  <ProductListItem
                    isSelected={isSelected}
                    onEdit={() =>
                      setActiveForm({
                        type: 'edit',
                        productId: product.id,
                      })
                    }
                    product={product}
                  />

                  {isSelected ? (
                    <ProductEditorCard
                      categories={categories}
                      canDelete={canDelete}
                      className="border-b border-[var(--border)] bg-[var(--surface-strong)] p-4 last:border-b-0 sm:p-5"
                      onCancel={() => setActiveForm(null)}
                      product={product}
                      subcategories={subcategories}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductListItem({ isSelected, onEdit, product }: ProductListItemProps) {
  return (
    <article
      className={[
        'grid gap-4 border-b border-[var(--border)] p-4 last:border-b-0 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-center',
        isSelected ? 'bg-[var(--accent-soft)]' : 'bg-transparent',
      ].join(' ')}
    >
      <ProductThumbnail product={product} />

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold">{product.title}</h3>
          <StatusBadge tone={product.isActive ? 'success' : 'danger'}>
            {product.isActive ? 'Ativo' : 'Inativo'}
          </StatusBadge>
          {product.isFeatured ? (
            <StatusBadge tone="warning">Destaque</StatusBadge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
          <span>
            {product.category.name}
            {product.subcategory ? ` - ${product.subcategory.name}` : ''}
          </span>
          <span>{product.images.length} imagens</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
        <span className="text-sm font-semibold text-[var(--warning)]">
          {formatCurrency(product.price)}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Editar
        </button>
      </div>
    </article>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  const imageUrl = getPrimaryProductImage(product);
  const imageAlt = getProductImageAlt(product);

  return (
    <div className="h-[72px] w-[72px] overflow-hidden rounded-2xl bg-[var(--champagne)]">
      <ImageWithFallback
        src={imageUrl}
        alt={imageAlt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'danger' | 'success' | 'warning';
}) {
  const classNameByTone = {
    danger: 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]',
    success: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    warning: 'bg-[rgba(183,121,31,0.15)] text-[var(--warning)]',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classNameByTone[tone]}`}
    >
      {children}
    </span>
  );
}

function CreateProductCard({
  categories,
  onCancel,
  subcategories,
}: {
  categories: Category[];
  onCancel: () => void;
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createProductAction,
    initialProductFormState,
  );

  useEffect(() => {
    if (state.status === 'success') {
      router.refresh();
      onCancel();
    }
  }, [onCancel, router, state.status]);

  const hasCategories = categories.length > 0;
  const formKey = [
    state.status,
    state.message ?? '',
    state.values.categoryId,
    state.values.subcategoryId,
    state.values.code,
    state.values.slug,
    state.values.title,
    state.values.shortDescription,
    state.values.description,
    state.values.price,
    JSON.stringify(state.values.images),
    state.values.displayOrder,
    String(state.values.isFeatured),
    String(state.values.isActive),
  ].join(':');

  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6">
      <FormHeader
        title="Novo produto"
        description="Cadastre uma nova peça para o catálogo."
      />

      <form key={formKey} action={formAction} className="mt-6 space-y-5">
        <ProductFormFields
          categories={categories}
          idPrefix="create-product"
          isCategorySelectionDisabled={!hasCategories}
          state={state}
          subcategories={subcategories}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FormMessage state={state} />
          <FormActions onCancel={onCancel}>
            <SubmitButton
              disabled={!hasCategories}
              idleLabel="Criar produto"
              pendingLabel="Criando..."
            />
          </FormActions>
        </div>
      </form>
    </section>
  );
}

function ProductEditorCard({
  categories,
  canDelete,
  className = 'rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6',
  onCancel,
  product,
  subcategories,
}: ProductEditorCardProps) {
  const router = useRouter();
  const updateAction = updateProductAction.bind(null, product.id);
  const deleteAction = deleteProductAction.bind(null, product.id);

  const [updateState, updateFormAction] = useActionState(
    updateAction,
    buildInitialUpdateState(product),
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialProductDeleteState,
  );

  useEffect(() => {
    if (updateState.status === 'success' || deleteState.status === 'success') {
      router.refresh();
    }
  }, [deleteState.status, router, updateState.status]);

  const formKey = [
    product.id,
    product.updatedAt,
    updateState.status,
    updateState.message ?? '',
    updateState.values.categoryId,
    updateState.values.subcategoryId,
    updateState.values.code,
    updateState.values.slug,
    updateState.values.title,
    updateState.values.shortDescription,
    updateState.values.description,
    updateState.values.price,
    JSON.stringify(updateState.values.images),
    updateState.values.displayOrder,
    String(updateState.values.isFeatured),
    String(updateState.values.isActive),
  ].join(':');

  return (
    <section className={className}>
      <FormHeader
        title={`Editar ${product.title}`}
        description="Atualize os dados exibidos no catálogo."
      />

      <form key={formKey} action={updateFormAction} className="mt-6 space-y-5">
        <ProductFormFields
          categories={categories}
          idPrefix={`product-${product.id}`}
          isCategorySelectionDisabled={categories.length === 0}
          state={updateState}
          subcategories={subcategories}
        />

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FormMessage state={updateState} />
            <FormActions onCancel={onCancel}>
              <SubmitButton
                disabled={categories.length === 0}
                idleLabel="Salvar alterações"
                pendingLabel="Salvando..."
              />
            </FormActions>
          </div>
        </div>
      </form>

      <div className="mt-5 border-t border-[var(--border)] pt-5">
        <form
          action={deleteFormAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Excluir produto
            </p>
            <p className="text-sm text-[var(--muted)]">
              A exclusão pode ser bloqueada se houver vendas ou remessas vinculadas.
            </p>
          </div>

          <DeleteButton disabled={!canDelete} />
        </form>

        <div className="mt-3">
          <FormMessage state={deleteState} />
        </div>
      </div>
    </section>
  );
}

function FormHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function FormActions({
  children,
  onCancel,
}: {
  children: React.ReactNode;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        Fechar
      </button>
      {children}
    </div>
  );
}

function ProductFormFields({
  categories,
  idPrefix,
  isCategorySelectionDisabled,
  state,
  subcategories,
}: ProductFormFieldsProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(state.values.categoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    state.values.subcategoryId,
  );
  const [titleValue, setTitleValue] = useState(state.values.title);
  const [slugValue, setSlugValue] = useState(state.values.slug);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    state.values.slug.length > 0,
  );
  const [images, setImages] = useState(state.values.images);
  const [galleryUploadState, setGalleryUploadState] = useState<UploadFeedback | null>(
    null,
  );

  const filteredSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === selectedCategoryId,
  );

  async function handleMultipleImagesUpload(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      return;
    }

    setGalleryUploadState({
      status: 'pending',
      message:
        files.length === 1
          ? 'Enviando 1 imagem...'
          : `Enviando ${files.length} imagens...`,
    });

    const uploadedImages: Pick<ProductImageFormValue, 'url' | 'altText'>[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.set('file', file);

      const result = await uploadProductImageAction(formData);

      if (result.status === 'error') {
        setGalleryUploadState({
          status: 'error',
          message: result.message,
        });
        return;
      }

      uploadedImages.push({
        url: result.image.url,
        altText: titleValue || '',
      });
    }

    setImages((currentImages) => {
      const filledImages = currentImages.filter(
        (image) => image.url.trim().length > 0 || image.altText.trim().length > 0,
      );
      const nextImages = [
        ...filledImages,
        ...uploadedImages.map((image, index) => ({
          ...image,
          displayOrder: String(filledImages.length + index),
          isPrimary: false,
        })),
      ];

      if (!nextImages.some((image) => image.isPrimary)) {
        return nextImages.map((image, index) => ({
          ...image,
          isPrimary: index === 0,
        }));
      }

      return nextImages;
    });

    setGalleryUploadState({
      status: 'success',
      message:
        files.length === 1
          ? 'Imagem adicionada.'
          : `${files.length} imagens adicionadas.`,
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-categoryId`} className="text-sm font-semibold">
          Categoria
        </label>
        <select
          id={`${idPrefix}-categoryId`}
          name="categoryId"
          value={selectedCategoryId}
          disabled={isCategorySelectionDisabled}
          onChange={(event) => {
            setSelectedCategoryId(event.target.value);
            setSelectedSubcategoryId('');
          }}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {state.fieldErrors.categoryId ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.categoryId}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-subcategoryId`} className="text-sm font-semibold">
          Material/acabamento
        </label>
        <select
          id={`${idPrefix}-subcategoryId`}
          name="subcategoryId"
          value={selectedSubcategoryId}
          disabled={!selectedCategoryId}
          onChange={(event) => {
            setSelectedSubcategoryId(event.target.value);
          }}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Selecione o material/acabamento</option>
          {filteredSubcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
        {state.fieldErrors.subcategoryId ? (
          <p className="text-sm text-[var(--danger)]">
            {state.fieldErrors.subcategoryId}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="code" value={state.values.code} />

      <input type="hidden" name="slug" value={slugValue} />

      <div className="space-y-2 md:col-span-2">
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-semibold">
          Titulo
        </label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          type="text"
          value={titleValue}
          placeholder="Ex.: Anel Solitario Ouro 18k"
          onChange={(event) => {
            const nextTitle = event.target.value;
            setTitleValue(nextTitle);

            if (!isSlugManuallyEdited) {
              setSlugValue(slugifyProductTitle(nextTitle));
            }
          }}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.title ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.title}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`${idPrefix}-shortDescription`}
          className="text-sm font-semibold"
        >
          Descrição curta
        </label>
        <textarea
          id={`${idPrefix}-shortDescription`}
          name="shortDescription"
          defaultValue={state.values.shortDescription}
          rows={3}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-description`} className="text-sm font-semibold">
          Descrição completa
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={state.values.description}
          rows={3}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-price`} className="text-sm font-semibold">
          Preço
        </label>
        <input
          id={`${idPrefix}-price`}
          name="price"
          type="text"
          inputMode="decimal"
          defaultValue={state.values.price}
          placeholder="0.00"
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.price ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.price}</p>
        ) : null}
      </div>

      <ProductImagesEditor
        galleryUploadState={galleryUploadState}
        idPrefix={idPrefix}
        images={images}
        onImagesUpload={handleMultipleImagesUpload}
        setImages={setImages}
      />

      {state.fieldErrors.images ? (
        <p className="text-sm text-[var(--danger)] md:col-span-2">
          {state.fieldErrors.images}
        </p>
      ) : null}

      <div className="space-y-3 md:col-span-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={state.values.isFeatured}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="font-medium">Produto em destaque</span>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={state.values.isActive}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="font-medium">Produto ativo no catálogo</span>
        </label>
      </div>

      <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 md:col-span-2">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
          Opções avançadas
        </summary>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor={`${idPrefix}-slug`} className="text-sm font-semibold">
              Slug
            </label>
            <input
              id={`${idPrefix}-slug`}
              type="text"
              value={slugValue}
              placeholder="ex.: anel-solitario-ouro"
              onChange={(event) => {
                setIsSlugManuallyEdited(true);
                setSlugValue(slugifyProductTitle(event.target.value));
              }}
              className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            {state.fieldErrors.slug ? (
              <p className="text-sm text-[var(--danger)]">
                {state.fieldErrors.slug}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${idPrefix}-displayOrder`}
              className="text-sm font-semibold"
            >
              Ordem de exibicao
            </label>
            <input
              id={`${idPrefix}-displayOrder`}
              name="displayOrder"
              type="number"
              min="0"
              step="1"
              defaultValue={state.values.displayOrder}
              className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
            />
            {state.fieldErrors.displayOrder ? (
              <p className="text-sm text-[var(--danger)]">
                {state.fieldErrors.displayOrder}
              </p>
            ) : null}
          </div>
        </div>
      </details>
    </div>
  );
}

function ProductImagesEditor({
  galleryUploadState,
  idPrefix,
  images,
  onImagesUpload,
  setImages,
}: {
  galleryUploadState: UploadFeedback | null;
  idPrefix: string;
  images: ProductImageFormValue[];
  onImagesUpload: (fileList: FileList | null) => Promise<void>;
  setImages: React.Dispatch<React.SetStateAction<ProductImageFormValue[]>>;
}) {
  const visibleImages = images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => hasProductImageContent(image));

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="space-y-1">
        <div>
          <p className="text-sm font-semibold">Galeria</p>
          <p className="text-sm text-[var(--muted)]">
            Adicione as fotos do produto e defina qual sera a principal.
          </p>
        </div>
      </div>

      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input
        type="hidden"
        name="imageUploadStatus"
        value={resolveImageUploadStatus(galleryUploadState)}
      />
      <input
        id={`${idPrefix}-gallery-upload`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          void onImagesUpload(event.target.files);
          event.target.value = '';
        }}
        className="sr-only"
      />

      <div className="rounded-[1.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-strong)] p-4">
        <label
          htmlFor={`${idPrefix}-gallery-upload`}
          className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl bg-[var(--surface)] px-4 py-5 text-center transition hover:bg-[var(--champagne)]"
        >
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Adicionar fotos
          </span>
          <span className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Selecione uma ou varias imagens de uma vez.
          </span>
        </label>

        {galleryUploadState ? (
          <p
            className={`mt-3 text-sm ${
              galleryUploadState.status === 'error'
                ? 'text-[var(--danger)]'
                : 'text-[var(--muted)]'
            }`}
          >
            {galleryUploadState.message}
          </p>
        ) : null}
      </div>

      {visibleImages.length === 0 ? (
        <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--muted)]">
          Nenhuma foto adicionada.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleImages.map(({ image, index }) => (
          <div
            key={`${idPrefix}-image-${index}`}
            className="grid gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface-strong)] p-3 sm:p-4 lg:grid-cols-[144px_minmax(0,1fr)]"
          >
            <ImagePreview image={image} index={index} />

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setImages((currentImages) =>
                      currentImages.map((currentImage, currentIndex) => ({
                        ...currentImage,
                        isPrimary: currentIndex === index,
                      })),
                    );
                  }}
                  className={[
                    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition',
                    image.isPrimary
                      ? 'bg-[var(--surface-contrast)] text-white'
                      : 'border border-[var(--border-strong)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
                  ].join(' ')}
                >
                  {image.isPrimary ? 'Principal' : 'Tornar principal'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setImages((currentImages) => {
                      const remainingImages = currentImages.filter(
                        (_currentImage, currentIndex) => currentIndex !== index,
                      );

                      if (remainingImages.length === 0) {
                        return [createEmptyProductImageFormValue()];
                      }

                      if (!remainingImages.some((currentImage) => currentImage.isPrimary)) {
                        return remainingImages.map((currentImage, currentIndex) => ({
                          ...currentImage,
                          isPrimary: currentIndex === 0,
                        }));
                      }

                      return remainingImages;
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-[rgba(177,59,46,0.24)] bg-[rgba(177,59,46,0.08)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[rgba(177,59,46,0.14)]"
                >
                  Remover
                </button>
              </div>

              <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
                  Detalhes da imagem
                </summary>

                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor={`${idPrefix}-image-alt-${index}`}
                    className="text-sm font-semibold"
                  >
                    Alt text
                  </label>
                  <input
                    id={`${idPrefix}-image-alt-${index}`}
                    type="text"
                    value={image.altText}
                    placeholder="Descrição acessível da imagem"
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setImages((currentImages) =>
                        currentImages.map((currentImage, currentIndex) =>
                          currentIndex === index
                            ? { ...currentImage, altText: nextValue }
                            : currentImage,
                        ),
                      );
                    }}
                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={`${idPrefix}-image-order-${index}`}
                    className="text-sm font-semibold"
                  >
                    Ordem
                  </label>
                  <input
                    id={`${idPrefix}-image-order-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={image.displayOrder}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setImages((currentImages) =>
                        currentImages.map((currentImage, currentIndex) =>
                          currentIndex === index
                            ? { ...currentImage, displayOrder: nextValue }
                            : currentImage,
                        ),
                      );
                    }}
                    className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  />
                </div>
              </div>
                </div>
              </details>
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImagePreview({
  image,
  index,
}: {
  image: ProductImageFormValue;
  index: number;
}) {
  return (
    <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--champagne)]">
      <ImageWithFallback
        src={image.url || null}
        alt={image.altText || `Imagem ${index + 1}`}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function SubmitButton({
  disabled = false,
  idleLabel,
  pendingLabel,
}: {
  disabled?: boolean;
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center justify-center rounded-full bg-[var(--surface-contrast)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center justify-center rounded-full border border-[rgba(177,59,46,0.24)] bg-[rgba(177,59,46,0.08)] px-5 py-3 text-sm font-semibold text-[var(--danger)] transition hover:bg-[rgba(177,59,46,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Excluindo...' : 'Excluir produto'}
    </button>
  );
}

function FormMessage({ state }: FormMessageProps) {
  if (!state.message) {
    return <div className="min-h-5" />;
  }

  const tone =
    state.status === 'success'
      ? 'border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.08)] text-[var(--accent)]'
      : 'border-[rgba(177,59,46,0.18)] bg-[rgba(177,59,46,0.08)] text-[var(--danger)]';

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tone}`}>{state.message}</div>
  );
}

function buildInitialUpdateState(product: Product): ProductFormState {
  return {
    status: 'idle',
    fieldErrors: {},
    values: {
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId ?? '',
      code: product.code,
      slug: product.slug,
      title: product.title,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      price: product.price,
      images:
        product.images.length > 0
          ? product.images.map((image) => ({
              url: image.url,
              altText: image.altText ?? '',
              displayOrder: String(image.displayOrder),
              isPrimary: image.isPrimary,
            }))
          : [createEmptyProductImageFormValue()],
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      displayOrder: String(product.displayOrder),
    },
  };
}

function createEmptyProductImageFormValue(
  isPrimary = true,
  displayOrder = '0',
): ProductImageFormValue {
  return {
    url: '',
    altText: '',
    displayOrder,
    isPrimary,
  };
}

function hasProductImageContent(image: ProductImageFormValue) {
  return image.url.trim().length > 0 || image.altText.trim().length > 0;
}

function resolveImageUploadStatus(galleryUploadState: UploadFeedback | null) {
  if (galleryUploadState?.status === 'pending') {
    return 'pending';
  }

  if (galleryUploadState?.status === 'error') {
    return 'error';
  }

  if (galleryUploadState?.status === 'success') {
    return 'success';
  }

  return 'idle';
}

function slugifyProductTitle(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
