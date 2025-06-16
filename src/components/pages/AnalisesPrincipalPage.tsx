
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnaliseExecucao {
  id: string;
  nomeAnalise: string;
  colaborador: string;
  quantidade: number;
  status: "Pendente" | "Enviado" | "Recebido" | "Executando" | "Finalizado";
  dataEnvio: string;
  dataRecebimento: string;
  dataFinalizacao: string;
}

const AnalisesPrincipalPage = () => {
  const { toast } = useToast();
  const [analises, setAnalises] = useState<AnaliseExecucao[]>([
    {
      id: "1",
      nomeAnalise: "Macro",
      colaborador: "João Silva",
      quantidade: 5,
      status: "Executando",
      dataEnvio: "2024-01-15",
      dataRecebimento: "2024-01-17",
      dataFinalizacao: ""
    },
    {
      id: "2",
      nomeAnalise: "Foliar",
      colaborador: "Maria Santos",
      quantidade: 3,
      status: "Finalizado",
      dataEnvio: "2024-01-10",
      dataRecebimento: "2024-01-12",
      dataFinalizacao: "2024-01-18"
    },
    {
      id: "3",
      nomeAnalise: "Compactação",
      colaborador: "João Silva",
      quantidade: 2,
      status: "Pendente",
      dataEnvio: "",
      dataRecebimento: "",
      dataFinalizacao: ""
    }
  ]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseExecucao | null>(null);
  const [formData, setFormData] = useState<AnaliseExecucao>({
    id: "",
    nomeAnalise: "",
    colaborador: "",
    quantidade: 0,
    status: "Pendente",
    dataEnvio: "",
    dataRecebimento: "",
    dataFinalizacao: ""
  });

  const handleEdit = (analise: AnaliseExecucao) => {
    setEditingAnalise(analise);
    setFormData(analise);
    setShowEditModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setAnalises(prev => prev.map(a => a.id === editingAnalise?.id ? formData : a));
    toast({
      title: "Análise atualizada",
      description: "A análise foi atualizada com sucesso.",
    });
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      nomeAnalise: "",
      colaborador: "",
      quantidade: 0,
      status: "Pendente",
      dataEnvio: "",
      dataRecebimento: "",
      dataFinalizacao: ""
    });
    setEditingAnalise(null);
    setShowEditModal(false);
  };

  const handleInputChange = (field: keyof AnaliseExecucao, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente": return "secondary";
      case "Enviado": return "outline";
      case "Recebido": return "default";
      case "Executando": return "default";
      case "Finalizado": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
        <p className="text-gray-600">Acompanhamento das análises em execução</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Análises</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Análise</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Data de Recebimento</TableHead>
                <TableHead>Data de Finalização</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analises.map((analise) => (
                <TableRow key={analise.id}>
                  <TableCell className="font-medium">{analise.nomeAnalise}</TableCell>
                  <TableCell>{analise.colaborador}</TableCell>
                  <TableCell>{analise.quantidade}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(analise.status)}>
                      {analise.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{analise.dataEnvio || "-"}</TableCell>
                  <TableCell>{analise.dataRecebimento || "-"}</TableCell>
                  <TableCell>{analise.dataFinalizacao || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(analise)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Análise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Enviado">Enviado</SelectItem>
                    <SelectItem value="Recebido">Recebido</SelectItem>
                    <SelectItem value="Executando">Executando</SelectItem>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => handleInputChange("quantidade", parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataEnvio">Data de Envio</Label>
                <Input
                  id="dataEnvio"
                  type="date"
                  value={formData.dataEnvio}
                  onChange={(e) => handleInputChange("dataEnvio", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataRecebimento">Data de Recebimento</Label>
                <Input
                  id="dataRecebimento"
                  type="date"
                  value={formData.dataRecebimento}
                  onChange={(e) => handleInputChange("dataRecebimento", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFinalizacao">Data de Finalização</Label>
              <Input
                id="dataFinalizacao"
                type="date"
                value={formData.dataFinalizacao}
                onChange={(e) => handleInputChange("dataFinalizacao", e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Atualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisesPrincipalPage;
