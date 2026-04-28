'use client';

import { Fragment, useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  createEntryAction,
  deleteEntryAction,
  updateEntryAction,
  type EntryDeleteState,
  type EntryFormState,
} from '@/app/(admin)/admin/(protected)/entries/actions';
import {
  createExpenseAction,
  deleteExpenseAction,
  type ExpenseDeleteState,
  type ExpenseFormState,
} from '@/app/(admin)/admin/(protected)/expenses/actions';
import {
  createShipmentAction,
  deleteShipmentAction,
  type ShipmentDeleteState,
  type ShipmentFormState,
  type ShipmentItemFormValue,
} from '@/app/(admin)/admin/(protected)/shipments/actions';
import type { Product } from '@/types/catalog/catalog.types';
import type { Expense, SaleEntry, Shipment } from '@/types/operations/operations.types';
import { formatCurrency } from '@/utils/formatters/currency';

type EntryManagementProps = {
  canDelete: boolean;
  entries: SaleEntry[];
  products: Product[];
};

type ExpenseManagementProps = {
  canDelete: boolean;
  expenses: Expense[];
  shipments: Shipment[];
};

type ShipmentManagementProps = {
  canDelete: boolean;
  products: Product[];
  shipments: Shipment[];
};

type ActiveEntryForm = string | null;

const today = new Date().toISOString().slice(0, 10);
const nowForInput = new Date().toISOString().slice(0, 16);

const initialEntryFormState: EntryFormState = {
  status: 'idle',
  values: {
    productId: '',
    quantity: '1',
    unitPrice: '',
    paymentMethod: 'pix',
    status: 'paid',
    customerName: '',
    notes: '',
    soldAt: nowForInput,
  },
};

const initialExpenseFormState: ExpenseFormState = {
  status: 'idle',
  values: {
    type: '',
    description: '',
    amount: '',
    expenseDate: today,
  },
};

const initialShipmentFormState: ShipmentFormState = {
  status: 'idle',
  values: {
    code: '',
    supplier: '',
    shipmentDate: today,
    notes: '',
    items: [createEmptyShipmentItem()],
  },
};

const initialDeleteState = {
  status: 'idle',
} as const;

export function EntryManagement({ canDelete, entries, products }: EntryManagementProps) {
  const [state, formAction] = useActionState(createEntryAction, initialEntryFormState);
  const [activeEntryForm, setActiveEntryForm] = useState<ActiveEntryForm>(null);
  const hasProducts = products.length > 0;

  return (
    <div className="space-y-6">
      <AdminFormShell
        title="Nova entrada"
        description="Registre vendas manuais vinculadas aos produtos do catalogo. O total e calculado no backend."
      >
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Produto"
            name="productId"
            defaultValue={state.values.productId}
            disabled={!hasProducts}
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} - {formatCurrency(product.price)}
              </option>
            ))}
          </SelectField>
          <TextField label="Quantidade" name="quantity" type="number" min="1" defaultValue={state.values.quantity} />
          <TextField label="Valor unitario" name="unitPrice" inputMode="decimal" defaultValue={state.values.unitPrice} />
          <TextField label="Forma de pagamento" name="paymentMethod" defaultValue={state.values.paymentMethod} />
          <EntryStatusSelect defaultValue={state.values.status} />
          <TextField label="Data da venda" name="soldAt" type="datetime-local" defaultValue={state.values.soldAt} />
          <TextField label="Cliente" name="customerName" defaultValue={state.values.customerName} />
          <TextareaField label="Observacoes" name="notes" defaultValue={state.values.notes} />
          <FormFooter state={state} submitLabel="Registrar entrada" pendingLabel="Registrando..." disabled={!hasProducts} />
        </form>
      </AdminFormShell>

      <ListShell emptyMessage="Nenhuma entrada registrada." title="Entradas registradas">
        {entries.map((entry) => (
          <Fragment key={entry.id}>
            <FinancialListItem
              title={entry.product.title}
              detail={`${entry.quantity} x ${formatCurrency(entry.unitPrice)} - ${entry.paymentMethod}`}
              amount={entry.totalAmount}
              date={entry.soldAt}
              status={formatEntryStatus(entry.status)}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() =>
                    setActiveEntryForm((currentEntryId) =>
                      currentEntryId === entry.id ? null : entry.id,
                    )
                  }
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {activeEntryForm === entry.id ? 'Fechar' : 'Editar'}
                </button>
                <EntryDeleteForm canDelete={canDelete} entryId={entry.id} />
              </div>
            </FinancialListItem>
            {activeEntryForm === entry.id ? (
              <EntryEditForm entry={entry} products={products} />
            ) : null}
          </Fragment>
        ))}
      </ListShell>
    </div>
  );
}

export function ExpenseManagement({
  canDelete,
  expenses,
}: ExpenseManagementProps) {
  const [state, formAction] = useActionState(
    createExpenseAction,
    initialExpenseFormState,
  );

  return (
    <div className="space-y-6">
      <AdminFormShell
        title="Nova despesa"
        description="Registre custos operacionais e, quando fizer sentido, vincule a despesa a uma remessa."
      >
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <TextField label="Despesa" name="description" defaultValue={state.values.description} />
          <TextField label="Tipo" name="type" defaultValue={state.values.type} placeholder="ex.: frete" />
          <TextField label="Valor" name="amount" inputMode="decimal" defaultValue={state.values.amount} />
          <TextField label="Data" name="expenseDate" type="date" defaultValue={state.values.expenseDate} />
          <FormFooter state={state} submitLabel="Registrar despesa" pendingLabel="Registrando..." />
        </form>
      </AdminFormShell>

      <ListShell emptyMessage="Nenhuma despesa registrada." title="Despesas registradas">
        {expenses.map((expense) => (
          <FinancialListItem
            key={expense.id}
            title={expense.description}
            detail={`${expense.type}${expense.shipment ? ` - ${expense.shipment.code}` : ''}`}
            amount={expense.amount}
            date={expense.expenseDate}
            dateOnly
          >
            <ExpenseDeleteForm canDelete={canDelete} expenseId={expense.id} />
          </FinancialListItem>
        ))}
      </ListShell>
    </div>
  );
}

export function ShipmentManagement({
  canDelete,
  products,
  shipments,
}: ShipmentManagementProps) {
  const [state, formAction] = useActionState(
    createShipmentAction,
    initialShipmentFormState,
  );
  const [item, setItem] = useState(state.values.items[0] ?? createEmptyShipmentItem());
  const [productSearch, setProductSearch] = useState('');
  const hasProducts = products.length > 0;
  const selectedShipmentProduct = products.find(
    (product) => product.id === item.productId,
  );

  return (
    <div className="space-y-6">
      <AdminFormShell
        title="Nova remessa"
        description="Registre compras de fornecedor com itens vinculados a produtos. Custos totais sao calculados no backend."
      >
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <TextField label="Codigo" name="code" defaultValue={state.values.code} />
          <TextField label="Fornecedor" name="supplier" defaultValue={state.values.supplier} />
          <TextField label="Data da remessa" name="shipmentDate" type="date" defaultValue={state.values.shipmentDate} />
          <TextareaField label="Observacoes" name="notes" defaultValue={state.values.notes} />

          <input type="hidden" name="items" value={JSON.stringify([item])} />
          <div className="space-y-3 md:col-span-2">
            <p className="text-sm font-semibold">Item da remessa</p>
            <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-3 md:grid-cols-[minmax(0,1fr)_120px] md:items-end">
              <ProductTextInput
                label="Produto"
                listId="shipment-product-options"
                value={productSearch || formatProductOptionLabel(selectedShipmentProduct)}
                products={products}
                disabled={!hasProducts}
                onChange={(value) =>
                  handleShipmentProductInput(value, products, setProductSearch, setItem)
                }
              />
              <ControlledTextField
                label="Qtd."
                type="number"
                min="1"
                value={item.quantity}
                onChange={(value) =>
                  setItem((currentItem) => ({ ...currentItem, quantity: value }))
                }
              />
            </div>
          </div>

          <FormFooter state={state} submitLabel="Registrar remessa" pendingLabel="Registrando..." disabled={!hasProducts} />
        </form>
      </AdminFormShell>

      <ListShell emptyMessage="Nenhuma remessa registrada." title="Remessas registradas">
        {shipments.map((shipment) => (
          <FinancialListItem
            key={shipment.id}
            title={`${shipment.code} - ${shipment.supplier}`}
            detail={`${shipment.items.length} itens - ${shipment.expenses.length} despesas vinculadas`}
            amount={shipment.totalCost}
            date={shipment.shipmentDate}
            dateOnly
          >
            <ShipmentDeleteForm canDelete={canDelete} shipmentId={shipment.id} />
          </FinancialListItem>
        ))}
      </ListShell>
    </div>
  );
}

function AdminFormShell({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ListShell({
  children,
  emptyMessage,
  title,
}: {
  children: React.ReactNode;
  emptyMessage: string;
  title: string;
}) {
  const isEmpty = Array.isArray(children) && children.length === 0;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {isEmpty ? (
        <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)] shadow-[var(--shadow-md)]">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
          {children}
        </div>
      )}
    </section>
  );
}

function FinancialListItem({
  amount,
  children,
  date,
  dateOnly = false,
  detail,
  status,
  title,
}: {
  amount: string;
  children: React.ReactNode;
  date: string;
  dateOnly?: boolean;
  detail: string;
  status?: string;
  title: string;
}) {
  return (
    <article className="grid gap-4 border-b border-[var(--border)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold">{title}</h3>
          {status ? <StatusBadge>{status}</StatusBadge> : null}
        </div>
        <p className="break-words text-sm text-[var(--muted)]">{detail}</p>
        <p className="text-xs text-[var(--muted)]">{formatDate(date, dateOnly)}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end">
        <span className="text-sm font-semibold text-[var(--warning)]">
          {formatCurrency(amount)}
        </span>
        {children}
      </div>
    </article>
  );
}

function TextField(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;

  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input
        {...inputProps}
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function ControlledTextField({
  label,
  onChange,
  value,
  ...inputProps
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input
        {...inputProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}

function ProductTextInput({
  disabled,
  label,
  listId,
  onChange,
  products,
  value,
}: {
  disabled?: boolean;
  label: string;
  listId: string;
  onChange: (value: string) => void;
  products: Product[];
  value: string;
}) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <input
        type="text"
        list={listId}
        value={value}
        disabled={disabled}
        placeholder="Digite o nome ou codigo do produto"
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      />
      <datalist id={listId}>
        {products.map((product) => (
          <option key={product.id} value={formatProductOptionLabel(product)} />
        ))}
      </datalist>
    </label>
  );
}

function TextareaField({
  label,
  ...textareaProps
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold md:col-span-2">
      <span>{label}</span>
      <textarea
        {...textareaProps}
        rows={3}
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  );
}

function SelectField({
  children,
  label,
  onChange,
  value,
  ...selectProps
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <select
        {...selectProps}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 font-normal outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}

function FormFooter({
  disabled = false,
  pendingLabel,
  state,
  submitLabel,
}: {
  disabled?: boolean;
  pendingLabel: string;
  state: { status: 'idle' | 'success' | 'error'; message?: string };
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
      <FormMessage state={state} />
      <SubmitButton disabled={disabled} idleLabel={submitLabel} pendingLabel={pendingLabel} />
    </div>
  );
}

function SubmitButton({
  disabled,
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

function FormMessage({
  state,
}: {
  state: { status: 'idle' | 'success' | 'error'; message?: string };
}) {
  if (!state.message) {
    return <div className="min-h-5" />;
  }

  const tone =
    state.status === 'success'
      ? 'border-[rgba(15,118,110,0.18)] bg-[rgba(15,118,110,0.08)] text-[var(--accent)]'
      : 'border-[rgba(177,59,46,0.18)] bg-[rgba(177,59,46,0.08)] text-[var(--danger)]';

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tone}`}>
      {state.message}
    </div>
  );
}

function EntryDeleteForm({ canDelete, entryId }: { canDelete: boolean; entryId: string }) {
  const deleteAction = deleteEntryAction.bind(null, entryId);
  const [state, formAction] = useActionState<EntryDeleteState, FormData>(
    deleteAction,
    initialDeleteState,
  );

  return <DeleteForm canDelete={canDelete} formAction={formAction} state={state} />;
}

function EntryEditForm({ entry, products }: { entry: SaleEntry; products: Product[] }) {
  const updateAction = updateEntryAction.bind(null, entry.id);
  const [state, formAction] = useActionState(
    updateAction,
    buildEntryFormState(entry),
  );

  return (
    <form
      action={formAction}
      className="grid gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] p-4 md:grid-cols-2"
    >
      <SelectField label="Produto" name="productId" defaultValue={state.values.productId}>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.title} - {formatCurrency(product.price)}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Quantidade"
        name="quantity"
        type="number"
        min="1"
        defaultValue={state.values.quantity}
      />
      <TextField
        label="Valor unitario"
        name="unitPrice"
        inputMode="decimal"
        defaultValue={state.values.unitPrice}
      />
      <TextField
        label="Forma de pagamento"
        name="paymentMethod"
        defaultValue={state.values.paymentMethod}
      />
      <EntryStatusSelect defaultValue={state.values.status} />
      <TextField
        label="Data da venda"
        name="soldAt"
        type="datetime-local"
        defaultValue={state.values.soldAt}
      />
      <TextField
        label="Cliente"
        name="customerName"
        defaultValue={state.values.customerName}
      />
      <TextareaField label="Observacoes" name="notes" defaultValue={state.values.notes} />
      <FormFooter
        state={state}
        submitLabel="Salvar entrada"
        pendingLabel="Salvando..."
      />
    </form>
  );
}

function ExpenseDeleteForm({
  canDelete,
  expenseId,
}: {
  canDelete: boolean;
  expenseId: string;
}) {
  const deleteAction = deleteExpenseAction.bind(null, expenseId);
  const [state, formAction] = useActionState<ExpenseDeleteState, FormData>(
    deleteAction,
    initialDeleteState,
  );

  return <DeleteForm canDelete={canDelete} formAction={formAction} state={state} />;
}

function ShipmentDeleteForm({
  canDelete,
  shipmentId,
}: {
  canDelete: boolean;
  shipmentId: string;
}) {
  const deleteAction = deleteShipmentAction.bind(null, shipmentId);
  const [state, formAction] = useActionState<ShipmentDeleteState, FormData>(
    deleteAction,
    initialDeleteState,
  );

  return <DeleteForm canDelete={canDelete} formAction={formAction} state={state} />;
}

function DeleteForm({
  canDelete,
  formAction,
  state,
}: {
  canDelete: boolean;
  formAction: (formData: FormData) => void;
  state: { status: 'idle' | 'success' | 'error'; message?: string };
}) {
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={!canDelete || pending}
        className="inline-flex items-center justify-center rounded-full border border-[rgba(177,59,46,0.24)] bg-[rgba(177,59,46,0.08)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:bg-[rgba(177,59,46,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Removendo...' : 'Remover'}
      </button>
      {state.message ? <FormMessage state={state} /> : null}
    </form>
  );
}

function EntryStatusSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <SelectField label="Status" name="status" defaultValue={defaultValue}>
      <option value="paid">Pago</option>
      <option value="pending">Pendente</option>
      <option value="installment">Parcelado</option>
    </SelectField>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
      {children}
    </span>
  );
}

function createEmptyShipmentItem(): ShipmentItemFormValue {
  return {
    productId: '',
    quantity: '1',
  };
}

function handleShipmentProductInput(
  value: string,
  products: Product[],
  setProductSearch: React.Dispatch<React.SetStateAction<string>>,
  setItem: React.Dispatch<React.SetStateAction<ShipmentItemFormValue>>,
) {
  setProductSearch(value);

  const matchedProduct = products.find((product) => {
    return formatProductOptionLabel(product).toLowerCase() === value.trim().toLowerCase();
  });

  setItem((currentItem) => ({
    ...currentItem,
    productId: matchedProduct?.id ?? '',
  }));
}

function formatProductOptionLabel(product: Product | undefined) {
  if (!product) {
    return '';
  }

  return `${product.title} (${product.code})`;
}

function formatDate(value: string, dateOnly = false) {
  if (dateOnly) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
    }).format(new Date(year, month - 1, day));
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(new Date(value));
}

function formatEntryStatus(status: string) {
  const statusLabels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    installment: 'Parcelado',
  };

  return statusLabels[status] ?? status;
}

function buildEntryFormState(entry: SaleEntry): EntryFormState {
  return {
    status: 'idle',
    values: {
      productId: entry.productId,
      quantity: String(entry.quantity),
      unitPrice: entry.unitPrice,
      paymentMethod: entry.paymentMethod,
      status: entry.status,
      customerName: entry.customerName ?? '',
      notes: entry.notes ?? '',
      soldAt: toDateTimeLocalValue(entry.soldAt),
    },
  };
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}
