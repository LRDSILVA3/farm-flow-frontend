import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersSection } from "./UsersSection";
import { api } from "@/services/api";

vi.mock("@/services/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {},
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "usr-admin", name: "Admin", email: "admin@farmflow.com", role: "Administrador" },
  }),
  syncCurrentUserProfile: vi.fn(),
}));

const sampleUsers = [
  {
    id: "usr-admin",
    name: "Administrador FarmFlow",
    email: "admin@farmflow.com",
    role: "admin",
    status: "Ativo",
    phone: "(45) 99999-0001",
    permissions: ["dashboard", "customers", "farms", "orders", "schedule", "analysis", "financial", "reports", "settings"],
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "usr-op",
    name: "João Operador",
    email: "joao@farmflow.com",
    role: "Operador de Campo",
    status: "Ativo",
    phone: "(45) 98888-0002",
    permissions: ["dashboard", "schedule"],
    created_at: "2026-10-02T12:00:00Z",
  },
];

describe("UsersSection & UserModal permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue(sampleUsers);
  });

  it("renders users with translated permissions and prevents deleting logged-in user", async () => {
    render(<UsersSection />);

    expect(await screen.findByText("Administrador FarmFlow")).toBeInTheDocument();
    expect(screen.getByText("João Operador")).toBeInTheDocument();
    expect(screen.getByText("Você")).toBeInTheDocument();

    const selfDeleteBtn = screen.getByRole("button", {
      name: /Você não pode excluir seu próprio usuário/i,
    });
    expect(selfDeleteBtn).toBeDisabled();
  });

  it("opens Novo Usuário modal, updates permission checkboxes, and submits POST /users", async () => {
    (api.post as any).mockResolvedValue({ id: "usr-new" });

    render(<UsersSection />);
    await screen.findByText("Administrador FarmFlow");

    fireEvent.click(screen.getByRole("button", { name: /Novo Usuário/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Novo Usuário/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: "Ana Financeira" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "ana@farmflow.com" },
    });
    fireEvent.change(screen.getByLabelText(/Senha de Acesso/i), {
      target: { value: "senha123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Limpar/i }));
    fireEvent.click(screen.getByLabelText(/^Financeiro$/i));
    fireEvent.click(screen.getByLabelText(/^Dashboard$/i));

    fireEvent.click(screen.getByRole("button", { name: /^Criar$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/users",
        expect.objectContaining({
          name: "Ana Financeira",
          email: "ana@farmflow.com",
          status: "Ativo",
          permissions: ["financial", "dashboard"],
        })
      );
    });
  });

  it("opens edit modal with user's current permissions and submits PUT /users/:id", async () => {
    (api.put as any).mockResolvedValue({ ...sampleUsers[1], permissions: ["dashboard", "schedule", "farms"] });

    render(<UsersSection />);
    await screen.findByText("João Operador");

    const editButtons = screen.getAllByRole("button", { name: /Editar usuário/i });
    fireEvent.click(editButtons[1]);

    expect(screen.getByRole("heading", { name: /Editar Usuário/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Agenda/i)).toBeChecked();
    expect(screen.getByLabelText(/Configurações/i)).not.toBeChecked();

    fireEvent.click(screen.getByLabelText(/Fazendas/i));
    fireEvent.click(screen.getByRole("button", { name: /Atualizar/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/users/usr-op",
        expect.objectContaining({
          permissions: ["dashboard", "schedule", "farms"],
        })
      );
    });
  });

  it("opens confirmation dialog instead of window.confirm when deleting another user", async () => {
    (api.delete as any).mockResolvedValue({});

    render(<UsersSection />);
    await screen.findByText("João Operador");

    fireEvent.click(screen.getByRole("button", { name: /^Excluir usuário$/i }));

    expect(screen.getByText(/Confirmar exclusão|Excluir Usuário/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Excluir$/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/users/usr-op");
    });
  });
});

