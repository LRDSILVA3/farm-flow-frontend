
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Plantado":
        return "bg-green-100 text-green-800";
      case "Colheita":
        return "bg-orange-100 text-orange-800";
      case "Preparando":
        return "bg-yellow-100 text-yellow-800";
      case "Produção":
        return "bg-blue-100 text-blue-800";
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
        status: "Preparando"
      });
      setShowTalhaoForm(false);
    }
  };

  const handleCancel = () => {
    setTalhaoForm({
      id: "",
      nome: "",
      area: "",
      status: "Preparando"
    });
    setShowTalhaoForm(false);
  };

  if (!fazenda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
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
              <h5 className="font-medium mb-4">Adicionar Novo Talhão</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="talhaoNome">Nome do Talhão</Label>
                  <Input
                    id="talhaoNome"
                    value={talhaoForm.nome}
                    onChange={(e) => setTalhaoForm(prev => ({ ...prev, nome: e.target.value }))}
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
                    onChange={(e) => setTalhaoForm(prev => ({ ...prev, area: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="talhaoStatus">Status</Label>
                <Select value={talhaoForm.status} onValueChange={(value) => setTalhaoForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preparando">Preparando</SelectItem>
                    <SelectItem value="Plantado">Plantado</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                    <SelectItem value="Colheita">Colheita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Adicionar
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
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fazenda.talhoes.map((talhao) => (
                  <TableRow key={talhao.id}>
                    <TableCell className="font-medium">{talhao.nome}</TableCell>
                    <TableCell>{talhao.area}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(talhao.status)}`}>
                        {talhao.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTalhao(fazenda.id, talhao.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
