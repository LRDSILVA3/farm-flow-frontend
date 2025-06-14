
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Fazenda } from "../FazendasPage";

interface FazendaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFazenda: Fazenda | null;
  formData: Fazenda;
  onInputChange: (field: keyof Fazenda, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDeleteTalhao?: (fazendaId: string, talhaoId: string) => void;
}

export const FazendaForm = ({
  open,
  onOpenChange,
  editingFazenda,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  onDeleteTalhao
}: FazendaFormProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Inativo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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

          {editingFazenda && formData.talhoes.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-4">Talhões da Fazenda</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Área (ha)</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.talhoes.map((talhao) => (
                    <TableRow key={talhao.id}>
                      <TableCell className="font-medium">{talhao.nome}</TableCell>
                      <TableCell>{talhao.area}</TableCell>
                      <TableCell>{talhao.cidade}</TableCell>
                      <TableCell>{talhao.estado}</TableCell>
                      <TableCell>{talhao.matricula}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(talhao.status)}`}>
                          {talhao.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {onDeleteTalhao && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteTalhao(formData.id, talhao.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
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
