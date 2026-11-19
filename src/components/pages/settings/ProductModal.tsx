import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "../../../hooks/useProducts";
import { Package, DollarSign, Tag, Building2, AlertTriangle } from "lucide-react";

interface ProductModalProps {
  showProductForm: boolean;
  setShowProductForm: (value: boolean) => void;
  editingProduct: Product | null;
  productFormData: Product;
  handleProductSubmit: (e: React.FormEvent) => void;
  resetProductForm: () => void;
  handleProductInputChange: (field: keyof Product, value: any) => void;
}

const CATEGORIES = [
  "Corretivo",
  "Fertilizante",
  "Biológico",
  "Adjuvante",
  "Defensivo",
  "Semente",
  "Outro",
];

const UNITS = [
  { value: "Ton", label: "Tonelada (Ton)" },
  { value: "Kg", label: "Quilograma (Kg)" },
  { value: "L", label: "Litro (L)" },
  { value: "sc", label: "Saco (sc)" },
  { value: "un", label: "Unidade (un)" },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  showProductForm,
  setShowProductForm,
  editingProduct,
  productFormData,
  handleProductSubmit,
  resetProductForm,
  handleProductInputChange,
}) => {
  return (
    <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Package className="h-5 w-5 text-emerald-600" />
            {editingProduct ? "Editar Produto" : "Novo Produto / Insumo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleProductSubmit} className="space-y-4 pt-2">
          {/* Linha 1: Nome e Código */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="prod-name" className="text-xs font-semibold">Nome do Produto *</Label>
              <Input
                id="prod-name"
                value={productFormData.name}
                onChange={(e) => handleProductInputChange("name", e.target.value)}
                placeholder="Ex: Calcário Dolomítico, Gesso Agrícola..."
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="prod-code" className="text-xs font-semibold">Código / SKU</Label>
              <Input
                id="prod-code"
                value={productFormData.code || ""}
                onChange={(e) => handleProductInputChange("code", e.target.value)}
                placeholder="Ex: CALC-DOL"
                className="mt-1"
              />
            </div>
          </div>

          {/* Linha 2: Categoria, Unidade e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold">Categoria</Label>
              <Select
                value={productFormData.category || "Corretivo"}
                onValueChange={(val) => handleProductInputChange("category", val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Unidade de Medida</Label>
              <Select
                value={productFormData.unit || "Ton"}
                onValueChange={(val) => handleProductInputChange("unit", val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Status</Label>
              <Select
                value={productFormData.status || "Ativo"}
                onValueChange={(value) => handleProductInputChange("status", value)}
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
          </div>

          {/* Linha 3: Preços */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Preços e Precificação
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost-price" className="text-xs">Preço de Custo / Compra (R$)</Label>
                <Input
                  id="cost-price"
                  type="number"
                  step="0.01"
                  value={productFormData.costPrice ?? 0}
                  onChange={(e) => handleProductInputChange("costPrice", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="mt-1"
                />
                <span className="text-[11px] text-muted-foreground">Valor pago ao fornecedor</span>
              </div>
              <div>
                <Label htmlFor="sale-price" className="text-xs">Preço de Venda / Aplicação (R$) *</Label>
                <Input
                  id="sale-price"
                  type="number"
                  step="0.01"
                  value={productFormData.valuePerUnit ?? productFormData.unitValue ?? 0}
                  onChange={(e) => handleProductInputChange("valuePerUnit", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
                <span className="text-[11px] text-muted-foreground">Valor cobrado no pedido do produtor</span>
              </div>
            </div>
          </div>

          {/* Linha 4: Estoque e Estoque Mínimo */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Package className="h-4 w-4 text-emerald-600" />
                  Controle de Estoque Físico da Preciza
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {productFormData.controlsStock
                    ? "A Preciza mantém estoque físico deste produto em galpão/armazém (ex: Biológicos, Adjuvantes)."
                    : "Insumo de serviço (ex: Calcário, Gesso, Cama de Frango, Esterco). A Preciza apenas aplica; o produto é fornecido pelo produtor ou entregue direto na fazenda."}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <input
                  type="checkbox"
                  id="controls-stock-toggle"
                  checked={productFormData.controlsStock ?? false}
                  onChange={(e) => handleProductInputChange("controlsStock", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <Label htmlFor="controls-stock-toggle" className="text-xs cursor-pointer font-medium whitespace-nowrap">
                  {productFormData.controlsStock ? "Controlar Estoque" : "Sem Estoque Próprio"}
                </Label>
              </div>
            </div>

            {productFormData.controlsStock ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="prod-quantity" className="text-xs">Saldo Atual em Estoque ({productFormData.unit || "un"})</Label>
                  <Input
                    id="prod-quantity"
                    type="number"
                    step="0.01"
                    value={productFormData.quantity ?? 0}
                    onChange={(e) => handleProductInputChange("quantity", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                  <span className="text-[11px] text-muted-foreground">Quantidade física disponível</span>
                </div>
                <div>
                  <Label htmlFor="min-stock" className="text-xs">Estoque Mínimo para Alerta ({productFormData.unit || "un"})</Label>
                  <Input
                    id="min-stock"
                    type="number"
                    step="0.01"
                    value={productFormData.minStock ?? 0}
                    onChange={(e) => handleProductInputChange("minStock", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                  <span className="text-[11px] text-muted-foreground">Avisa quando o saldo ficar menor ou igual</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded border border-emerald-200 dark:border-emerald-900/50">
                ✓ <strong>Insumo do Produtor / Aplicação em Serviço:</strong> Este produto não gera saldo de estoque na Preciza nem entra no cálculo do valor do inventário.
              </div>
            )}
          </div>

          {/* Linha 5: Fornecedor e Observações */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="prod-supplier" className="text-xs font-semibold">Fornecedor / Fabricante</Label>
              <Input
                id="prod-supplier"
                value={productFormData.supplier || ""}
                onChange={(e) => handleProductInputChange("supplier", e.target.value)}
                placeholder="Ex: Mineração Bela Vista, Mosaic, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prod-desc" className="text-xs font-semibold">Descrição / Especificações Técnicas</Label>
              <Textarea
                id="prod-desc"
                rows={2}
                value={productFormData.description || ""}
                onChange={(e) => handleProductInputChange("description", e.target.value)}
                placeholder="Ex: Teor de Mg > 12%, PRNT 85%, granulometria fina..."
                className="mt-1 resize-none text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={resetProductForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
