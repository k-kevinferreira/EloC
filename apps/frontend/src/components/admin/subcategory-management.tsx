'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  createSubcategoryAction,
  deleteSubcategoryAction,
  updateSubcategoryAction,
  type SubcategoryDeleteState,
  type SubcategoryFormState,
} from '@/app/(admin)/admin/(protected)/subcategories/actions';
import type { Category, Subcategory } from '@/types/catalog/catalog.types';

type SubcategoryManagementProps = {
  categories: Category[];
  canDelete: boolean;
  subcategories: Subcategory[];
};

type SubcategoryEditorCardProps = {
  categories: Category[];
  canDelete: boolean;
  subcategory: Subcategory;
};

type FormMessageProps = {
  state: SubcategoryFormState | SubcategoryDeleteState;
};

const initialSubcategoryFormState: SubcategoryFormState = {
  status: 'idle',
  fieldErrors: {},
  values: {
    categoryId: '',
    name: '',
    slug: '',
    displayOrder: '0',
    isActive: true,
  },
};

const initialSubcategoryDeleteState: SubcategoryDeleteState = {
  status: 'idle',
};

export function SubcategoryManagement({
  categories,
  canDelete,
  subcategories,
}: SubcategoryManagementProps) {
  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-6">
      <CreateSubcategoryCard categories={categories} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Subcategorias cadastradas</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Aqui o frontend administra a relacao entre categoria pai, slug e
              ordenacao, enquanto a API segue protegendo unicidade por categoria e
              integridade com produtos.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">
              {subcategories.length}
            </span>{' '}
            subcategorias
          </div>
        </div>

        {!hasCategories ? (
          <div className="rounded-[1.25rem] border border-[rgba(177,59,46,0.18)] bg-[rgba(177,59,46,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            Crie ao menos uma categoria antes de cadastrar subcategorias. Sem esse
            relacionamento, o modulo nao possui integridade semantica.
          </div>
        ) : null}

        {!canDelete ? (
          <div className="rounded-[1.25rem] border border-[rgba(183,121,31,0.18)] bg-[rgba(183,121,31,0.08)] px-4 py-3 text-sm text-[var(--warning)]">
            O seu perfil pode criar e editar subcategorias, mas a exclusao continua
            restrita a `super_admin`.
          </div>
        ) : null}

        {subcategories.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)] shadow-[var(--shadow-md)]">
            Nenhuma subcategoria foi encontrada. Use o formulario acima para
            estruturar o catalogo abaixo das categorias principais.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {subcategories.map((subcategory) => (
              <SubcategoryEditorCard
                key={subcategory.id}
                categories={categories}
                canDelete={canDelete}
                subcategory={subcategory}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CreateSubcategoryCard({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(
    createSubcategoryAction,
    initialSubcategoryFormState,
  );

  const hasCategories = categories.length > 0;
  const formKey = [
    state.status,
    state.message ?? '',
    state.values.categoryId,
    state.values.name,
    state.values.slug,
    state.values.displayOrder,
    String(state.values.isActive),
  ].join(':');

  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Escrita administrativa
        </p>
        <h2 className="text-2xl font-semibold">Nova subcategoria</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          O cadastro exige categoria pai porque o contrato do backend garante slug
          unico por categoria, e nao globalmente em todo o catalogo.
        </p>
      </div>

      <form key={formKey} action={formAction} className="mt-6 space-y-5">
        <SubcategoryFormFields
          categories={categories}
          idPrefix="create-subcategory"
          isCategorySelectionDisabled={!hasCategories}
          state={state}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FormMessage state={state} />
          <SubmitButton
            disabled={!hasCategories}
            idleLabel="Criar subcategoria"
            pendingLabel="Criando..."
          />
        </div>
      </form>
    </section>
  );
}

function SubcategoryEditorCard({
  categories,
  canDelete,
  subcategory,
}: SubcategoryEditorCardProps) {
  const updateAction = updateSubcategoryAction.bind(null, subcategory.id);
  const deleteAction = deleteSubcategoryAction.bind(null, subcategory.id);

  const [updateState, updateFormAction] = useActionState(
    updateAction,
    buildInitialUpdateState(subcategory),
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialSubcategoryDeleteState,
  );

  const formKey = [
    subcategory.id,
    subcategory.updatedAt,
    updateState.status,
    updateState.message ?? '',
    updateState.values.categoryId,
    updateState.values.name,
    updateState.values.slug,
    updateState.values.displayOrder,
    String(updateState.values.isActive),
  ].join(':');

  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{subcategory.name}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                subcategory.isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
              }`}
            >
              {subcategory.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Categoria pai: {subcategory.category.name}
          </p>
          <p className="break-all text-sm text-[var(--muted)]">{subcategory.slug}</p>
        </div>

        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Ordem {subcategory.displayOrder}
        </div>
      </div>

      <form key={formKey} action={updateFormAction} className="mt-5 space-y-5">
        <SubcategoryFormFields
          categories={categories}
          idPrefix={`subcategory-${subcategory.id}`}
          isCategorySelectionDisabled={categories.length === 0}
          state={updateState}
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
              Excluir subcategoria
            </p>
            <p className="text-sm text-[var(--muted)]">
              O backend bloqueia a exclusao quando ainda existem produtos
              vinculados a esta subcategoria.
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

function SubcategoryFormFields({
  categories,
  idPrefix,
  isCategorySelectionDisabled,
  state,
}: {
  categories: Category[];
  idPrefix: string;
  isCategorySelectionDisabled: boolean;
  state: SubcategoryFormState;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor={`${idPrefix}-categoryId`} className="text-sm font-semibold">
          Categoria pai
        </label>
        <select
          id={`${idPrefix}-categoryId`}
          name="categoryId"
          defaultValue={state.values.categoryId}
          disabled={isCategorySelectionDisabled}
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
        <label htmlFor={`${idPrefix}-name`} className="text-sm font-semibold">
          Nome
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Ex.: Solitarios"
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.name ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.name}</p>
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
          placeholder="ex.: solitarios"
          className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
        />
        {state.fieldErrors.slug ? (
          <p className="text-sm text-[var(--danger)]">{state.fieldErrors.slug}</p>
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

      <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={state.values.isActive}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <span className="font-medium">Subcategoria ativa no catalogo</span>
      </label>
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
      {pending ? 'Excluindo...' : 'Excluir subcategoria'}
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

function buildInitialUpdateState(subcategory: Subcategory): SubcategoryFormState {
  return {
    status: 'idle',
    fieldErrors: {},
    values: {
      categoryId: subcategory.categoryId,
      name: subcategory.name,
      slug: subcategory.slug,
      displayOrder: String(subcategory.displayOrder),
      isActive: subcategory.isActive,
    },
  };
}
