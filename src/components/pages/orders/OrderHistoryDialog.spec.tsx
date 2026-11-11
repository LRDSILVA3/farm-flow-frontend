import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderHistoryDialog } from "./OrderHistoryDialog";
import { Order } from "@/hooks/useOrders";
import { api } from "@/services/api";

vi.mock("@/services/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

const sampleOrder: Order = {
  id: "ord-12345678",
  clientId: "cli-1",
  client: { id: "cli-1", name: "Fazendeiro João" },
  farmId: "frm-1",
  farm: { id: "frm-1", name: "Fazenda Esperança" },
  type: "Mapeamento",
  serviceName: "Mapeamento com Drone",
  area: "75",
  value: "R$ 1.500,00",
  numericValue: 1500,
  status: "Concluído",
  payment: "Aguardando",
  executions: [],
  schedules: [],
  payments: [],
  logs: [
    {
      id: "log-1",
      action: "Criação",
      timestamp: "2026-11-10T10:00:00.000Z",
      userName: "Admin",
      details: "Pedido criado no sistema.",
    },
    {
      id: "log-2",
      action: "Edição",
      timestamp: "2026-11-10T11:15:00.000Z",
      userId: "usr-2",
      userName: "Maria Gestora",
      details: "Pedido editado: Área: 50 → 75 | Valor Total: R$ 1.000,00 → R$ 1.500,00",
      changes: [
        { field: "area", label: "Área", before: 50, after: 75 },
        { field: "value", label: "Valor Total", before: "R$ 1.000,00", after: "R$ 1.500,00" },
      ],
    },
    {
      id: "log-3",
      action: "Conclusão",
      timestamp: "2026-11-10T14:00:00.000Z",
      userName: "Carlos Piloto",
      details: "Serviço concluído em campo.",
    },
  ],
  executedArea: 75,
  paidAmount: 0,
  createdAt: "2026-11-10T10:00:00.000Z",
};

const renderDialog = (props: { open: boolean; order: Order | null }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <OrderHistoryDialog open={props.open} onOpenChange={vi.fn()} order={props.order} />
    </QueryClientProvider>
  );
};

describe("OrderHistoryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue([
      {
        id: "aud-ord-1",
        user_name: "Maria Gestora",
        user_email: "maria@farmflow.com",
        user_role: "Gerente",
        module: "orders",
        action: "UPDATE",
        entity_id: "ord-12345678",
        summary: "Área: 50 → 75",
        changes: [{ field: "area", label: "Área", before: 50, after: 75 }],
        ip_address: "10.0.0.15",
        created_at: "2026-11-10T11:15:00.000Z",
      },
      {
        id: "aud-ord-2",
        user_name: "Admin",
        user_email: "admin@farmflow.com",
        user_role: "admin",
        module: "orders",
        action: "CREATE",
        entity_id: "ord-12345678",
        summary: "Pedido criado.",
        changes: [],
        ip_address: "10.0.0.10",
        created_at: "2026-11-10T10:00:00.000Z",
      },
    ]);
  });

  it("renders timeline with action badges, responsible users, and Before -> After field diffs", async () => {
    renderDialog({ open: true, order: sampleOrder });

    expect(await screen.findByText("Histórico de Ações do Pedido")).toBeInTheDocument();
    expect(screen.getByText("Fazendeiro João")).toBeInTheDocument();
    expect(screen.getByText("Fazenda Esperança")).toBeInTheDocument();
    expect(screen.getByText(/Linha do Tempo \(3\)/i)).toBeInTheDocument();

    expect(screen.getByText("Criação")).toBeInTheDocument();
    expect(screen.getByText("Edição")).toBeInTheDocument();
    expect(screen.getByText("Conclusão")).toBeInTheDocument();
    expect(screen.getByText("Maria Gestora")).toBeInTheDocument();
    expect(screen.getByText("Carlos Piloto")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.000,00")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/audit-logs/entity/orders/ord-12345678");
    });
  });

  it("switches to Auditoria do Servidor tab and displays immutable server audit logs", async () => {
    const user = userEvent.setup();
    renderDialog({ open: true, order: sampleOrder });

    const serverTab = await screen.findByRole("tab", {
      name: /Auditoria do Servidor \(2\)/i,
    });
    await user.click(serverTab);

    expect(await screen.findByText("maria@farmflow.com")).toBeInTheDocument();
    expect(screen.getByText("IP: 10.0.0.15")).toBeInTheDocument();
    expect(screen.getByText("(Gerente)")).toBeInTheDocument();
    expect(screen.getByText("Pedido criado.")).toBeInTheDocument();
  });

  it("does not query server audit endpoint when dialog is closed", () => {
    renderDialog({ open: false, order: sampleOrder });
    expect(api.get).not.toHaveBeenCalled();
  });
});

