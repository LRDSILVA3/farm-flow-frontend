
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Fazenda } from "../FazendasPage";

interface FazendaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFazenda: Fazenda | null;
  formData: Fazenda;
  onInputChange: (field: keyof Fazenda, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const FazendaForm = ({
  open,
  onOpenChange,
  editingFazenda,
  formData,
  onInputChange,
  onSubmit,
  onCancel
}: FazendaFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingFazenda ? "Editar Fazenda" : "Nova Fazenda"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Fazenda</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => onInputChange("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="proprietario">Proprietário</Label>
              <Input
                id="proprietario"
                value={formData.proprietario}
                onChange={(e) => onInputChange("proprietario", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Área Total (ha)</Label>
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
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) => onInputChange("localizacao", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                value={formData.contato}
                onChange={(e) => onInputChange("contato", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingFazenda ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
