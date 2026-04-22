'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  createProductAction,
  deleteProductAction,
  initialProductDeleteState,
  initialProductFormState,
  updateProductAction,
  type ProductDeleteState,
  type ProductFormState,
} from '@/app/(admin)/admin/(protected)/products/actions';
import type { Category, Product, Subcategory } from '@/types/catalog/catalog.types';
import { formatCurrency } from '@/utils/formatters/currency';

type ProductManagementProps = {
  categories: Category[];
  canDelete: boolean;
  products: Product[];
  subcategories: Subcategory[];
};

type ProductEditorCardProps = {
  categories: Category[];
  canDelete: boolean;
  product: Product;
  subcategories: Subcategory[];
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

export function ProductManagement({
  categories,
  canDelete,
  products,
  subcategories,
}: ProductManagementProps) {
  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-6">
      <CreateProductCard categories={categories} subcategories={subcategories} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Produtos cadastrados</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Este modulo concentra o item principal do catalogo. O frontend cuida
              da experiencia de edicao, mas o backend continua validando codigo,
              slug e compatibilidade entre categoria e subcategoria.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">
              {products.length}
            </span>{' '}
            produtos
          </div>
        </div>

        {!hasCategories ? (
          <div className="rounded-[1.25rem] border border-[rgba(177,59,46,0.18)] bg-[rgba(177,59,46,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            Crie categorias antes de cadastrar produtos. Sem a hierarquia base, o
            catalogo fica estruturalmente inconsistente.
          </div>
        ) : null}

        {!canDelete ? (
          <div className="rounded-[1.25rem] border border-[rgba(183,121,31,0.18)] bg-[rgba(183,121,31,0.08)] px-4 py-3 text-sm text-[var(--warning)]">
            O seu perfil pode criar e editar produtos, mas a exclusao continua
            restrita a `super_admin`.
          </div>
        ) : null}

        {products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)] shadow-[var(--shadow-md)]">
            Nenhum produto foi encontrado. Use o formulario acima para iniciar a
            camada principal do catalogo administrativo.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductEditorCard
                key={product.id}
                categories={categories}
                canDelete={canDelete}
                product={product}
                subcategories={subcategories}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CreateProductCard({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: Subcategory[];
}) {
  const [state, formAction] = useActionState(
    createProductAction,
    initialProductFormState,
  );

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
    state.values.imageUrl,
    state.values.displayOrder,
    String(state.values.isFeatured),
    String(state.values.isActive),
  ].join(':');

  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Escrita administrativa
        </p>
        <h2 className="text-2xl font-semibold">Novo produto</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          O formulario abaixo segue o DTO do backend e prepara o painel para um
          CRUD de produto sem empurrar regra de negocio para a UI.
        </p>
      </div>

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
          <SubmitButton
            disabled={!hasCategories}
            idleLabel="Criar produto"
            pendingLabel="Criando..."
          />
        </div>
      </form>
    </section>
  );
}

function ProductEditorCard({
  categories,
  canDelete,
  product,
  subcategories,
}: ProductEditorCardProps) {
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
    updateState.values.imageUrl,
    updateState.values.displayOrder,
    String(updateState.values.isFeatured),
    String(updateState.values.isActive),
  ].join(':');

  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{product.title}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
              }`}
            >
              {product.isActive ? 'Ativo' : 'Inativo'}
            </span>
            {product.isFeatured ? (
              <span className="rounded-full bg-[rgba(183,121,31,0.15)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                Destaque
              </span>
            ) : null}
          </div>
          <p className="break-all text-sm text-[var(--muted)]">{product.slug}</p>
          <p className="text-sm text-[var(--muted)]">
            {product.category.name}
            {product.subcategory ? ` - ${product.subcategory.name}` : ''}
          </p>
        </div>

        <div className="space-y-2 text-right">
          <p className="text-lg font-semibold text-[var(--warning)]">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-[var(--muted)]">Codigo: {product.code}</p>
          <p className="text-sm text-[var(--muted)]">Ordem: {product.displayOrder}</p>
        </div>
      </div>

      <form key={formKey} action={updateFormAction} className="mt-5 space-y-5">
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
            <SubmitButton
              disabled={categories.length === 0}
              idleLabel="Salvar alteracoes"
              pendingLabel="Salvando..."
            />
          </div>
        </div>
      </form>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <form
          action={deleteFormAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Excluir produto
            </p>
            <p className="text-sm text-[var(--muted)]">
              O backend bloqueia a exclusao quando o produto ainda possui registros
              de venda ou itens de remessa relacionados.
            </p>
          </div>

          <DeleteButton disabled={!canDelete} />
        </form>

        <div className="mt-3">
          <FormMessage state={deleteState} />
        </div>
      </div>
    </article>
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

  const filteredSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === selectedCategoryId,
  );

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
          Subcategoria
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
          <option value="">Sem subcategoria</option>
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

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-code`} className="text-sm font-semibold">
          Codigo
        </label>
        <input
          id={`${idPrefix}-code`}
          name="code"
          type="text"
          defaultValue={state.values.code}
          placeholder="Ex.: ANEL-001"
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.code ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.code}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-slug`} className="text-sm font-semibold">
          Slug
        </label>
        <input
          id={`${idPrefix}-slug`}
          name="slug"
          type="text"
          defaultValue={state.values.slug}
          placeholder="ex.: anel-solitario-ouro"
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.slug ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.slug}</p>
        ) : null}
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor={`${idPrefix}-title`} className="text-sm font-semibold">
          Titulo
        </label>
        <input
          id={`${idPrefix}-title`}
          name="title"
          type="text"
          defaultValue={state.values.title}
          placeholder="Ex.: Anel Solitario Ouro 18k"
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
          Descricao curta
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
          Descricao completa
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
          Preco
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

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-imageUrl`} className="text-sm font-semibold">
          URL da imagem
        </label>
        <input
          id={`${idPrefix}-imageUrl`}
          name="imageUrl"
          type="url"
          defaultValue={state.values.imageUrl}
          placeholder="https://..."
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.imageUrl ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.imageUrl}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-displayOrder`} className="text-sm font-semibold">
          Ordem de exibicao
        </label>
        <input
          id={`${idPrefix}-displayOrder`}
          name="displayOrder"
          type="number"
          min="0"
          step="1"
          defaultValue={state.values.displayOrder}
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.displayOrder ? (
          <p className="text-sm text-[var(--danger)]">
            {state.fieldErrors.displayOrder}
          </p>
        ) : null}
      </div>

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
          <span className="font-medium">Produto ativo no catalogo</span>
        </label>
      </div>
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
      imageUrl: product.imageUrl ?? '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      displayOrder: String(product.displayOrder),
    },
  };
}
