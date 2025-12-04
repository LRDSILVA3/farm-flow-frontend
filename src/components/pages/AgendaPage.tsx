import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Execucao {
  id: string;
  cliente: string;
  clienteId: string;
  fazenda: string;
  fazendaId: string;
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
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExecucaoForm, setShowExecucaoForm] = useState(false);
  const [showExecucaoParciaisModal, setShowExecucaoParciaisModal] = useState(false);
  const [editingExecucao, setEditingExecucao] = useState<Execucao | null>(null);
  const [selectedExecucao, setSelectedExecucao] = useState<Execucao | null>(null);

  const [formData, setFormData] = useState<Execucao>({
    id: "",
    cliente: "",
    clienteId: "",
    fazenda: "",
    fazendaId: "",
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

  useEffect(() => {
    fetchExecucoes();
  }, []);

  const fetchExecucoes = async () => {
    try {
      const { data: execucoesData, error } = await supabase
        .from("execucoes")
        .select(`
          id, servico, area, data_agendada, equipamento, status,
          clientes:cliente_id (id, nome),
          fazendas:fazenda_id (id, nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch execuções parciais
      const { data: parciaisData } = await supabase
        .from("execucoes_parciais")
        .select("*");

      const mapped = (execucoesData || []).map(e => ({
        id: e.id,
        cliente: (e.clientes as any)?.nome || "",
        clienteId: (e.clientes as any)?.id || "",
        fazenda: (e.fazendas as any)?.nome || "",
        fazendaId: (e.fazendas as any)?.id || "",
        servico: e.servico || "",
        area: e.area?.toString() || "",
        dataAgendada: e.data_agendada || "",
        equipamento: e.equipamento || "",
        status: e.status || "Pendente",
        execucoesParciais: (parciaisData || [])
          .filter(p => p.execucao_id === e.id)
          .map(p => ({
            id: p.id,
            data: p.data || "",
            areaExecutada: p.area_executada?.toString() || "",
            equipamento: p.equipamento || "",
            operador: p.operador || "",
            observacoes: p.observacoes || "",
            status: p.status || "Concluída"
          }))
      }));

      setExecucoes(mapped);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar execuções",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (execucao: Execucao) => {
    setEditingExecucao(execucao);
    setFormData(execucao);
    setShowExecucaoForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingExecucao) return;

    try {
      const { error } = await supabase
        .from("execucoes")
        .update({
          servico: formData.servico,
          area: formData.area ? parseFloat(formData.area) : null,
          data_agendada: formData.dataAgendada || null,
          equipamento: formData.equipamento || null,
          status: formData.status
        })
        .eq("id", editingExecucao.id);

      if (error) throw error;

      setExecucoes(prev => prev.map(ex => ex.id === editingExecucao.id ? formData : ex));
      toast({
        title: "Execução atualizada",
        description: "A execução foi atualizada com sucesso.",
      });
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar execução",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      cliente: "",
      clienteId: "",
      fazenda: "",
      fazendaId: "",
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

  const handleAddExecucaoParcial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExecucao) return;

    try {
      const { data, error } = await supabase
        .from("execucoes_parciais")
        .insert({
          execucao_id: selectedExecucao.id,
          data: execucaoParciralForm.data || null,
          area_executada: execucaoParciralForm.areaExecutada ? parseFloat(execucaoParciralForm.areaExecutada) : null,
          equipamento: execucaoParciralForm.equipamento || null,
          operador: execucaoParciralForm.operador || null,
          observacoes: execucaoParciralForm.observacoes || null,
          status: execucaoParciralForm.status
        })
        .select()
        .single();

      if (error) throw error;

      const newExecucaoParcial = {
        id: data.id,
        data: data.data || "",
        areaExecutada: data.area_executada?.toString() || "",
        equipamento: data.equipamento || "",
        operador: data.operador || "",
        observacoes: data.observacoes || "",
        status: data.status || "Concluída"
      };

      const updatedExecucao = {
        ...selectedExecucao,
        execucoesParciais: [...selectedExecucao.execucoesParciais, newExecucaoParcial]
      };

      setExecucoes(prev => prev.map(ex => ex.id === selectedExecucao.id ? updatedExecucao : ex));
      setSelectedExecucao(updatedExecucao);

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
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar execução parcial",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteExecucaoParcial = async (execucaoParciralId: string) => {
    if (!selectedExecucao) return;

    try {
      const { error } = await supabase
        .from("execucoes_parciais")
        .delete()
        .eq("id", execucaoParciralId);

      if (error) throw error;

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
    } catch (error: any) {
      toast({
        title: "Erro ao remover execução parcial",
        description: error.message,
        variant: "destructive"
      });
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
              Execuções Pendentes ({execucoesPendentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {execucoesPendentes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma execução pendente</p>
              ) : (
                execucoesPendentes.map((execucao) => (
                  <div key={execucao.id} className="border-l-4 border-orange-500 pl-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{execucao.servico || "Serviço"} - {execucao.fazenda || "Fazenda"}</h4>
                      <p className="text-sm text-gray-600">{execucao.area} hectares • Cliente: {execucao.cliente}</p>
                      <p className="text-xs text-gray-500">Aguardando agendamento</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(execucao)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExecucaoParciaisClick(execucao)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Execuções ({proximasExecucoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasExecucoes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma execução agendada</p>
              ) : (
                proximasExecucoes.map((execucao) => (
                  <div key={execucao.id} className="border-l-4 border-green-500 pl-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{execucao.servico || "Serviço"} - {execucao.fazenda || "Fazenda"}</h4>
                      <p className="text-sm text-gray-600">{execucao.area} hectares • {execucao.dataAgendada ? new Date(execucao.dataAgendada).toLocaleDateString('pt-BR') : "-"}</p>
                      <p className="text-xs text-gray-500">Equipamento: {execucao.equipamento || "Não definido"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(execucao)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExecucaoParciaisClick(execucao)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={showExecucaoForm} onOpenChange={setShowExecucaoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Execução</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <Input value={formData.cliente} readOnly />
              </div>
              <div>
                <Label>Fazenda</Label>
                <Input value={formData.fazenda} readOnly />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Serviço</Label>
                <Input value={formData.servico} readOnly />
              </div>
              <div>
                <Label>Área (ha)</Label>
                <Input value={formData.area} readOnly />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Agendada</Label>
                <Input
                  type="date"
                  value={formData.dataAgendada}
                  onChange={(e) => handleInputChange("dataAgendada", e.target.value)}
                />
              </div>
              <div>
                <Label>Equipamento</Label>
                <Select value={formData.equipamento} onValueChange={(value) => handleInputChange("equipamento", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentosDisponiveis.map((eq) => (
                      <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
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
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Execuções Parciais */}
      <Dialog open={showExecucaoParciaisModal} onOpenChange={setShowExecucaoParciaisModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execuções Parciais - {selectedExecucao?.servico}</DialogTitle>
          </DialogHeader>
          
          {selectedExecucao && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Área Total:</strong> {selectedExecucao.area} ha</div>
                  <div><strong>Área Executada:</strong> {calcularAreaTotal(selectedExecucao.execucoesParciais)} ha</div>
                  <div><strong>Área Restante:</strong> {parseFloat(selectedExecucao.area || "0") - calcularAreaTotal(selectedExecucao.execucoesParciais)} ha</div>
                  <div><strong>Progresso:</strong> {selectedExecucao.area ? Math.round((calcularAreaTotal(selectedExecucao.execucoesParciais) / parseFloat(selectedExecucao.area)) * 100) : 0}%</div>
                </div>
              </div>

              <form onSubmit={handleAddExecucaoParcial} className="border p-4 rounded-lg">
                <h4 className="font-medium mb-4">Nova Execução Parcial</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={execucaoParciralForm.data}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, data: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Área Executada (ha)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={execucaoParciralForm.areaExecutada}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, areaExecutada: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Equipamento</Label>
                    <Select 
                      value={execucaoParciralForm.equipamento} 
                      onValueChange={(value) => setExecucaoParciralForm(prev => ({ ...prev, equipamento: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipamentosDisponiveis.map((eq) => (
                          <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Operador</Label>
                    <Input
                      value={execucaoParciralForm.operador}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, operador: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Input
                      value={execucaoParciralForm.observacoes}
                      onChange={(e) => setExecucaoParciralForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-4 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </form>

              {selectedExecucao.execucoesParciais.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExecucao.execucoesParciais.map((ep) => (
                      <TableRow key={ep.id}>
                        <TableCell>{ep.data ? new Date(ep.data).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>{ep.areaExecutada} ha</TableCell>
                        <TableCell>{ep.equipamento || "-"}</TableCell>
                        <TableCell>{ep.operador || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ep.status)}`}>
                            {ep.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteExecucaoParcial(ep.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPage;
