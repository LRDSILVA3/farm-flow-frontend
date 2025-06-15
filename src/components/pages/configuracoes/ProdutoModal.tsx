
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Produto } from "./useProdutos";

interface ProdutoModalProps {
  showProdutoForm: boolean;
  setShowProdutoForm: (value: boolean) => void;
  editingProduto: Produto | null;
  produtoFormData: Produto;
  handleProdutoSubmit: (e: React.FormEvent) => void;
  resetProdutoForm: () => void;
  handleProdutoInputChange: (field: keyof Produto, value: string) => void;
}

export const ProdutoModal: React.FC<ProdutoModalProps> = ({
  showProdutoForm,
  setShowProdutoForm,
  editingProduto,
  produtoFormData,
  handleProdutoSubmit,
  resetProdutoForm,
  handleProdutoInputChange
}) => {
  return (
    <Dialog open={showProdutoForm} onOpenChange={setShowProdutoForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingProduto ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleProdutoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="produtoNome">Nome do Produto</Label>
              <Input
                id="produtoNome"
                value={produtoFormData.nome}
                onChange={(e) => handleProdutoInputChange("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="valorUn">Valor Unitário</Label>
              <Input
                id="valorUn"
                type="number"
                step="0.01"
                value={produtoFormData.valorUn}
                onChange={(e) => handleProdutoInputChange("valorUn", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="produtoStatus">Status</Label>
            <Select value={produtoFormData.status} onValueChange={(value) => handleProdutoInputChange("status", value)}>
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
            <Button type="button" variant="outline" onClick={resetProdutoForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingProduto ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
