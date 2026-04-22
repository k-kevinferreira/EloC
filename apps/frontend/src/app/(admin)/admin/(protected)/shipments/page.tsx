import { ModulePlaceholder } from '@/components/admin/module-placeholder';

export default function AdminShipmentsPage() {
  return (
    <ModulePlaceholder
      eyebrow="Operacao"
      title="Remessas aguardam runtime proprio no backend"
      description="A estrutura de navegacao e layout ja suporta o modulo, mas shipment e shipment_items ainda dependem da camada de services, DTOs e endpoints antes do CRUD administrativo."
    />
  );
}
