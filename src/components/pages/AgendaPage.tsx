import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, MapPin, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Execucao {
  id: string;
  cliente: string;
  fazenda: string;
  servico: string;
  area: string;
  dataAgendada: string;
  equipamento: string;
  status: string;
  execucoesParciais: ExecucaoParcial[];
}

interface ExecucaoParcial {
  id: string;
  data: string;
  areaExecutada: string;
  equipamento: string;
  operador: string;
  observacoes: string;
  status: string;
}

const AgendaPage = () => {
  const { toast } = useToast();

  const [execucoes, setExecucoes] = useState<Execucao[]>([
    {
      id: "1",
      cliente: "João Silva",
      fazenda: "Fazenda São João",
      servico: "Pulverização",
      area: "45.5",
      dataAgendada: "",
      equipamento: "",
      status: "Pendente",
      execucoesParciais: []
    },
    {
      id: "2",
      cliente: "Maria Santos",
      fazenda: "Fazenda Santa Maria",
      servico: "Plantio",
      area: "120",
      dataAgendada: "",
      equipamento: "",
      status: "Pendente",
      execucoesParciais: []
    },
    {
      id: "3",
      cliente: "Pedro Costa",
      fazenda: "Fazenda Boa Vista",
      servico: "Colheita",
      area: "80",
      dataAgendada: "2025-06-17",
      equipamento: "Colheitadeira 01",
      status: "Agendado",
      execucoesParciais: []
    },
    {
      id: "4",
      cliente: "Ana Lima",
      fazenda: "Fazenda Esperança",
      servico: "Adubação",
      area: "95",
      dataAgendada: "2025-06-18",
      equipamento: "Caminhão 02",
      status: "Agendado",
      execucoesParciais: []
    }
  ]);

  const [showExecucaoForm, setShowExecucaoForm] = useState(false);
  const [showExecucaoParciaisModal, setShowExecucaoParciaisModal] = useState(false);
  const [editingExecucao, setEditingExecucao] = useState<Execucao | null>(null);
  const [selectedExecucao, setSelectedExecucao] = useState<Execucao | null>(null);

  const [formData, setFormData] = useState<Execucao>({
    id: "",
    cliente: "",
    fazenda: "",
    servico: "",
    area: "",
    dataAgendada: "",
    equipamento: "",
    status: "Pendente",
    execucoesParciais: []
  });

  const [execucaoParciralForm, setExecucaoParciralForm] = useState<ExecucaoParcial>({
    id: "",
    data: "",
    areaExecutada: "",
    equipamento: "",
    operador: "",
    observacoes: "",
    status: "Concluída"
  });

  const equipamentosDisponiveis = [
    "Colheitadeira 01",
    "Colheitadeira 02", 
    "Trator 01",
    "Trator 02",
    "Caminhão 01",
    "Caminhão 02",
    "Pulverizador 01",
    "Pulverizador 02"
  ];

  const handleEdit = (execucao: Execucao) => {
    setEditingExecucao(execucao);
    setFormData(execucao);
    setShowExecucaoForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExecucao) {
      setExecucoes(prev => prev.map(ex => ex.id === editingExecucao.id ? formData : ex));
      toast({
        title: "Execução atualizada",
        description: "A execução foi atualizada com sucesso.",
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      cliente: "",
      fazenda: "",
      servico: "",
      area: "",
      dataAgendada: "",
      equipamento: "",
      status: "Pendente",
      execucoesParciais: []
    });
    setEditingExecucao(null);
    setShowExecucaoForm(false);
  };

  const handleInputChange = (field: keyof Execucao, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExecucaoParciaisClick = (execucao: Execucao) => {
    setSelectedExecucao(execucao);
    setShowExecucaoParciaisModal(true);
  };

  const handleAddExecucaoParciralToEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingExecucao) return;

    const newExecucaoParcial = {
      ...execucaoParciralForm,
      id: Date.now().toString()
    };

    const updatedExecucao = {
      ...formData,
      execucoesParciais: [...formData.execucoesParciais, newExecucaoParcial]
    };

    setFormData(updatedExecucao);
    setExecucoes(prev => prev.map(ex => ex.id === editingExecucao.id ? updatedExecucao : ex));

    // Reset form
    setExecucaoParciralForm({
      id: "",
      data: "",
      areaExecutada: "",
      equipamento: "",
      operador: "",
      observacoes: "",
      status: "Concluída"
    });

    toast({
      title: "Execução parcial adicionada",
      description: "A execução parcial foi adicionada com sucesso.",
    });
  };

  const handleDeleteExecucaoParciralFromEdit = (execucaoParciralId: string) => {
    if (!editingExecucao) return;

    const updatedExecucao = {
      ...formData,
      execucoesParciais: formData.execucoesParciais.filter(ep => ep.id !== execucaoParciralId)
    };

    setFormData(updatedExecucao);
    setExecucoes(prev => prev.map(ex => ex.id === editingExecucao.id ? updatedExecucao : ex));

    toast({
      title: "Execução parcial removida",
      description: "A execução parcial foi removida com sucesso.",
    });
  };

  const handleAddExecucaoParcial = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExecucao) return;

    const newExecucaoParcial = {
      ...execucaoParciralForm,
      id: Date.now().toString()
    };

    const updatedExecucao = {
      ...selectedExecucao,
      execucoesParciais: [...selectedExecucao.execucoesParciais, newExecucaoParcial]
    };

    setExecucoes(prev => prev.map(ex => ex.id === selectedExecucao.id ? updatedExecucao : ex));
    setSelectedExecucao(updatedExecucao);

    // Reset form
    setExecucaoParciralForm({
      id: "",
      data: "",
      areaExecutada: "",
      equipamento: "",
      operador: "",
      observacoes: "",
      status: "Concluída"
    });

    toast({
      title: "Execução parcial adicionada",
      description: "A execução parcial foi adicionada com sucesso.",
    });
  };

  const handleDeleteExecucaoParcial = (execucaoParciralId: string) => {
    if (!selectedExecucao) return;

    const updatedExecucao = {
      ...selectedExecucao,
      execucoesParciais: selectedExecucao.execucoesParciais.filter(ep => ep.id !== execucaoParciralId)
    };

    setExecucoes(prev => prev.map(ex => ex.id === selectedExecucao.id ? updatedExecucao : ex));
    setSelectedExecucao(updatedExecucao);

    toast({
      title: "Execução parcial removida",
      description: "A execução parcial foi removida com sucesso.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-100 text-green-800";
      case "Em Andamento":
        return "bg-blue-100 text-blue-800";
      case "Agendado":
        return "bg-purple-100 text-purple-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calcularAreaTotal = (execucoesParciais: ExecucaoParcial[]) => {
    return execucoesParciais.reduce((total, ep) => total + parseFloat(ep.areaExecutada || "0"), 0);
  };

  const execucoesPendentes = execucoes.filter(ex => ex.status === "Pendente");
  const proximasExecucoes = execucoes.filter(ex => ex.status === "Agendado");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-gray-600">Gerencie execuções e agendamentos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Execuções Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {execucoesPendentes.map((execucao) => (
                <div key={execucao.id} className="border-l-4 border-orange-500 pl-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{execucao.servico} - {execucao.fazenda}</h4>
                    <p className="text-sm text-gray-600">{execucao.area} hectares • Cliente: {execucao.cliente}</p>
                    <p className="text-xs text-gray-500">Aguardando agendamento</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(execucao)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecucaoParciaisClick(execucao)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Execuções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasExecucoes.map((execucao) => (
                <div key={execucao.id} className="border-l-4 border-green-500 pl-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{execucao.servico} - {execucao.fazenda}</h4>
                    <p className="text-sm text-gray-600">{execucao.area} hectares • {execucao.dataAgendada}</p>
                    <p className="text-xs text-gray-500">Equipamento: {execucao.equipamento}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(execucao)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecucaoParciaisClick(execucao)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição de Execução */}
      <Dialog open={showExecucaoForm} onOpenChange={setShowExecucaoForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Execução</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => handleInputChange("cliente", e.target.value)}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="fazenda">Fazenda</Label>
                  <Input
                    id="fazenda"
                    value={formData.fazenda}
                    onChange={(e) => handleInputChange("fazenda", e.target.value)}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servico">Serviço</Label>
                  <Input
                    id="servico"
                    value={formData.servico}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área (ha)</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataAgendada">Data Agendada</Label>
                  <Input
                    id="dataAgendada"
                    type="date"
                    value={formData.dataAgendada}
                    onChange={(e) => handleInputChange("dataAgendada", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="equipamento">Equipamento</Label>
                  <Select value={formData.equipamento} onValueChange={(value) => handleInputChange("equipamento", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipamentosDisponiveis.map((equipamento) => (
                        <SelectItem key={equipamento} value={equipamento}>
                          {equipamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Agendado">Agendado</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Seção de Execuções Parciais */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Execuções Parciais</h3>
              
              {/* Informações da Execução */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Área Total:</strong> {formData.area} ha</div>
                  <div><strong>Área Executada:</strong> {calcularAreaTotal(formData.execucoesParciais)} ha</div>
                  <div><strong>Área Restante:</strong> {parseFloat(formData.area || "0") - calcularAreaTotal(formData.execucoesParciais)} ha</div>
                  <div><strong>Progresso:</strong> {formData.area ? Math.round((calcularAreaTotal(formData.execucoesParciais) / parseFloat(formData.area)) * 100) : 0}%</div>
                </div>
              </div>

              {/* Formulário para Nova Execução Parcial */}
              <form onSubmit={handleAddExecucaoParciralToEdit} className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-4">Nova Execução Parcial</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={execucaoParciralForm.data}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, data: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="areaExecutada">Área Executada (ha)</Label>
                    <Input
                      id="areaExecutada"
                      type="number"
                      step="0.1"
                      value={execucaoParciralForm.areaExecutada}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, areaExecutada: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipamentoParcial">Equipamento</Label>
                    <Select value={execucaoParciralForm.equipamento} onValueChange={(value) => setExecucaoParciralForm(prev => ({ ...prev, equipamento: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipamentosDisponiveis.map((equipamento) => (
                          <SelectItem key={equipamento} value={equipamento}>
                            {equipamento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="operador">Operador</Label>
                    <Input
                      id="operador"
                      value={execucaoParciralForm.operador}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, operador: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={execucaoParciralForm.observacoes}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Execução
                  </Button>
                </div>
              </form>

              {/* Lista de Execuções Parciais */}
              <div>
                <h4 className="font-medium mb-4">Execuções Registradas</h4>
                {formData.execucoesParciais.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma execução parcial registrada</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Área (ha)</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.execucoesParciais.map((execucaoParcial) => (
                        <TableRow key={execucaoParcial.id}>
                          <TableCell>{execucaoParcial.data}</TableCell>
                          <TableCell>{execucaoParcial.areaExecutada}</TableCell>
                          <TableCell>{execucaoParcial.equipamento}</TableCell>
                          <TableCell>{execucaoParcial.operador}</TableCell>
                          <TableCell>{execucaoParcial.observacoes}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteExecucaoParciralFromEdit(execucaoParcial.id)}
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
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Execuções Parciais */}
      <Dialog open={showExecucaoParciaisModal} onOpenChange={setShowExecucaoParciaisModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Execuções Parciais - {selectedExecucao?.servico} ({selectedExecucao?.fazenda})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações da Execução */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Cliente:</strong> {selectedExecucao?.cliente}</div>
                <div><strong>Área Total:</strong> {selectedExecucao?.area} ha</div>
                <div><strong>Área Executada:</strong> {calcularAreaTotal(selectedExecucao?.execucoesParciais || [])} ha</div>
                <div><strong>Área Restante:</strong> {parseFloat(selectedExecucao?.area || "0") - calcularAreaTotal(selectedExecucao?.execucoesParciais || [])} ha</div>
              </div>
            </div>

            {/* Formulário para Nova Execução Parcial */}
            <form onSubmit={handleAddExecucaoParcial} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-4">Nova Execução Parcial</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={execucaoParciralForm.data}
                    onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, data: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="areaExecutada">Área Executada (ha)</Label>
                  <Input
                    id="areaExecutada"
                    type="number"
                    step="0.1"
                    value={execucaoParciralForm.areaExecutada}
                    onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, areaExecutada: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="equipamentoParcial">Equipamento</Label>
                  <Select value={execucaoParciralForm.equipamento} onValueChange={(value) => setExecucaoParciralForm(prev => ({ ...prev, equipamento: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipamentosDisponiveis.map((equipamento) => (
                        <SelectItem key={equipamento} value={equipamento}>
                          {equipamento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="operador">Operador</Label>
                  <Input
                    id="operador"
                    value={execucaoParciralForm.operador}
                    onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, operador: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={execucaoParciralForm.observacoes}
                    onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Execução
                </Button>
              </div>
            </form>

            {/* Lista de Execuções Parciais */}
            <div>
              <h3 className="font-medium mb-4">Execuções Registradas</h3>
              {selectedExecucao?.execucoesParciais.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma execução parcial registrada</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExecucao?.execucoesParciais.map((execucaoParcial) => (
                      <TableRow key={execucaoParcial.id}>
                        <TableCell>{execucaoParcial.data}</TableCell>
                        <TableCell>{execucaoParcial.areaExecutada}</TableCell>
                        <TableCell>{execucaoParcial.equipamento}</TableCell>
                        <TableCell>{execucaoParcial.operador}</TableCell>
                        <TableCell>{execucaoParcial.observacoes}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExecucaoParcial(execucaoParcial.id)}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPage;
