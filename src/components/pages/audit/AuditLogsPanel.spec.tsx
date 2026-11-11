import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditLogsPanel, AuditLogItem } from "./AuditLogsPanel";
import { api } from "@/services/api";

vi.mock("@/services/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

const sampleLogs: AuditLogItem[] = [
  {
    id: "aud-1",
    user_id: "usr-1",
    user_name: "Maria Gestora",
    user_email: "maria@farmflow.com",
    user_role: "admin",
    module: "orders",
    action: "UPDATE",
    entity_id: "ord-12345678",
    entity_label: "Pedido • João • Fazenda Boa Vista",
    summary: "Área (ha): 100 → 140 | Valor Total: 5000 → 7000",
    changes: [
      { field: "area", label: "Área (ha)", before: 100, after: 140 },
      { field: "value", label: "Valor Total", before: 5000, after: 7000 },
    ],
    before_data: { id: "ord-12345678", area: 100, value: 5000 },
    after_data: { id: "ord-12345678", area: 140, value: 7000 },
    ip_address: "192.168.1.50",
    created_at: "2026-11-10T14:30:00.000Z",
  },
  {
    id: "aud-2",
    user_id: "usr-1",
    user_name: "Administrador FarmFlow",
    user_email: "admin@farmflow.com",
    user_role: "admin",
    module: "sessions",
    action: "LOGIN",
    entity_id: "usr-1",
    entity_label: "Administrador FarmFlow (admin@farmflow.com)",
    summary: "Login efetuado com sucesso no sistema.",
    changes: [],
    ip_address: "127.0.0.1",
    created_at: "2026-11-10T14:00:00.000Z",
  },
];

const renderWithQuery = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AuditLogsPanel />
    </QueryClientProvider>
  );
};

describe("AuditLogsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      items: sampleLogs,
      total: sampleLogs.length,
      page: 1,
      totalPages: 1,
    });
  });

  it("renders audit logs with user, module, action badge and Antes -> Depois diff badges", async () => {
    renderWithQuery();

    expect(await screen.findByText("Auditoria Global do Sistema")).toBeInTheDocument();
    expect((await screen.findAllByText("Maria Gestora")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pedido • João • Fazenda Boa Vista").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Edição").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Autenticação / Login").length).toBeGreaterThan(0);
    expect(screen.getByText(/Mostrando 1 a 2 de 2 registro\(s\)/i)).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining("/audit-logs?"));
  });

  it("updates query when searching and clears filters cleanly", async () => {
    renderWithQuery();
    await screen.findAllByText("Maria Gestora");

    const searchInput = screen.getByPlaceholderText("Usuário, resumo, registro...");
    fireEvent.change(searchInput, { target: { value: "Boa Vista" } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining("search=Boa+Vista"));
    });

    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    await waitFor(() => {
      expect((searchInput as HTMLInputElement).value).toBe("");
    });
  });

  it("opens audit event detail dialog with full changes table and before/after snapshots", async () => {
    const user = userEvent.setup();
    renderWithQuery();
    await screen.findAllByText("Maria Gestora");

    const detailButtons = screen.getAllByRole("button", {
      name: "Visualizar detalhes da auditoria",
    });
    await user.click(detailButtons[0]);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detalhes do Evento de Auditoria")).toBeInTheDocument();
    expect(screen.getByText("Campos Alterados (Antes → Depois)")).toBeInTheDocument();
    expect(screen.getByText("Snapshot Antes")).toBeInTheDocument();
    expect(screen.getByText("Snapshot Depois")).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.50/)).toBeInTheDocument();
    expect(screen.getByText("140")).toBeInTheDocument();
  });

  it("renders empty state when backend returns zero audit records", async () => {
    (api.get as any).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });

    renderWithQuery();

    expect(
      await screen.findByText("Nenhum registro de auditoria encontrado para os filtros atuais.")
    ).toBeInTheDocument();
  });
});
