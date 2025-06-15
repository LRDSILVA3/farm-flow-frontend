
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Package, Truck } from "lucide-react";
import { ServicosTab } from "./ServicosTab";
import { ProdutosTab } from "./ProdutosTab";
import { EquipamentosTab } from "./EquipamentosTab";
import { ServicoModal } from "./ServicoModal";
import { ProdutoModal } from "./ProdutoModal";
import { EquipamentoModal } from "./EquipamentoModal";
import { useServicos } from "./useServicos";
import { useProdutos } from "./useProdutos";
import { useEquipamentos } from "./useEquipamentos";

export const OperacionaisSection = () => {
  const servicosData = useServicos();
  const produtosData = useProdutos();
  const equipamentosData = useEquipamentos();

  return (
    <>
      <Tabs defaultValue="servicos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servicos">
            <Settings className="h-4 w-4 mr-2" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="equipamentos">
            <Truck className="h-4 w-4 mr-2" />
            Equipamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servicos">
          <ServicosTab {...servicosData} />
        </TabsContent>

        <TabsContent value="produtos">
          <ProdutosTab {...produtosData} />
        </TabsContent>

        <TabsContent value="equipamentos">
          <EquipamentosTab {...equipamentosData} />
        </TabsContent>
      </Tabs>

      <ServicoModal {...servicosData} />
      <ProdutoModal {...produtosData} />
      <EquipamentoModal {...equipamentosData} />
    </>
  );
};
