export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  viewKey: string;
  editKey: string;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { id: "dashboard", name: "Dashboard", description: "Indicadores gerais, gráficos e resumo operacional", viewKey: "dashboard:view", editKey: "dashboard:edit" },
  { id: "customers", name: "Clientes", description: "Cadastro e gestão de produtores e clientes", viewKey: "customers:view", editKey: "customers:edit" },
  { id: "farms", name: "Fazendas", description: "Mapeamento de fazendas, talhões e áreas", viewKey: "farms:view", editKey: "farms:edit" },
  { id: "orders", name: "Pedidos & Orçamentos", description: "Orçamentos, emissão e status de pedidos de serviços", viewKey: "orders:view", editKey: "orders:edit" },
  { id: "schedule", name: "Agenda de Serviços", description: "Cronograma de visitas, alocação de equipe e etapas", viewKey: "schedule:view", editKey: "schedule:edit" },
  { id: "analysis", name: "Análises de Solo/Folha", description: "Resultados, relatórios e mapas analíticos", viewKey: "analysis:view", editKey: "analysis:edit" },
  { id: "financial", name: "Financeiro", description: "Recebíveis, fluxo de pagamentos e faturamento", viewKey: "financial:view", editKey: "financial:edit" },
  { id: "reports", name: "Relatórios & Auditoria", description: "Relatórios gerenciais e trilha de auditoria", viewKey: "reports:view", editKey: "reports:edit" },
  { id: "settings", name: "Configurações", description: "Parâmetros do sistema, produtos, cargos e acessos", viewKey: "settings:view", editKey: "settings:edit" },
];

export const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", name: "Dashboard (Completo)" },
  { id: "dashboard:view", name: "Dashboard: Visualizar" },
  { id: "customers", name: "Clientes (Completo)" },
  { id: "customers:view", name: "Clientes: Visualizar" },
  { id: "customers:edit", name: "Clientes: Editar" },
  { id: "farms", name: "Fazendas (Completo)" },
  { id: "farms:view", name: "Fazendas: Visualizar" },
  { id: "farms:edit", name: "Fazendas: Editar" },
  { id: "orders", name: "Pedidos (Completo)" },
  { id: "orders:view", name: "Pedidos: Visualizar" },
  { id: "orders:edit", name: "Pedidos: Editar" },
  { id: "schedule", name: "Agenda (Completo)" },
  { id: "schedule:view", name: "Agenda: Visualizar" },
  { id: "schedule:edit", name: "Agenda: Editar" },
  { id: "analysis", name: "Análises (Completo)" },
  { id: "analysis:view", name: "Análises: Visualizar" },
  { id: "analysis:edit", name: "Análises: Editar" },
  { id: "financial", name: "Financeiro (Completo)" },
  { id: "financial:view", name: "Financeiro: Visualizar" },
  { id: "financial:edit", name: "Financeiro: Editar" },
  { id: "reports", name: "Relatórios & Auditoria (Completo)" },
  { id: "reports:view", name: "Relatórios: Visualizar" },
  { id: "reports:edit", name: "Relatórios: Editar" },
  { id: "settings", name: "Configurações (Completo)" },
  { id: "settings:view", name: "Configurações: Visualizar" },
  { id: "settings:edit", name: "Configurações: Editar" },
] as const;

export type PermissionKey = string;

export const PERMISSION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "dashboard:view": "Dashboard (Visualizar)",
  "dashboard:edit": "Dashboard (Editar)",
  customers: "Clientes",
  "customers:view": "Clientes (Visualizar)",
  "customers:edit": "Clientes (Editar)",
  farms: "Fazendas",
  "farms:view": "Fazendas (Visualizar)",
  "farms:edit": "Fazendas (Editar)",
  orders: "Pedidos",
  "orders:view": "Pedidos (Visualizar)",
  "orders:edit": "Pedidos (Editar)",
  schedule: "Agenda",
  "schedule:view": "Agenda (Visualizar)",
  "schedule:edit": "Agenda (Editar)",
  analysis: "Análises",
  "analysis:view": "Análises (Visualizar)",
  "analysis:edit": "Análises (Editar)",
  financial: "Financeiro",
  "financial:view": "Financeiro (Visualizar)",
  "financial:edit": "Financeiro (Editar)",
  reports: "Relatórios",
  "reports:view": "Relatórios (Visualizar)",
  "reports:edit": "Relatórios (Editar)",
  settings: "Configurações",
  "settings:view": "Configurações (Visualizar)",
  "settings:edit": "Configurações (Editar)",
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
    "dashboard", "dashboard:view",
    "customers", "customers:view", "customers:edit",
    "farms", "farms:view", "farms:edit",
    "orders", "orders:view", "orders:edit",
    "schedule", "schedule:view", "schedule:edit",
    "analysis", "analysis:view", "analysis:edit",
    "financial", "financial:view", "financial:edit",
    "reports", "reports:view", "reports:edit",
    "settings", "settings:view", "settings:edit",
  ],
  Gerente: [
    "dashboard:view",
    "customers:view", "customers:edit",
    "farms:view", "farms:edit",
    "orders:view", "orders:edit",
    "schedule:view", "schedule:edit",
    "analysis:view", "analysis:edit",
    "financial:view", "financial:edit",
    "reports:view",
  ],
  "Operador de Campo": [
    "dashboard:view",
    "farms:view",
    "orders:view",
    "schedule:view", "schedule:edit",
  ],
  Financeiro: [
    "dashboard:view",
    "customers:view",
    "orders:view",
    "financial:view", "financial:edit",
    "reports:view",
  ],
  Analista: [
    "dashboard:view",
    "farms:view",
    "analysis:view", "analysis:edit",
    "reports:view",
  ],
};

const VALID_KEYS = new Set<string>(AVAILABLE_PERMISSIONS.map((p) => p.id));

export const normalizeRoleLabel = (role?: string | null): string => {
  if (!role || !role.trim()) return "Operador de Campo";
  return ROLE_TO_LABEL[role.trim().toLowerCase()] || role.trim();
};

export const getDefaultPermissionsForRole = (role?: string | null): PermissionKey[] => {
  const label = normalizeRoleLabel(role);
  const preset = ROLE_DEFAULT_PERMISSIONS[label];
  return preset ? [...preset] : ["dashboard:view"];
};

export const canUserView = (permissions: string[] = [], moduleName: string): boolean => {
  if (permissions.includes(moduleName)) return true;
  if (permissions.includes(`${moduleName}:view`)) return true;
  if (permissions.includes(`${moduleName}:edit`)) return true;
  return false;
};

export const canUserEdit = (permissions: string[] = [], moduleName: string): boolean => {
  if (permissions.includes(moduleName)) return true;
  if (permissions.includes(`${moduleName}:edit`)) return true;
  return false;
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

