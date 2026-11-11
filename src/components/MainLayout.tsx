import { useState, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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

const MainLayoutContent = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [farmClientFilter, setFarmClientFilter] = useState<{ id?: string; name?: string; cpf?: string } | null>(null);
  const { toast } = useToast();
  const { profile, hasPermission, signOut } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

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
    if (isMobile) setOpenMobile(false);
  }, [hasPermission, isMobile, setOpenMobile, toast]);

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
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b px-4 sm:px-8 bg-white sticky top-0 z-10 shadow-sm w-full">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 hidden sm:inline">
              Preciza CRM
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="hidden md:inline">Ambiente:</span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
              Online
            </span>
          </div>
        </header>

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
