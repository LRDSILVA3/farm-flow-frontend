import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "../../../hooks/useServices";
import { Product } from "../../../hooks/useProducts";
import { Settings, Plus, X, Package, Check } from "lucide-react";

interface ServiceModalProps {
  showServiceForm: boolean;
  setShowServiceForm: (value: boolean) => void;
  editingService: Service | null;
  serviceFormData: Service;
  handleServiceSubmit: (e: React.FormEvent) => void;
  resetServiceForm: () => void;
  handleServiceInputChange: (field: keyof Service, value: any) => void;
  availableProducts?: Product[];
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  showServiceForm,
  setShowServiceForm,
  editingService,
  serviceFormData,
  handleServiceSubmit,
  resetServiceForm,
  handleServiceInputChange,
  availableProducts = [],
}) => {
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>("");

  const currentProductIds = serviceFormData.product_ids || [];

  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    if (!currentProductIds.includes(selectedProductToAdd)) {
      const nextIds = [...currentProductIds, selectedProductToAdd];
      handleServiceInputChange("product_ids", nextIds);

      // Also sync string description of products
      const nextNames = nextIds
        .map((id) => availableProducts.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      handleServiceInputChange("products", nextNames);
    }
    setSelectedProductToAdd("");
  };

  const handleRemoveProduct = (productId: string) => {
    const nextIds = currentProductIds.filter((id) => id !== productId);
    handleServiceInputChange("product_ids", nextIds);

    const nextNames = nextIds
      .map((id) => availableProducts.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    handleServiceInputChange("products", nextNames);
  };

  const unselectedProducts = availableProducts.filter(
    (p) => !currentProductIds.includes(p.id) && p.status === "Ativo"
  );

  return (
    <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Settings className="h-5 w-5 text-emerald-600" />
            {editingService ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure dados operacionais, precificação e produtos vinculados à operação
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleServiceSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-nome" className="text-xs font-semibold">Nome do Serviço *</Label>
              <Input
                id="service-nome"
                value={serviceFormData.name}
                onChange={(e) => handleServiceInputChange("name", e.target.value)}
                placeholder="Ex: Aplicação ATV, Pulverização Drone..."
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="valorAlqueire" className="text-xs font-semibold">Valor Base por Alqueire (R$) *</Label>
              <Input
                id="valorAlqueire"
                type="number"
                step="0.01"
                value={serviceFormData.valuePerAlqueire}
                onChange={(e) => handleServiceInputChange("valuePerAlqueire", e.target.value)}
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-xs font-semibold">Status do Serviço</Label>
              <Select
                value={serviceFormData.status || "Ativo"}
                onValueChange={(value) => handleServiceInputChange("status", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center pt-6">
              <span className="text-xs text-muted-foreground">
                {serviceFormData.isFixed
                  ? "🔒 Serviço padrão do sistema (cálculo automatizado via planilha)"
                  : "Serviço personalizado"}
              </span>
            </div>
          </div>

          {/* Vínculo de Produtos */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-emerald-600" />
                  Produtos / Insumos Vinculados
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Produtos que podem ser aplicados ou distribuídos neste serviço (ex: Calcário Dolomítico, Gesso, etc.)
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {currentProductIds.length} vinculado(s)
              </span>
            </div>

            {/* Adicionar Produto */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedProductToAdd}
                onValueChange={setSelectedProductToAdd}
              >
                <SelectTrigger className="flex-1 text-xs h-9 bg-white dark:bg-slate-950">
                  <SelectValue placeholder="Selecione um produto do catálogo para vincular..." />
                </SelectTrigger>
                <SelectContent>
                  {unselectedProducts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum outro produto ativo disponível
                    </SelectItem>
                  ) : (
                    unselectedProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.code ? `(${p.code})` : ""} - {p.unit} (Estoque: {p.quantity})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 h-9 text-xs gap-1"
                onClick={handleAddProduct}
                disabled={!selectedProductToAdd || selectedProductToAdd === "none"}
              >
                <Plus className="h-3.5 w-3.5" />
                Vincular
              </Button>
            </div>

            {/* Badges de Produtos Vinculados */}
            <div className="min-h-[50px] p-2.5 bg-white dark:bg-slate-950 rounded-md border flex flex-wrap gap-1.5 items-center">
              {currentProductIds.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  Nenhum produto vinculado a este serviço ainda. (Serviços sem produto, como amostragem, podem ficar vazios).
                </span>
              ) : (
                currentProductIds.map((id) => {
                  const prod = availableProducts.find((p) => p.id === id);
                  const name = prod?.name || id;
                  const unit = prod?.unit ? ` (${prod.unit})` : "";
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="px-2.5 py-1 text-xs gap-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {name}{unit}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(id)}
                        className="text-muted-foreground hover:text-destructive ml-0.5"
                        title="Desvincular produto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={resetServiceForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {editingService ? "Atualizar Serviço" : "Criar Serviço"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
