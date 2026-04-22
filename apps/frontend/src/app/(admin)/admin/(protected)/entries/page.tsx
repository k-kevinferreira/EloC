import { ModulePlaceholder } from '@/components/admin/module-placeholder';

export default function AdminEntriesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Financas"
      title="Entradas ainda dependem de contrato no backend"
      description="O modulo financeiro sera implementado depois que os contratos de entries forem definidos no NestJS. O shell administrativo ja esta pronto para receber essas telas sem reestruturacao."
    />
  );
}
