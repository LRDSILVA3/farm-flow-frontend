import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Order } from "@/hooks/useOrders";
import { CustomerSelect } from "../farms/CustomerSelect";
import { FarmSelect } from "./FarmSelect";
import { PlotSelect } from "./PlotSelect";
import { ConferenciaServiceForm } from "./ConferenciaServiceForm";
import { FoliarServiceForm } from "./FoliarServiceForm";
import { CompactionServiceForm } from "./CompactionServiceForm";
import { DroneMappingServiceForm } from "./DroneMappingServiceForm";
import { ATVServiceForm } from "./ATVServiceForm";
import { SoilSamplingServiceForm } from "./SoilSamplingServiceForm";
import { DroneSprayingServiceForm } from "./DroneSprayingServiceForm";
import { EqualizaServiceForm } from "./EqualizaServiceForm";
import { ProductOrderForm } from "./ProductOrderForm";
import React, { useMemo } from "react";
import { useClients } from "@/hooks/useClients";
import { useFarms } from "@/hooks/useFarms";
import { useServices } from "@/hooks/useServices";

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder: Order | null;
  formData: Order;
  onInputChange: (field: keyof Order, value: string | { id: string; name: string; quantity: number }[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const OrderForm = ({
  open,
  onOpenChange,
  editingOrder,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
}: OrderFormProps) => {
  const [selectedPlotIds, setSelectedPlotIds] = React.useState<string[]>(() => {
    if (editingOrder && (editingOrder as any).plots && Array.isArray((editingOrder as any).plots)) {
      return (editingOrder as any).plots.map((p: any) => p.id || p);
    }
    return ["todos"];
  });
  const [isConferenciaAllPlotsSelected, setIsConferenciaAllPlotsSelected] = React.useState<boolean>(false);
  const { clients } = useClients();
  const { farms } = useFarms();
  const { services: catalogServices } = useServices();

  const availableFarms = useMemo(() => {
    if (!formData.clientId) return [];
    return farms.filter(farm => farm.clientId === formData.clientId);
  }, [farms, formData.clientId]);

  const availablePlots = useMemo(() => {
    if (!formData.farmId) return [];
    const selectedFarm = farms.find(farm => farm.id === formData.farmId);
    return selectedFarm ? selectedFarm.plots : [];
  }, [farms, formData.farmId]);

  // Sempre arredonda para exatamente 2 casas decimais
  const currentFarmTotalAlqueires = useMemo(() => {
    if (!formData.farmId) return 0;
    const selectedFarm = farms.find(farm => farm.id === formData.farmId);
    if (selectedFarm) {
      const farmArea = parseFloat(selectedFarm.area || "0") || 0;
      const plotsSum = selectedFarm.plots?.reduce((sum, p) => sum + (parseFloat(p.area || "0") || 0), 0) || 0;
      const totalAreaHectares = farmArea > 0 ? farmArea : plotsSum;
      return Number((totalAreaHectares / 2.42).toFixed(2));
    }
    return 0;
  }, [farms, formData.farmId]);

  const calculatedAlqueires = useMemo(() => {
    const ha = parseFloat(formData.area || "0") || 0;
    return Number((ha / 2.42).toFixed(2));
  }, [formData.area]);

  const availableServices = useMemo(() => {
    const active = catalogServices.filter(
      (s) => !s.status || s.status.toLowerCase() === "ativo"
    );
    if (active.length > 0) {
      return active.map((s) => ({
        id: s.id,
        name: s.name,
        valorAlqueire: Number(s.valuePerAlqueire || 0).toFixed(2),
        status: s.status || "Ativo",
      }));
    }
    return [
      { id: "1", name: "Amostragem de Solo (AP)", valorAlqueire: "345.12", status: "Ativo" },
      { id: "2", name: "Conferência", valorAlqueire: "71.67", status: "Ativo" },
      { id: "3", name: "Coleta Foliar", valorAlqueire: "18.00", status: "Ativo" },
      { id: "4", name: "Compactação de Solo", valorAlqueire: "361.11", status: "Ativo" },
      { id: "5", name: "Voo de Drone (Mapeamento)", valorAlqueire: "50.00", status: "Ativo" },
      { id: "6", name: "Pulverização com Drone", valorAlqueire: "240.00", status: "Ativo" },
      { id: "7", name: "Aplicação ATV", valorAlqueire: "315.00", status: "Ativo" },
      { id: "8", name: "Sistema Equaliza", valorAlqueire: "671.65", status: "Ativo" },
    ];
  }, [catalogServices]);

  const activeSpecializedService = useMemo(() => {
    const valid = [
      "Conferência",
      "Coleta Foliar",
      "Compactação de Solo",
      "Voo de Drone (Mapeamento)",
      "Aplicação ATV",
      "Amostragem de Solo (AP)",
      "Pulverização",
      "Pulverização com Drone",
      "Sistema Equaliza",
      "Equaliza"
    ];
    if (valid.includes(formData.type)) return formData.type;
    if (formData.type === "Serviço" && valid.includes(formData.serviceName)) return formData.serviceName;
    return null;
  }, [formData.type, formData.serviceName]);

  React.useEffect(() => {
    if (!open) {
      setSelectedPlotIds(["todos"]);
      setIsConferenciaAllPlotsSelected(false);
    } else if (editingOrder && (editingOrder as any).plots && Array.isArray((editingOrder as any).plots)) {
      setSelectedPlotIds((editingOrder as any).plots.map((p: any) => p.id || p));
    }
  }, [open, editingOrder]);

  const handleValuesChange = React.useCallback((calculatedValue: number) => {
    const formatted = calculatedValue.toFixed(2);
    const currentVal = parseFloat(formData.value || "0") || 0;
    // Previne loops de re-renderização: só atualiza se houver diferença real >= 1 centavo
    if (Math.abs(currentVal - calculatedValue) >= 0.01) {
      onInputChange("value", formatted);
    }
  }, [formData.value, onInputChange]);

  const handleCustomerChange = (id: string) => {
    onInputChange("clientId", id);
    onInputChange("farmId", "");
    setSelectedPlotIds(["todos"]);
    onInputChange("area", "");
    onInputChange("plots", []);
    setIsConferenciaAllPlotsSelected(false);
  };

  const handleFarmChange = (id: string) => {
    onInputChange("farmId", id);
    setSelectedPlotIds(["todos"]);
    const selectedFarm = farms.find(farm => farm.id === id);
    if (selectedFarm) {
      const farmArea = parseFloat(selectedFarm.area || "0") || 0;
      const plotsSum = selectedFarm.plots?.reduce((sum, p) => sum + (parseFloat(p.area || "0") || 0), 0) || 0;
      const totalArea = farmArea > 0 ? farmArea : plotsSum;
      onInputChange("area", totalArea.toFixed(2));
      onInputChange("plots", selectedFarm.plots || []);
      setIsConferenciaAllPlotsSelected(true);
    } else {
      onInputChange("area", "");
      onInputChange("plots", []);
      setIsConferenciaAllPlotsSelected(false);
    }
  };

  const handlePlotsChange = (plotIds: string[], selectedPlots: any[]) => {
    setSelectedPlotIds(plotIds);
    const selectedFarm = farms.find(f => f.id === formData.farmId);
    if (!selectedFarm) return;

    if (plotIds.includes("todos") || (selectedFarm.plots.length > 0 && plotIds.length === selectedFarm.plots.length)) {
      const farmArea = parseFloat(selectedFarm.area || "0") || 0;
      const plotsSum = selectedFarm.plots?.reduce((sum, p) => sum + (parseFloat(p.area || "0") || 0), 0) || 0;
      const totalArea = farmArea > 0 ? farmArea : plotsSum;
      onInputChange("area", totalArea.toFixed(2));
      onInputChange("plots", selectedFarm.plots || []);
      setIsConferenciaAllPlotsSelected(true);
    } else {
      const sumArea = selectedPlots.reduce((sum: number, p: any) => sum + (parseFloat(p.area || "0") || 0), 0);
      onInputChange("area", sumArea.toFixed(2));
      onInputChange("plots", selectedPlots);
      setIsConferenciaAllPlotsSelected(false);
    }
  };

  const renderFieldsByType = () => {
    switch (formData.type) {
      case "Produto":
        return (
          <ProductOrderForm
            initialProducts={editingOrder ? formData.productsData : undefined}
            onValuesChange={handleValuesChange}
            onProductsChange={(products) => onInputChange("productsData", products as any)}
          />
        );

      case "Serviço":
        return (
          <div>
            <Label htmlFor="service">Serviço</Label>
            <Select value={formData.serviceName} onValueChange={(value) => onInputChange("serviceName", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {availableServices
                  .filter(service => service.status === "Ativo")
                  .map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name} - R$ {service.valorAlqueire}/alqueire
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOrder ? "Editar Pedido" : "Novo Pedido"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingOrder ? "Formulário de edição do pedido" : "Formulário de criação de novo pedido"}
          </DialogDescription>
        </DialogHeader>
        <form key={open ? (editingOrder?.id || 'new-order-clean') : 'closed'} onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer">
                Cliente <span className="text-red-500 font-bold">*</span>
              </Label>
              <CustomerSelect
                value={formData.clientId}
                onValueChange={handleCustomerChange}
                customers={clients}
              />
            </div>
            <div>
              <Label htmlFor="farm">
                Fazenda <span className="text-red-500 font-bold">*</span>
              </Label>
              <FarmSelect
                value={formData.farmId}
                onValueChange={handleFarmChange}
                farms={availableFarms}
                disabled={!formData.clientId}
              />
            </div>
            <div>
              <Label htmlFor="plot">Talhão(ões) do Pedido</Label>
              <PlotSelect
                selectedPlotIds={selectedPlotIds}
                onPlotsChange={handlePlotsChange}
                plots={availablePlots}
                disabled={!formData.farmId}
              />
            </div>
          </div>

          {/* Resumo da Área Selecionada */}
          {formData.area && (
            <div className="flex gap-4 p-2.5 bg-muted/40 rounded-md border text-sm">
              <div>
                Área em Hectares: <strong>{parseFloat(formData.area).toFixed(2)} ha</strong>
              </div>
              <div className="border-l pl-4">
                Área em Alqueires: <strong>{calculatedAlqueires.toFixed(2)} alq</strong>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="type">Tipo do Pedido / Serviço</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                onInputChange("type", value);
                if (value !== "Produto" && value !== "Serviço") {
                  onInputChange("serviceName", value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Amostragem de Solo (AP)">Amostragem de Solo (AP)</SelectItem>
                <SelectItem value="Conferência">Conferência de Amostragem</SelectItem>
                <SelectItem value="Voo de Drone (Mapeamento)">Voo de Drone (Mapeamento)</SelectItem>
                <SelectItem value="Pulverização com Drone">Pulverização com Drone</SelectItem>
                <SelectItem value="Compactação de Solo">Compactação de Solo</SelectItem>
                <SelectItem value="Coleta Foliar">Coleta Foliar</SelectItem>
                <SelectItem value="Aplicação ATV">Aplicação ATV (Sistematização)</SelectItem>
                <SelectItem value="Sistema Equaliza">Sistema Equaliza</SelectItem>
                <SelectItem value="Produto">Venda de Produto</SelectItem>
                <SelectItem value="Serviço">Outro Serviço Avulso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderFieldsByType()}

          {formData.type === "Serviço" && Boolean(formData.serviceName) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Área (ha)</Label>
                <DecimalInput
                  id="area"
                  value={formData.area}
                  onValueChange={(_, normalized) => onInputChange("area", normalized)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Valor Total (R$)</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => onInputChange("value", e.target.value)}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>
          )}

          {/* Subformulários Especializados da Planilha Agronômica com Estabilização */}
          {activeSpecializedService === "Conferência" && (
            <ConferenciaServiceForm
              initialAlqueires={calculatedAlqueires}
              initialNumAnalises={parseInt(formData.productsData?.[0]?.quantity?.toString() || "0")}
              totalFarmAlqueires={currentFarmTotalAlqueires}
              onValuesChange={handleValuesChange}
              onAllPlotsSelectedChange={setIsConferenciaAllPlotsSelected}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {activeSpecializedService === "Coleta Foliar" && (
            <FoliarServiceForm
              initialAlqueires={calculatedAlqueires}
              initialNumPontos={parseInt(formData.productsData?.[0]?.quantity?.toString() || "0")}
              totalFarmAlqueires={currentFarmTotalAlqueires}
              onValuesChange={handleValuesChange}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {activeSpecializedService === "Compactação de Solo" && (
            <CompactionServiceForm
              initialNumPontos={parseInt(formData.productsData?.[0]?.quantity?.toString() || "4")}
              onValuesChange={handleValuesChange}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {activeSpecializedService === "Voo de Drone (Mapeamento)" && (
            <DroneMappingServiceForm
              initialAlqueires={calculatedAlqueires}
              onValuesChange={handleValuesChange}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {activeSpecializedService === "Aplicação ATV" && (
            <ATVServiceForm
              initialAreaHa={parseFloat(formData.area) || 10}
              onValuesChange={handleValuesChange}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {activeSpecializedService === "Amostragem de Solo (AP)" && (
            <SoilSamplingServiceForm
              initialAlqueires={
                editingOrder && formData.productsData?.find((p: any) => p.id === 'servico_ap' || p.type === 'SERVICO_AP')?.quantity
                  ? Number(formData.productsData.find((p: any) => p.id === 'servico_ap' || p.type === 'SERVICO_AP').quantity)
                  : calculatedAlqueires
              }
              initialNumPontos={
                editingOrder && formData.productsData && formData.productsData.length > 0
                  ? formData.productsData
                    .filter((p: any) => p.id === 'analises_completa' || p.id === 'analises_macro' || p.type === 'MACRO+S+P_REM' || p.type === 'MACRO')
                    .reduce((sum: number, p: any) => sum + (parseInt(p.quantity?.toString() || "0") || 0), 0)
                  : 0
              }
              initialProducts={editingOrder ? formData.productsData : undefined}
              isEditing={!!editingOrder}
              onValuesChange={handleValuesChange}
              onAreaChange={(areaHa) => {
                const cur = parseFloat(formData.area || "0") || 0;
                if (Math.abs(cur - areaHa) > 0.05) {
                  onInputChange("area", areaHa.toFixed(2));
                }
              }}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {(activeSpecializedService === "Pulverização" || activeSpecializedService === "Pulverização com Drone") && (
            <DroneSprayingServiceForm
              initialAreaHa={parseFloat(formData.area) || 0}
              onValuesChange={handleValuesChange}
              onProductsChange={(products) => onInputChange("productsData", products)}
            />
          )}

          {(activeSpecializedService === "Sistema Equaliza" || activeSpecializedService === "Equaliza") && (
            <EqualizaServiceForm
              initialAlqueires={calculatedAlqueires}
              onValuesChange={handleValuesChange}
            />
          )}

          {/* Exibição Clara do Total Calculado */}
          {activeSpecializedService && (
            <div className="mt-4 p-3 bg-muted/30 border rounded-md">
              <Label htmlFor="final-value" className="text-sm font-semibold">Valor Total Calculado do Pedido</Label>
              <Input
                id="final-value"
                value={`R$ ${parseFloat(formData.value || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                readOnly
                className="bg-background font-bold text-lg text-primary mt-1"
              />
            </div>
          )}

          {editingOrder && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => onInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment">Pagamento</Label>
                <Select value={formData.payment} onValueChange={(value) => onInputChange("payment", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aguardando">Aguardando</SelectItem>
                    <SelectItem value="Parcial">Parcial</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 pb-1 border-t mt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
            {(() => {
              const numArea = parseFloat(formData.area || "0");
              const isProductOrder = formData.type === "Produto";
              const hasValidProduct =
                !isProductOrder ||
                (Array.isArray(formData.productsData) &&
                  formData.productsData.some((p: any) => p.id && Number(p.quantity) > 0));
              const isInvalid =
                !formData.clientId ||
                !formData.farmId ||
                !formData.area ||
                isNaN(numArea) ||
                numArea <= 0 ||
                !hasValidProduct;
              return (
                <Button
                  type="submit"
                  disabled={isInvalid}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    !hasValidProduct
                      ? "Selecione ao menos um produto válido para prosseguir"
                      : isInvalid
                      ? "Preencha cliente, fazenda e uma área válida para prosseguir"
                      : ""
                  }
                >
                  {editingOrder ? "Atualizar Pedido" : "Criar Pedido"}
                </Button>
              );
            })()}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
