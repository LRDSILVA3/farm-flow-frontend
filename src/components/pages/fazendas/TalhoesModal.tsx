
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { Fazenda, Talhao } from "../FazendasPage";
import { useState } from "react";

interface TalhoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fazenda: Fazenda | null;
  talhaoForm: Talhao;
  setTalhaoForm: (talhao: Talhao) => void;
  onAddTalhao: (fazendaId: string) => void;
  onDeleteTalhao: (fazendaId: string, talhaoId: string) => void;
}

export const TalhoesModal = ({
  open,
  onOpenChange,
  fazenda,
  talhaoForm,
  setTalhaoForm,
  onAddTalhao,
  onDeleteTalhao
}: TalhoesModalProps) => {
  const [showTalhaoForm, setShowTalhaoForm] = useState(false);
  const [editingTalhao, setEditingTalhao] = useState<Talhao | null>(null);

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

  const handleAddTalhao = (e: React.FormEvent) => {
    e.preventDefault();
    if (fazenda) {
      onAddTalhao(fazenda.id);
      setTalhaoForm({
        id: "",
        nome: "",
        area: "",
        status: "Ativo",
        cidade: "",
        estado: "",
        matricula: ""
      });
      setShowTalhaoForm(false);
      setEditingTalhao(null);
    }
  };

  const handleEditTalhao = (talhao: Talhao) => {
    setEditingTalhao(talhao);
    setTalhaoForm(talhao);
    setShowTalhaoForm(true);
  };

  const handleCancel = () => {
    setTalhaoForm({
      id: "",
      nome: "",
      area: "",
      status: "Ativo",
      cidade: "",
      estado: "",
      matricula: "",
      lote: ""
    });
    setShowTalhaoForm(false);
    setEditingTalhao(null);
  };

  if (!fazenda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Talhões de {fazenda.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {fazenda.talhoes.length} talhão{fazenda.talhoes.length !== 1 ? 'es' : ''} cadastrado{fazenda.talhoes.length !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={() => setShowTalhaoForm(!showTalhaoForm)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Talhão
            </Button>
          </div>

          {showTalhaoForm && (
            <form onSubmit={handleAddTalhao} className="bg-gray-50 p-4 rounded-lg border">
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
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingTalhao ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          )}

          {fazenda.talhoes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum talhão cadastrado para esta fazenda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Área (ha)</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fazenda.talhoes.map((talhao) => (
                  <TableRow key={talhao.id}>
                    <TableCell className="font-medium">{talhao.nome}</TableCell>
                    <TableCell>{talhao.area}</TableCell>
                    <TableCell>{talhao.cidade}</TableCell>
                    <TableCell>{talhao.estado}</TableCell>
                    <TableCell>{talhao.matricula}</TableCell>
                    <TableCell>{talhao.lote}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(talhao.status)}`}>
                        {talhao.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTalhao(talhao)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteTalhao(fazenda.id, talhao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
