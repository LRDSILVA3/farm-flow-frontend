import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Users, Smartphone, Printer } from "lucide-react";
import { OperationalSection } from "./settings/OperationalSection";
import { SystemSection } from "./settings/SystemSection";
import { UsersSection } from "./settings/UsersSection";
import { AppSection } from "./settings/AppSection";
import { PdfHeaderTab } from "./settings/PdfHeaderTab";

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("operational");

  const menuSections = [
    {
      id: "operational",
      title: "Configurações Operacionais",
      icon: Settings,
      description: "Serviços, produtos e equipamentos"
    },
    {
      id: "pdf",
      title: "Cabeçalho de PDFs",
      icon: Printer,
      description: "Personalizar dados da empresa e rodapé dos orçamentos"
    },
    {
      id: "system",
      title: "Configurações do Sistema",
      icon: Settings,
      description: "Configurações gerais do sistema"
    },
    {
      id: "users",
      title: "Usuários e Permissões",
      icon: Users,
      description: "Gerenciar usuários e acessos"
    },
    {
      id: "app",
      title: "Configurações do App",
      icon: Smartphone,
      description: "Banners e planos do aplicativo"
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "operational":
        return <OperationalSection />;
      case "pdf":
        return <PdfHeaderTab />;
      case "system":
        return <SystemSection />;
      case "users":
        return <UsersSection />;
      case "app":
        return <AppSection />;
      default:
        return <OperationalSection />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Menu */}
      <div className="w-full md:w-64 space-y-2">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-gray-600 text-sm">Gerencie as configurações do sistema</p>
        </div>
        
        {menuSections.map((section) => (
          <Card 
            key={section.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              activeSection === section.id ? "border-green-500 bg-green-50" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <section.icon className={`h-5 w-5 mt-0.5 ${
                  activeSection === section.id ? "text-green-600" : "text-gray-500"
                }`} />
                <div>
                  <h3 className={`font-medium text-sm ${
                    activeSection === section.id ? "text-green-800" : "text-gray-900"
                  }`}>
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default SettingsPage;
