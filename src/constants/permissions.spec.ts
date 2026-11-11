import { describe, it, expect } from "vitest";
import {
  AVAILABLE_PERMISSIONS,
  getDefaultPermissionsForRole,
  normalizeRoleLabel,
  resolveUserPermissions,
  sanitizePermissions,
} from "./permissions";

describe("permissions constants & resolvers", () => {
  it("normalizes legacy backend and portuguese role labels", () => {
    expect(normalizeRoleLabel("admin")).toBe("Administrador");
    expect(normalizeRoleLabel("manager")).toBe("Gerente");
    expect(normalizeRoleLabel("operator")).toBe("Operador de Campo");
    expect(normalizeRoleLabel("user")).toBe("Operador de Campo");
    expect(normalizeRoleLabel("financial")).toBe("Financeiro");
    expect(normalizeRoleLabel("analyst")).toBe("Analista");
    expect(normalizeRoleLabel("")).toBe("Operador de Campo");
  });

  it("filters out unknown permission strings and deduplicates", () => {
    expect(sanitizePermissions(["dashboard", "orders", "unknown_mod", "orders"])).toEqual([
      "dashboard",
      "orders",
    ]);
  });

  it("returns explicit user permissions even when empty array is configured", () => {
    expect(resolveUserPermissions({ role: "Administrador", permissions: ["dashboard", "financial"] })).toEqual([
      "dashboard",
      "financial",
    ]);
    expect(resolveUserPermissions({ role: "Operador de Campo", permissions: [] })).toEqual([]);
  });

  it("falls back to role defaults when permissions is undefined or null", () => {
    expect(resolveUserPermissions({ role: "admin", permissions: null })).toEqual(
      AVAILABLE_PERMISSIONS.map((p) => p.id)
    );
    expect(resolveUserPermissions({ role: "Financeiro" })).toEqual(
      getDefaultPermissionsForRole("Financeiro")
    );
  });
});

