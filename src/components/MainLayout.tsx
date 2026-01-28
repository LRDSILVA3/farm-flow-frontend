
import { useState, useMemo, useCallback } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Home, Users, MapPin, FileText, Calendar, DollarSign, Settings, LogOut, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CustomersPage from "./pages/CustomersPage";
import FarmsPage from "./pages/FarmPage";
import OrdersPage from "./pages/OrdersPage";
import SchedulePage from "./pages/SchedulePage";
import FinancialPage from "./pages/FinancialPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardHome from "./pages/DashboardHome";
import AnalysisPage from "./pages/AnalysisPage";

const MainLayoutContent = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: Home },
    { id: "customers", title: "Clientes", icon: Users },
    { id: "farms", title: "Fazendas", icon: MapPin },
    { id: "orders", title: "Pedidos", icon: FileText },
    { id: "schedule", title: "Agenda", icon: Calendar },
    { id: "analysis", title: "Análises", icon: FlaskConical },
    { id: "financial", title: "Financeiro", icon: DollarSign },
    { id: "settings", title: "Configurações", icon: Settings },
  ];

  const handleNavigateToFarms = useCallback((customerCpf: string) => {
    setCurrentPage("farms");
  }, []);

  const handleMenuClick = useCallback((pageId: string) => {
    setCurrentPage(pageId);
  }, []);

  const currentPageComponent = useMemo(() => {
    switch (currentPage) {
      case "customers":
        return <CustomersPage onNavigateToFarms={handleNavigateToFarms} />;
      case "farms":
        return <FarmsPage />;
      case "orders":
        return <OrdersPage />;
      case "schedule":
        return <SchedulePage />;
      case "financial":
        return <FinancialPage />;
      case "settings":
        return <SettingsPage />;
      case "analysis":
        return <AnalysisPage />;
      default:
        return <DashboardHome />;
    }
  }, [currentPage, handleNavigateToFarms]);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar>
        <SidebarHeader className="p-4">
          <h2 className="text-xl font-bold text-green-700">Preciza</h2>
          <p className="text-sm text-gray-600">Sistema de Agricultura de Precisão.</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => handleMenuClick(item.id)}
                  isActive={currentPage === item.id}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <p className="text-sm text-gray-600">Bem-vindo ao sistema Preciza</p>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div key={currentPage}>
            {currentPageComponent}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

const MainLayout = () => {
  return (
    <SidebarProvider>
      <MainLayoutContent />
    </SidebarProvider>
  );
};

export default MainLayout;
