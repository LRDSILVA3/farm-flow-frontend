import { FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VariavelCusto } from "./useVariaveisCusto";

interface VariavelCustoModalProps {
  showVariavelForm: boolean;
  resetVariavelForm: () => void;
  editingVariavel: VariavelCusto | null;
  variavelFormData: VariavelCusto;
  handleVariavelInputChange: (field: keyof VariavelCusto, value: string | number) => void;
  handleVariavelSubmit: (e: FormEvent) => void;
}

export const VariavelCustoModal: React.FC<VariavelCustoModalProps> = ({
  showVariavelForm,
  resetVariavelForm,
  editingVariavel,
  variavelFormData,
  handleVariavelInputChange,
  handleVariavelSubmit
}) => {
  return (
    <Dialog open={showVariavelForm} onOpenChange={(open) => !open && resetVariavelForm()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingVariavel ? "Editar Variável de Custo" : "Nova Variável de Custo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleVariavelSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={variavelFormData.nome}
                onChange={(e) => handleVariavelInputChange("nome", e.target.value)}
                placeholder="Ex: Valor por Alqueire"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={variavelFormData.codigo}
                onChange={(e) => handleVariavelInputChange("codigo", e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="Ex: valor_alqueire"
                required
              />
              <p className="text-xs text-muted-foreground">
                Código único usado nos cálculos (sem espaços)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={variavelFormData.valor}
                onChange={(e) => handleVariavelInputChange("valor", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={variavelFormData.descricao}
                onChange={(e) => handleVariavelInputChange("descricao", e.target.value)}
                placeholder="Descrição da variável e como ela é utilizada"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetVariavelForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingVariavel ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
