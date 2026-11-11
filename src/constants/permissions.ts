export const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", name: "Dashboard" },
  { id: "customers", name: "Clientes" },
  { id: "farms", name: "Fazendas" },
  { id: "orders", name: "Pedidos" },
  { id: "schedule", name: "Agenda" },
  { id: "analysis", name: "Análises" },
  { id: "financial", name: "Financeiro" },
  { id: "reports", name: "Relatórios & Auditoria" },
  { id: "settings", name: "Configurações" },
] as const;

export type PermissionKey = (typeof AVAILABLE_PERMISSIONS)[number]["id"];

export const PERMISSION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Clientes",
  farms: "Fazendas",
  orders: "Pedidos",
  schedule: "Agenda",
  analysis: "Análises",
  financial: "Financeiro",
  reports: "Relatórios",
  settings: "Configurações",
};

export const ROLE_OPTIONS = [
  "Administrador",
  "Gerente",
  "Operador de Campo",
  "Financeiro",
  "Analista",
] as const;

export const ROLE_TO_LABEL: Record<string, string> = {
  admin: "Administrador",
  administrador: "Administrador",
  manager: "Gerente",
  gerente: "Gerente",
  operator: "Operador de Campo",
  "operador de campo": "Operador de Campo",
  operador: "Operador de Campo",
  user: "Operador de Campo",
  financial: "Financeiro",
  financeiro: "Financeiro",
  analyst: "Analista",
  analista: "Analista",
};

export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionKey[]> = {
  Administrador: [
    "dashboard",
    "customers",
    "farms",
    "orders",
    "schedule",
    "analysis",
    "financial",
    "reports",
    "settings",
  ],
  Gerente: [
    "dashboard",
    "customers",
    "farms",
    "orders",
    "schedule",
    "analysis",
    "financial",
    "reports",
  ],
  "Operador de Campo": ["dashboard", "farms", "orders", "schedule"],
  Financeiro: ["dashboard", "customers", "orders", "financial", "reports"],
  Analista: ["dashboard", "farms", "analysis", "reports"],
};

const VALID_KEYS = new Set<string>(AVAILABLE_PERMISSIONS.map((p) => p.id));

export const normalizeRoleLabel = (role?: string | null): string => {
  if (!role || !role.trim()) return "Operador de Campo";
  return ROLE_TO_LABEL[role.trim().toLowerCase()] || role.trim();
};

export const getDefaultPermissionsForRole = (role?: string | null): PermissionKey[] => {
  const label = normalizeRoleLabel(role);
  const preset = ROLE_DEFAULT_PERMISSIONS[label];
  return preset ? [...preset] : ["dashboard"];
};

export const sanitizePermissions = (permissions: unknown): PermissionKey[] => {
  if (!Array.isArray(permissions)) return [];
  const unique: PermissionKey[] = [];
  for (const item of permissions) {
    if (typeof item === "string" && VALID_KEYS.has(item) && !unique.includes(item as PermissionKey)) {
      unique.push(item as PermissionKey);
    }
  }
  return unique;
};

export const resolveUserPermissions = (user?: {
  role?: string | null;
  permissions?: string[] | null;
} | null): PermissionKey[] => {
  if (!user) return [];
  if (Array.isArray(user.permissions)) {
    return sanitizePermissions(user.permissions);
  }
  return getDefaultPermissionsForRole(user.role);
};

