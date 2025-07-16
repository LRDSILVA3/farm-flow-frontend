
import { useState } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Home, Users, MapPin, FileText, Calendar, DollarSign, Settings, LogOut, FlaskConical } from "lucide-react";
import ClientesPage from "./pages/ClientesPage";
import FazendasPage from "./pages/FazendasPage";
import PedidosPage from "./pages/PedidosPage";
import AgendaPage from "./pages/AgendaPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import DashboardHome from "./pages/DashboardHome";
import AnalisesPrincipalPage from "./pages/AnalisesPrincipalPage";

const MainLayoutContent = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: Home },
    { id: "clientes", title: "Clientes", icon: Users },
    { id: "fazendas", title: "Fazendas", icon: MapPin },
    { id: "pedidos", title: "Pedidos", icon: FileText },
    { id: "agenda", title: "Agenda", icon: Calendar },
    { id: "analises", title: "Análises", icon: FlaskConical },
    { id: "financeiro", title: "Financeiro", icon: DollarSign },
    { id: "configuracoes", title: "Configurações", icon: Settings },
  ];

  const handleNavigateToFazendas = (clienteCpf: string) => {
    console.log("Navegando para fazendas com CPF:", clienteCpf);
    setCurrentPage("fazendas");
  };

  const handleMenuClick = (pageId: string) => {
    console.log("Navegando para página:", pageId);
    setCurrentPage(pageId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "clientes":
        return <ClientesPage onNavigateToFazendas={handleNavigateToFazendas} />;
      case "fazendas":
        return <FazendasPage />;
      case "pedidos":
        return <PedidosPage />;
      case "agenda":
        return <AgendaPage />;
      case "financeiro":
        return <FinanceiroPage />;
      case "configuracoes":
        return <ConfiguracoesPage />;
      case "analises":
        return <AnalisesPrincipalPage />;
      default:
        return <DashboardHome />;
    }
  };

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
              <SidebarMenuButton onClick={() => window.location.reload()}>
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
          {renderPage()}
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
