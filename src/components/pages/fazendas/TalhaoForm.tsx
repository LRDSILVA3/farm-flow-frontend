
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Talhao } from "../FazendasPage";

interface TalhaoFormProps {
  talhaoForm: Talhao;
  setTalhaoForm: (talhao: Talhao) => void;
  editingTalhao: Talhao | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const TalhaoForm = ({
  talhaoForm,
  setTalhaoForm,
  editingTalhao,
  onSubmit,
  onCancel
}: TalhaoFormProps) => {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-4 rounded-lg border">
      <h5 className="font-medium mb-4">
        {editingTalhao ? "Editar Talhão" : "Adicionar Novo Talhão"}
      </h5>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="talhaoNome">Nome do Talhão</Label>
          <Input
            id="talhaoNome"
            value={talhaoForm.nome}
            onChange={(e) => setTalhaoForm({ ...talhaoForm, nome: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="talhaoArea">Área (ha)</Label>
          <Input
            id="talhaoArea"
            type="number"
            step="0.1"
            value={talhaoForm.area}
            onChange={(e) => setTalhaoForm({ ...talhaoForm, area: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="talhaoCidade">Cidade</Label>
          <Input
            id="talhaoCidade"
            value={talhaoForm.cidade}
            onChange={(e) => setTalhaoForm({ ...talhaoForm, cidade: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="talhaoEstado">Estado</Label>
          <Input
            id="talhaoEstado"
            value={talhaoForm.estado}
            onChange={(e) => setTalhaoForm({ ...talhaoForm, estado: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="talhaoMatricula">Matrícula</Label>
          <Input
            id="talhaoMatricula"
            value={talhaoForm.matricula}
            onChange={(e) => setTalhaoForm({ ...talhaoForm, matricula: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="talhaoLote">Lote</Label>
          <Input
            id="talhaoLote"
            value={talhaoForm.lote}
            onChange={(e) => setTalhaoForm({ ...talhaoForm, lote: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="talhaoStatus">Status</Label>
          <Select value={talhaoForm.status} onValueChange={(value) => setTalhaoForm({ ...talhaoForm, status: value })}>
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
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {editingTalhao ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
};
