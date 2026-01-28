import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Order } from "../OrdersPage";
import { CustomerSelect } from "../farms/CustomerSelect";
import { FarmSelect } from "./FarmSelect";

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
  onCancel
}: OrderFormProps) => {
  // Lista de clientes (mock - em produção viria de uma API)
  const availableCustomers = [
    { id: "1", cpf: "123.456.789-00", name: "João Silva", email: "joao@email.com" },
    { id: "2", cpf: "987.654.321-00", name: "Maria Santos", email: "maria@email.com" },
    { id: "3", cpf: "456.789.123-00", name: "Pedro Oliveira", email: "pedro@email.com" }
  ];

  // Lista de fazendas (mock - em produção viria de uma API)
  const allFarms = [
    { id: "1", name: "Fazenda São João", owner: "João Silva", area: "100", location: "Interior SP" },
    { id: "2", name: "Fazenda Santa Maria", owner: "Maria Santos", area: "200", location: "Interior MG" },
    { id: "3", name: "Fazenda Boa Vista", owner: "Pedro Oliveira", area: "150", location: "Interior GO" },
    { id: "4", name: "Fazenda Esperança", owner: "João Silva", area: "80", location: "Interior SP" },
    { id: "5", name: "Fazenda Progresso", owner: "Maria Santos", area: "120", location: "Interior MG" }
  ];

  // Filtrar fazendas baseado no cliente selecionado
  const availableFarms = formData.customer 
    ? allFarms.filter(farm => farm.owner === formData.customer)
    : allFarms;

  // Lista de serviços disponíveis
  const availableServices = [
    { id: "1", name: "Pulverização", valorAlqueire: "200.00", status: "Ativo" },
    { id: "2", name: "Plantio", valorAlqueire: "150.00", status: "Ativo" },
    { id: "3", name: "Colheita", valorAlqueire: "180.00", status: "Ativo" },
    { id: "4", name: "Adubação", valorAlqueire: "120.00", status: "Ativo" }
  ];

  // Lista de produtos disponíveis
  const availableProducts = [
    { id: "1", name: "Defensivo A", valorUn: "45.00" },
    { id: "2", name: "Sementes Milho", valorUn: "120.00" },
    { id: "3", name: "Fertilizante NPK", valorUn: "80.00" },
    { id: "4", name: "Herbicida", valorUn: "65.00" }
  ];

  // Lista de grupos de serviços disponíveis
  const availableServiceGroups = [
    { id: "1", name: "Pacote Completo", description: "Pulverização + Plantio + Colheita" },
    { id: "2", name: "Pacote Básico", description: "Pulverização + Adubação" }
  ];

  const addProduct = () => {
    const newProducts = [...formData.products, { id: "", name: "", quantity: 1 }];
    onInputChange("products", newProducts);
  };

  const removeProduct = (index: number) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    onInputChange("products", newProducts);
  };

  const updateProduct = (index: number, field: string, value: string | number) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onInputChange("products", newProducts);
  };

  const handleCustomerChange = (value: string) => {
    onInputChange("customer", value);
    // Limpar fazenda selecionada quando cliente mudar
    if (formData.farm) {
      onInputChange("farm", "");
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
            {formData.products.map((product, index) => (
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
            <Select value={formData.service} onValueChange={(value) => onInputChange("service", value)}>
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

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOrder ? "Editar Pedido" : "Novo Pedido"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <CustomerSelect
                value={formData.customer}
                onValueChange={handleCustomerChange}
                clientes={availableCustomers}
              />
            </div>
            <div>
              <Label htmlFor="farm">Fazenda</Label>
              <FarmSelect
                value={formData.farm}
                onValueChange={(value) => onInputChange("farm", value)}
                farms={availableFarms}
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
              </SelectContent>
            </Select>
          </div>

          {renderFieldsByType()}
          
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
              />
            </div>
          </div>
          
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
