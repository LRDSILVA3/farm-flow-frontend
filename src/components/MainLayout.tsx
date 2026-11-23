import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  FlaskConical,
  ShieldAlert,
  Wifi,
  WifiOff,
  CloudDownload,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useOffline } from "@/contexts/OfflineContext";
import { OfflineSyncDialog } from "./OfflineSyncDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomersPage from "./pages/CustomersPage";
import FarmsPage from "./pages/FarmPage";
import OrdersPage from "./pages/OrdersPage";
import SchedulePage from "./pages/SchedulePage";
import FinancialPage from "./pages/FinancialPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardHome from "./pages/DashboardHome";
import AnalysisPage from "./pages/AnalysisPage";
import ReportsPage from "./pages/ReportsPage";
import { BarChart3 } from "lucide-react";

const MENU_ITEMS = [
  { id: "dashboard", title: "Dashboard", icon: Home },
  { id: "customers", title: "Clientes", icon: Users },
  { id: "farms", title: "Fazendas", icon: MapPin },
  { id: "orders", title: "Pedidos", icon: FileText },
  { id: "schedule", title: "Agenda", icon: Calendar },
  { id: "analysis", title: "Análises", icon: FlaskConical },
  { id: "financial", title: "Financeiro", icon: DollarSign },
  { id: "reports", title: "Relatórios", icon: BarChart3 },
  { id: "settings", title: "Configurações", icon: Settings },
];

const getPageFromPath = (path: string): string | null => {
  const clean = path.replace(/^\//, '').toLowerCase();
  switch (clean) {
    case 'dashboard':
      return 'dashboard';
    case 'customers':
    case 'clientes':
      return 'customers';
    case 'farms':
    case 'fazendas':
      return 'farms';
    case 'orders':
    case 'pedidos':
      return 'orders';
    case 'schedule':
    case 'agenda':
      return 'schedule';
    case 'analysis':
    case 'analises':
      return 'analysis';
    case 'financial':
    case 'financeiro':
      return 'financial';
    case 'reports':
    case 'relatorios':
      return 'reports';
    case 'settings':
    case 'configuracoes':
      return 'settings';
    default:
      return null;
  }
};

const PAGE_TO_PATH: Record<string, string> = {
  dashboard: "/dashboard",
  customers: "/clientes",
  farms: "/fazendas",
  orders: "/pedidos",
  schedule: "/agenda",
  analysis: "/analises",
  financial: "/financeiro",
  reports: "/relatorios",
  settings: "/configuracoes",
};

const MainLayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPage = getPageFromPath(location.pathname) || "dashboard";
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [farmClientFilter, setFarmClientFilter] = useState<{ id?: string; name?: string; cpf?: string } | null>(null);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const { toast } = useToast();
  const { profile, hasPermission, signOut } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const { isOnline, pendingCount, isPreparing, isSyncing, prepareForField } = useOffline();

  useEffect(() => {
    const pageFromPath = getPageFromPath(location.pathname);
    if (pageFromPath && hasPermission(pageFromPath)) {
      setCurrentPage(pageFromPath);
    }
  }, [location.pathname, hasPermission]);

  useEffect(() => {
    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetPage = customEvent.detail;
      if (targetPage && hasPermission(targetPage)) {
        setCurrentPage(targetPage);
      }
    };
    window.addEventListener('farmflow-navigate', handleCustomNavigate);
    return () => {
      window.removeEventListener('farmflow-navigate', handleCustomNavigate);
    };
  }, [hasPermission]);

  const handleLogout = async () => {
    await signOut();
  };

  const allowedMenuItems = useMemo(
    () => MENU_ITEMS.filter((item) => hasPermission(item.id)),
    [hasPermission]
  );

  const effectivePage = useMemo(() => {
    if (allowedMenuItems.length === 0) return null;
    if (hasPermission(currentPage)) return currentPage;
    return allowedMenuItems[0].id;
  }, [allowedMenuItems, currentPage, hasPermission]);

  const handleNavigateToFarms = useCallback((customerCpf: string, customerName?: string, customerId?: string) => {
    if (!hasPermission("farms")) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar Fazendas.",
        variant: "destructive",
      });
      return;
    }
    setFarmClientFilter({ cpf: customerCpf, name: customerName, id: customerId });
    setCurrentPage("farms");
    if (isMobile) setOpenMobile(false);
  }, [hasPermission, isMobile, setOpenMobile, toast]);

  const handleMenuClick = useCallback((pageId: string) => {
    if (!hasPermission(pageId)) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar este módulo.",
        variant: "destructive",
      });
      return;
    }
    if (pageId === "farms") {
      setFarmClientFilter(null);
    }
    setCurrentPage(pageId);
    const targetPath = PAGE_TO_PATH[pageId];
    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath);
    }
    if (isMobile) setOpenMobile(false);
  }, [hasPermission, isMobile, location.pathname, navigate, setOpenMobile, toast]);

  const currentPageComponent = useMemo(() => {
    if (!effectivePage) {
      return (
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Sem módulos habilitados</h2>
            <p className="text-sm text-muted-foreground">
              Sua conta não possui permissões de acesso configuradas. Solicite ao administrador a liberação dos módulos necessários.
            </p>
            <Button variant="outline" onClick={handleLogout}>
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      );
    }

    switch (effectivePage) {
      case "customers":
        return (
          <CustomersPage
            onNavigateToFarms={handleNavigateToFarms}
            canNavigateToFarms={hasPermission("farms")}
          />
        );
      case "farms":
        return (
          <FarmsPage
            clientFilter={farmClientFilter}
            onClearClientFilter={() => setFarmClientFilter(null)}
          />
        );
      case "orders":
        return <OrdersPage />;
      case "schedule":
        return <SchedulePage />;
      case "financial":
        return <FinancialPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "analysis":
        return <AnalysisPage />;
      default:
        return <DashboardHome onNavigate={handleMenuClick} canNavigate={hasPermission} />;
    }
  }, [effectivePage, farmClientFilter, handleNavigateToFarms, handleMenuClick, hasPermission]);

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-white font-bold">
              P
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-700 leading-tight">Preciza</h2>
              <p className="text-xs text-muted-foreground">Agricultura de Precisão</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col justify-between h-full">
          <SidebarMenu>
            {allowedMenuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleMenuClick(item.id)}
                  isActive={effectivePage === item.id}
                  className="gap-3 py-2.5 rounded-md"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="mt-4 pt-3 border-t space-y-2">
            {profile?.name && (
              <div className="px-2 py-1.5 rounded-md bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-800 truncate">{profile.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile.role || "Usuário"}</p>
              </div>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="gap-3 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium text-sm">Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 w-full min-w-0 bg-slate-50/50">
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b px-4 sm:px-8 bg-white sticky top-0 z-10 shadow-sm w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 hidden sm:inline">
              Preciza CRM
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-xs sm:text-sm font-medium text-green-700 truncate">
              {MENU_ITEMS.find((m) => m.id === effectivePage)?.title || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground shrink-0">
            {isOnline && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={prepareForField}
                disabled={isPreparing}
                className="h-7 px-2.5 text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hidden md:inline-flex"
                title="Baixar clientes, fazendas, talhões e variáveis de preço para usar sem internet no campo"
              >
                {isPreparing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CloudDownload className="h-3.5 w-3.5" />
                )}
                <span>{isPreparing ? "Preparando..." : "Preparar p/ Campo"}</span>
              </Button>
            )}

            <button
              type="button"
              onClick={() => setShowOfflineDialog(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs border transition-colors cursor-pointer ${
                isSyncing
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : !isOnline
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : pendingCount > 0
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-green-100 text-green-800 border-green-200"
              }`}
              title="Abrir Central de Modo Campo Offline e Sincronização"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ""}</span>
                </>
              ) : (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>{pendingCount > 0 ? `Online • ${pendingCount} pendente(s)` : "Online"}</span>
                </>
              )}
            </button>
          </div>
        </header>

        <OfflineSyncDialog open={showOfflineDialog} onOpenChange={setShowOfflineDialog} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 overflow-x-hidden">
          <div key={effectivePage || "restricted"} className="animate-fade-in w-full">
            {currentPageComponent}
          </div>
        </div>
      </SidebarInset>
    </>
  );
};

const MainLayout = () => {
  return (
    <SidebarProvider className="w-full min-h-screen bg-slate-50/50">
      <MainLayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
