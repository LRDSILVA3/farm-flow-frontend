
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Truck, Users, FlaskConical, Layers, Calculator } from "lucide-react";
import { ServicesTab } from "./ServicesTab";
import { ProductsTab } from "./ProductsTab";
import { EquipmentsTab } from "./EquipmentsTab";
import { CollaboratorsTab } from "./CollaboratorsTab";
import { AnalysesTab } from "./AnalysesTab";
import { ServiceGroupsTab } from "./ServiceGroupsTab";
import { CostVariablesTab } from "./CostVariablesTab";
import { ServiceModal } from "./ServiceModal";
import { ProductModal } from "./ProductModal";
import { EquipmentModal } from "./EquipmentModal";
import { CollaboratorModal } from "./CollaboratorModal";
import { AnalysisModal } from "./AnalysisModal";
import { CostVariableModal } from "./CostVariableModal";
import { useServices } from "../../../hooks/useServices";
import { useProducts } from "../../../hooks/useProducts";
import { useEquipment } from "../../../hooks/useEquipment";
import { useCollaborators } from "../../../hooks/useCollaborators";
import { useAnalyses } from "../../../hooks/useAnalyses";
import { useCostVariables } from "../../../hooks/useCostVariables";

export const OperationalSection = () => {
  const servicesData = useServices();
  const productsData = useProducts();
  const equipmentData = useEquipment();
  const collaboratorsData = useCollaborators();
  const analysesData = useAnalyses();
  const costVariablesData = useCostVariables();

  return (
    <>
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="flex-wrap h-auto w-full justify-start gap-1 p-1">
          <TabsTrigger value="services" className="text-xs px-2.5 py-1.5">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="service-groups" className="text-xs px-2.5 py-1.5">
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Grupos de Serviços
          </TabsTrigger>
          <TabsTrigger value="cost-variables" className="text-xs px-2.5 py-1.5">
            <Calculator className="h-3.5 w-3.5 mr-1.5" />
            Variáveis de Custo
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs px-2.5 py-1.5">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="equipment" className="text-xs px-2.5 py-1.5">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="text-xs px-2.5 py-1.5">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="analyses" className="text-xs px-2.5 py-1.5">
            <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServicesTab {...servicesData} />
        </TabsContent>

        <TabsContent value="service-groups">
          <ServiceGroupsTab />
        </TabsContent>

        <TabsContent value="cost-variables">
          <CostVariablesTab {...costVariablesData} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab {...productsData} />
        </TabsContent>

        <TabsContent value="equipment">
          <EquipmentsTab {...equipmentData} />
        </TabsContent>

        <TabsContent value="collaborators">
          <CollaboratorsTab {...collaboratorsData} />
        </TabsContent>

        <TabsContent value="analyses">
          <AnalysesTab {...analysesData} />
        </TabsContent>
      </Tabs>

      <ServiceModal {...servicesData} />
      <ProductModal {...productsData} />
      <EquipmentModal {...equipmentData} />
      <CollaboratorModal {...collaboratorsData} />
      <AnalysisModal {...analysesData} />
      <CostVariableModal {...costVariablesData} />
    </>
  );
};
