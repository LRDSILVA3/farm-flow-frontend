
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Truck, Users, FlaskConical, Layers, Calculator } from "lucide-react";
import { ServicesTab } from "./ServicesTab";
import { ProductsTab } from "./ProductsTab";
import { EquipmentsTab } from "./EquipmentsTab";
import { ColaboradoresTab } from "./CollaboratorsTab";
import { AnalisesTab } from "./AnalysesTab";
import { ServiceGroupsTab } from "./ServiceGroupsTab";
import { CostVariablesTab } from "./CostVariablesTab";
import { ServiceModal } from "./ServiceModal";
import { ProductModal } from "./ProductModal";
import { EquipamentoModal } from "./EquipmentModal";
import { ColaboradorModal } from "./CollaboratorModal";
import { AnaliseModal } from "./AnalysisModal";
import { CostVariableModal } from "./CostVariableModal";
import { useServices } from "../../../hooks/useServices";
import { useProducts } from "../../../hooks/useProducts";
import { useEquipment } from "../../../hooks/useEquipment";
import { useCollaborators } from "../../../hooks/useCollaborators";
import { useAnalyses } from "../../../hooks/useAnalyses";
import { useCostVariables } from "../../../hooks/useCostVariables";

export const OperationalSection = () => {
  const servicosData = useServices();
  const produtosData = useProducts();
  const equipamentosData = useEquipment();
  const colaboradoresData = useCollaborators();
  const analisesData = useAnalyses();
  const variaveisCustoData = useCostVariables();

  return (
    <>
      <Tabs defaultValue="servicos" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="servicos">
            <Settings className="h-4 w-4 mr-2" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="grupos-servicos">
            <Layers className="h-4 w-4 mr-2" />
            Grupos de Serviços
          </TabsTrigger>
          <TabsTrigger value="variaveis-custo">
            <Calculator className="h-4 w-4 mr-2" />
            Variáveis de Custo
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="equipamentos">
            <Truck className="h-4 w-4 mr-2" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="colaboradores">
            <Users className="h-4 w-4 mr-2" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="analises">
            <FlaskConical className="h-4 w-4 mr-2" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servicos">
          <ServicesTab {...servicosData} />
        </TabsContent>

        <TabsContent value="grupos-servicos">
          <ServiceGroupsTab />
        </TabsContent>

        <TabsContent value="variaveis-custo">
          <CostVariablesTab {...variaveisCustoData} />
        </TabsContent>

        <TabsContent value="produtos">
          <ProductsTab {...produtosData} />
        </TabsContent>

        <TabsContent value="equipamentos">
          <EquipmentsTab {...equipamentosData} />
        </TabsContent>

        <TabsContent value="colaboradores">
          <ColaboradoresTab {...colaboradoresData} />
        </TabsContent>

        <TabsContent value="analises">
          <AnalisesTab {...analisesData} />
        </TabsContent>
      </Tabs>

      <ServiceModal {...servicosData} />
      <ProductModal {...produtosData} />
      <EquipamentoModal {...equipamentosData} />
      <ColaboradorModal {...colaboradoresData} />
      <AnaliseModal {...analisesData} />
      <CostVariableModal {...variaveisCustoData} />
    </>
  );
};
