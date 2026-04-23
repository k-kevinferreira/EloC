'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryDeleteState,
  type CategoryFormState,
} from '@/app/(admin)/admin/(protected)/categories/actions';
import type { Category } from '@/types/catalog/catalog.types';

type CategoryManagementProps = {
  categories: Category[];
  canDelete: boolean;
};

type CategoryEditorCardProps = {
  canDelete: boolean;
  category: Category;
};

type FormMessageProps = {
  state: CategoryFormState | CategoryDeleteState;
};

const initialCategoryFormState: CategoryFormState = {
  status: 'idle',
  fieldErrors: {},
  values: {
    name: '',
    slug: '',
    displayOrder: '0',
    isActive: true,
  },
};

const initialCategoryDeleteState: CategoryDeleteState = {
  status: 'idle',
};

export function CategoryManagement({
  categories,
  canDelete,
}: CategoryManagementProps) {
  return (
    <div className="space-y-6">
      <CreateCategoryCard />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Categorias cadastradas</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Edite nome, slug, status e ordem diretamente no painel. A exclusao
              continua condicionada ao papel administrativo e a integridade
              relacional definida no backend.
            </p>
          </div>

          <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">
              {categories.length}
            </span>{' '}
            categorias
          </div>
        </div>

        {!canDelete ? (
          <div className="rounded-[1.25rem] border border-[rgba(183,121,31,0.18)] bg-[rgba(183,121,31,0.08)] px-4 py-3 text-sm text-[var(--warning)]">
            O seu perfil pode criar e editar categorias, mas a exclusao continua
            restrita a `super_admin`.
          </div>
        ) : null}

        {categories.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)] shadow-[var(--shadow-md)]">
            Nenhuma categoria foi encontrada. Use o formulario acima para iniciar o
            catalogo administrativo.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {categories.map((category) => (
              <CategoryEditorCard
                key={category.id}
                category={category}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CreateCategoryCard() {
  const [state, formAction] = useActionState(
    createCategoryAction,
    initialCategoryFormState,
  );

  const formKey = [
    state.status,
    state.message ?? '',
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
        <h2 className="text-2xl font-semibold">Nova categoria</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Este formulario segue o contrato do backend e valida apenas o necessario
          para evitar payloads inconsistentes antes do envio.
        </p>
      </div>

      <form key={formKey} action={formAction} className="mt-6 space-y-5">
        <CategoryFormFields idPrefix="create-category" state={state} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FormMessage state={state} />
          <SubmitButton idleLabel="Criar categoria" pendingLabel="Criando..." />
        </div>
      </form>
    </section>
  );
}

function CategoryEditorCard({
  canDelete,
  category,
}: CategoryEditorCardProps) {
  const updateAction = updateCategoryAction.bind(null, category.id);
  const deleteAction = deleteCategoryAction.bind(null, category.id);

  const [updateState, updateFormAction] = useActionState(
    updateAction,
    buildInitialUpdateState(category),
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialCategoryDeleteState,
  );

  const formKey = [
    category.id,
    category.updatedAt,
    updateState.status,
    updateState.message ?? '',
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
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                category.isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'bg-[rgba(177,59,46,0.12)] text-[var(--danger)]'
              }`}
            >
              {category.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <p className="break-all text-sm text-[var(--muted)]">{category.slug}</p>
        </div>

        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Ordem {category.displayOrder}
        </div>
      </div>

      <form key={formKey} action={updateFormAction} className="mt-5 space-y-5">
        <CategoryFormFields idPrefix={`category-${category.id}`} state={updateState} />

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FormMessage state={updateState} />
            <SubmitButton idleLabel="Salvar alteracoes" pendingLabel="Salvando..." />
          </div>
        </div>
      </form>

      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <form action={deleteFormAction} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Excluir categoria
            </p>
            <p className="text-sm text-[var(--muted)]">
              O backend bloqueia a exclusao se ainda existirem subcategorias ou
              produtos relacionados.
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

function CategoryFormFields({
  idPrefix,
  state,
}: {
  idPrefix: string;
  state: CategoryFormState;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-name`} className="text-sm font-semibold">
          Nome
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Ex.: Aneis"
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
          placeholder="ex.: aneis"
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
        <span className="font-medium">Categoria ativa no catalogo</span>
      </label>
    </div>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
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
      {pending ? 'Excluindo...' : 'Excluir categoria'}
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

function buildInitialUpdateState(category: Category): CategoryFormState {
  return {
    status: 'idle',
    fieldErrors: {},
    values: {
      name: category.name,
      slug: category.slug,
      displayOrder: String(category.displayOrder),
      isActive: category.isActive,
    },
  };
}
