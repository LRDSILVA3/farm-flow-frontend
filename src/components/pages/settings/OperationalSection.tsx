
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="services">
            <Settings className="h-4 w-4 mr-2" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="service-groups">
            <Layers className="h-4 w-4 mr-2" />
            Grupos de Serviços
          </TabsTrigger>
          <TabsTrigger value="cost-variables">
            <Calculator className="h-4 w-4 mr-2" />
            Variáveis de Custo
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Truck className="h-4 w-4 mr-2" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="collaborators">
            <Users className="h-4 w-4 mr-2" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="analyses">
            <FlaskConical className="h-4 w-4 mr-2" />
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
