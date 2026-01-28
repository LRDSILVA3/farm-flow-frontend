
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Truck, Users, FlaskConical, Layers, Calculator } from "lucide-react";
import { ServicosTab } from "./ServicosTab";
import { ProdutosTab } from "./ProdutosTab";
import { EquipamentosTab } from "./EquipamentosTab";
import { ColaboradoresTab } from "./ColaboradoresTab";
import { AnalisesTab } from "./AnalisesTab";
import { GruposServicosTab } from "./GruposServicosTab";
import { VariaveisCustoTab } from "./VariaveisCustoTab";
import { ServicoModal } from "./ServicoModal";
import { ProdutoModal } from "./ProdutoModal";
import { EquipamentoModal } from "./EquipamentoModal";
import { ColaboradorModal } from "./ColaboradorModal";
import { AnaliseModal } from "./AnaliseModal";
import { VariavelCustoModal } from "./VariavelCustoModal";
import { useServices } from "./../../../hooks/useServices";
import { useProducts } from "./../../../hooks/useProducts";
import { useEquipment } from "./../../../hooks/useEquipment";
import { useCollaborators } from "./../../../hooks/useCollaborators";
import { useAnalyses } from "./../../../hooks/useAnalyses";
import { useCostVariables } from "./../../../hooks/useCostVariables";

export const OperacionaisSection = () => {
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
          <ServicosTab {...servicosData} />
        </TabsContent>

        <TabsContent value="grupos-servicos">
          <GruposServicosTab />
        </TabsContent>

        <TabsContent value="variaveis-custo">
          <VariaveisCustoTab {...variaveisCustoData} />
        </TabsContent>

        <TabsContent value="produtos">
          <ProdutosTab {...produtosData} />
        </TabsContent>

        <TabsContent value="equipamentos">
          <EquipamentosTab {...equipamentosData} />
        </TabsContent>

        <TabsContent value="colaboradores">
          <ColaboradoresTab {...colaboradoresData} />
        </TabsContent>

        <TabsContent value="analises">
          <AnalisesTab {...analisesData} />
        </TabsContent>
      </Tabs>

      <ServicoModal {...servicosData} />
      <ProdutoModal {...produtosData} />
      <EquipamentoModal {...equipamentosData} />
      <ColaboradorModal {...colaboradoresData} />
      <AnaliseModal {...analisesData} />
      <VariavelCustoModal {...variaveisCustoData} />
    </>
  );
};
