
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "../../../hooks/useProducts";

interface ProductModalProps {
  showProductForm: boolean;
  setShowProductForm: (value: boolean) => void;
  editingProduct: Product | null;
  productFormData: Product;
  handleProductSubmit: (e: React.FormEvent) => void;
  resetProductForm: () => void;
  handleProductInputChange: (field: keyof Product, value: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  showProductForm,
  setShowProductForm,
  editingProduct,
  productFormData,
  handleProductSubmit,
  resetProductForm,
  handleProductInputChange
}) => {
  return (
    <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={productFormData.name}
                onChange={(e) => handleProductInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unitValue">Valor Unitário</Label>
              <Input
                id="unitValue"
                type="number"
                step="0.01"
                value={productFormData.unitValue}
                onChange={(e) => handleProductInputChange("unitValue", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={productFormData.status} onValueChange={(value) => handleProductInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetProductForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingProduct ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
