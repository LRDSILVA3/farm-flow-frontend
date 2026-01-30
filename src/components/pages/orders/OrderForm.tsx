import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { CustomerSelect } from "../farms/CustomerSelect";
import { FarmSelect } from "./FarmSelect";
import { PlotSelect } from "./PlotSelect";
import { ConferenciaServiceForm } from "./ConferenciaServiceForm";
import React, { useMemo } from "react";
import { useClients } from "@/hooks/useClients";
import { useFarms, Plot } from "@/hooks/useFarms";

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
  const [selectedPlot, setSelectedPlot] = React.useState<string>("todos");
  const { clients } = useClients();
  const { farms } = useFarms();

  const allPlots = useMemo(() => farms.flatMap(farm => farm.plots.map(plot => ({ ...plot, farm_id: farm.id }))), [farms]);

  const availableFarms = useMemo(() => {
    if (!formData.clientId) return [];
    return farms.filter(farm => farm.clientId === formData.clientId);
  }, [farms, formData.clientId]);

  const availablePlots = useMemo(() => {
    if (!formData.farmId) return [];
    const selectedFarm = farms.find(farm => farm.id === formData.farmId);
    return selectedFarm ? selectedFarm.plots : [];
  }, [farms, formData.farmId]);

  const availableServices = [
    { id: "1", name: "Pulverização", valorAlqueire: "200.00", status: "Ativo" },
    { id: "2", name: "Plantio", valorAlqueire: "150.00", status: "Ativo" },
    { id: "3", name: "Colheita", valorAlqueire: "180.00", status: "Ativo" },
    { id: "4", name: "Adubação", valorAlqueire: "120.00", status: "Ativo" }
  ];

  const availableProducts = [
    { id: "1", name: "Defensivo A", valorUn: "45.00" },
    { id: "2", name: "Sementes Milho", valorUn: "120.00" },
    { id: "3", name: "Fertilizante NPK", valorUn: "80.00" },
    { id: "4", name: "Herbicida", valorUn: "65.00" }
  ];

  const availableServiceGroups = [
    { id: "1", name: "Pacote Completo", description: "Pulverização + Plantio + Colheita" },
    { id: "2", name: "Pacote Básico", description: "Pulverização + Adubação" }
  ];

  const addProduct = () => {
    const newProducts = [...(formData.productsData || []), { id: "", name: "", quantity: 1 }];
    onInputChange("productsData", newProducts);
  };

  const removeProduct = (index: number) => {
    const newProducts = (formData.productsData || []).filter((_, i) => i !== index);
    onInputChange("productsData", newProducts);
  };

  const updateProduct = (index: number, field: string, value: string | number) => {
    const newProducts = [...(formData.productsData || [])];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onInputChange("productsData", newProducts);
  };

  const handleCustomerChange = (id: string) => {
    onInputChange("clientId", id);
    onInputChange("farmId", "");
    setSelectedPlot("todos");
    onInputChange("area", "");
  };

  const handleFarmChange = (id: string) => {
    onInputChange("farmId", id);
    setSelectedPlot("todos");
    const selectedFarm = farms.find(farm => farm.id === id);
    if (selectedFarm) {
      const totalArea = selectedFarm.plots.reduce((sum, p) => sum + parseFloat(p.area), 0);
      onInputChange("area", totalArea.toString());
    } else {
      onInputChange("area", "");
    }
  };

  const handlePlotChange = (plotId: string) => {
    setSelectedPlot(plotId);
    const selectedFarm = farms.find(f => f.id === formData.farmId);
    if (!selectedFarm) return;

    if (plotId === "todos") {
      const totalArea = selectedFarm.plots.reduce((sum, p) => sum + parseFloat(p.area), 0);
      onInputChange("area", totalArea.toString());
    } else {
      const plot = selectedFarm.plots.find(p => p.id === plotId);
      onInputChange("area", plot ? plot.area : "");
    }
  };

  const renderFieldsByType = () => {
    switch (formData.type) {
      case "Produto":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Produtos</Label>
              <Button type="button" size="sm" onClick={addProduct}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
            {(formData.productsData || []).map((product, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <Label>Produto</Label>
                  <Select 
                    value={product.id} 
                    onValueChange={(value) => {
                      const selectedProduct = availableProducts.find(p => p.id === value);
                      updateProduct(index, "id", value);
                      updateProduct(index, "name", selectedProduct?.name || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.valorUn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={product.quantity}
                    onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div></div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
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
                  <SelectItem value="Conferência">Conferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "Grupo de Serviços":
        return (
          <div>
            <Label htmlFor="serviceGroup">Grupo de Serviços</Label>
            <Select value={formData.serviceGroup} onValueChange={(value) => onInputChange("serviceGroup", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {availableServiceGroups.map((group) => (
                  <SelectItem key={group.id} value={group.name}>
                    {group.name} - {group.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "Conferência":
        return null; // Rendered separately below


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
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <CustomerSelect
                value={formData.clientId}
                onValueChange={handleCustomerChange}
                customers={clients}
              />
            </div>
            <div>
              <Label htmlFor="farm">Fazenda</Label>
              <FarmSelect
                value={formData.farmId}
                onValueChange={handleFarmChange}
                farms={availableFarms}
                disabled={!formData.clientId}
              />
            </div>
            <div>
              <Label htmlFor="plot">Talhão</Label>
              <PlotSelect
                value={selectedPlot}
                onValueChange={handlePlotChange}
                plots={availablePlots}
                disabled={!formData.farmId}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => onInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Produto">Produto</SelectItem>
                <SelectItem value="Serviço">Serviço</SelectItem>
                <SelectItem value="Grupo de Serviços">Grupo de Serviços</SelectItem>
                <SelectItem value="Conferência">Conferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderFieldsByType()}
          
          {formData.type !== "Conferência" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Área (ha)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => onInputChange("area", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => onInputChange("value", e.target.value)}
                  placeholder="R$ 0,00"
                  required
                  readOnly={formData.type === "Conferência"}
                />
              </div>
            </div>
          )}

          {/* ConferenciaServiceForm moved here */}
          {formData.type === "Conferência" && (
            <ConferenciaServiceForm
              initialAlqueires={((parseFloat(formData.area) || 0) / 2.42)}
              initialNumAnalises={parseInt(formData.productsData?.[0]?.quantity?.toString() || "0")}
              onValuesChange={(calculatedValue) => onInputChange("value", calculatedValue.toFixed(2))}
            />
          )}

          {/* Display final value when type is Conferencia */}
          {formData.type === "Conferência" && (
            <div className="mt-4">
              <Label htmlFor="final-value">Valor Total (R$)</Label>
              <Input
                id="final-value"
                value={formData.value}
                readOnly
                className="bg-gray-100"
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
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingOrder ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
