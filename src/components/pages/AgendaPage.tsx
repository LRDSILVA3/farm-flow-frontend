import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Execution {
  id: string;
  clientName: string;
  clientId: string;
  farmName: string;
  farmId: string;
  serviceName: string;
  area: string;
  scheduledDate: string;
  equipmentName: string;
  status: string;
  partialExecutions: PartialExecution[];
}

interface PartialExecution {
  id: string;
  date: string;
  executedArea: string;
  equipmentName: string;
  operator: string;
  notes: string;
  status: string;
}

const statusOptions = ["Todos", "Pendente", "Agendado", "Em Andamento", "Concluído"];

const AgendaPage = () => {
  const { toast } = useToast();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showExecutionForm, setShowExecutionForm] = useState(false);
  const [showPartialExecutionsModal, setShowPartialExecutionsModal] = useState(false);
  const [editingExecution, setEditingExecution] = useState<Execution | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  const [formData, setFormData] = useState<Execution>({
    id: "",
    clientName: "",
    clientId: "",
    farmName: "",
    farmId: "",
    serviceName: "",
    area: "",
    scheduledDate: "",
    equipmentName: "",
    status: "Pendente",
    partialExecutions: []
  });

  const [partialExecutionForm, setPartialExecutionForm] = useState<PartialExecution>({
    id: "",
    date: "",
    executedArea: "",
    equipmentName: "",
    operator: "",
    notes: "",
    status: "Concluída"
  });

  const [equipmentList, setEquipmentList] = useState<string[]>([]);

  useEffect(() => {
    fetchExecutions();
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from("equipment")
      .select("name")
      .eq("status", "Disponível");
    
    setEquipmentList((data || []).map(e => e.name));
  };

  const fetchExecutions = async () => {
    try {
      const { data: executionsData, error } = await supabase
        .from("executions")
        .select(`
          id, service_name, area, scheduled_date, equipment_name, status,
          clients:client_id (id, name),
          farms:farm_id (id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: partialsData } = await supabase
        .from("partial_executions")
        .select("*");

      const mapped = (executionsData || []).map(e => ({
        id: e.id,
        clientName: (e.clients as any)?.name || "",
        clientId: (e.clients as any)?.id || "",
        farmName: (e.farms as any)?.name || "",
        farmId: (e.farms as any)?.id || "",
        serviceName: e.service_name || "",
        area: e.area?.toString() || "",
        scheduledDate: e.scheduled_date || "",
        equipmentName: e.equipment_name || "",
        status: e.status || "Pendente",
        partialExecutions: (partialsData || [])
          .filter(p => p.execution_id === e.id)
          .map(p => ({
            id: p.id,
            date: p.date || "",
            executedArea: p.executed_area?.toString() || "",
            equipmentName: p.equipment_name || "",
            operator: p.operator || "",
            notes: p.notes || "",
            status: p.status || "Concluída"
          }))
      }));

      setExecutions(mapped);
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

  const handleEdit = (execution: Execution) => {
    setEditingExecution(execution);
    setFormData(execution);
    setShowExecutionForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingExecution) return;

    try {
      const { error } = await supabase
        .from("executions")
        .update({
          service_name: formData.serviceName,
          area: formData.area ? parseFloat(formData.area) : null,
          scheduled_date: formData.scheduledDate || null,
          equipment_name: formData.equipmentName || null,
          status: formData.status
        })
        .eq("id", editingExecution.id);

      if (error) throw error;

      setExecutions(prev => prev.map(ex => ex.id === editingExecution.id ? formData : ex));
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
      clientName: "",
      clientId: "",
      farmName: "",
      farmId: "",
      serviceName: "",
      area: "",
      scheduledDate: "",
      equipmentName: "",
      status: "Pendente",
      partialExecutions: []
    });
    setEditingExecution(null);
    setShowExecutionForm(false);
  };

  const handleInputChange = (field: keyof Execution, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartialExecutionsClick = (execution: Execution) => {
    setSelectedExecution(execution);
    setShowPartialExecutionsModal(true);
  };

  const handleAddPartialExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExecution) return;

    try {
      const { data, error } = await supabase
        .from("partial_executions")
        .insert({
          execution_id: selectedExecution.id,
          date: partialExecutionForm.date || null,
          executed_area: partialExecutionForm.executedArea ? parseFloat(partialExecutionForm.executedArea) : null,
          equipment_name: partialExecutionForm.equipmentName || null,
          operator: partialExecutionForm.operator || null,
          notes: partialExecutionForm.notes || null,
          status: partialExecutionForm.status
        })
        .select()
        .single();

      if (error) throw error;

      const newPartialExecution = {
        id: data.id,
        date: data.date || "",
        executedArea: data.executed_area?.toString() || "",
        equipmentName: data.equipment_name || "",
        operator: data.operator || "",
        notes: data.notes || "",
        status: data.status || "Concluída"
      };

      const updatedExecution = {
        ...selectedExecution,
        partialExecutions: [...selectedExecution.partialExecutions, newPartialExecution]
      };

      setExecutions(prev => prev.map(ex => ex.id === selectedExecution.id ? updatedExecution : ex));
      setSelectedExecution(updatedExecution);

      setPartialExecutionForm({
        id: "",
        date: "",
        executedArea: "",
        equipmentName: "",
        operator: "",
        notes: "",
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

  const handleDeletePartialExecution = async (partialExecutionId: string) => {
    if (!selectedExecution) return;

    try {
      const { error } = await supabase
        .from("partial_executions")
        .delete()
        .eq("id", partialExecutionId);

      if (error) throw error;

      const updatedExecution = {
        ...selectedExecution,
        partialExecutions: selectedExecution.partialExecutions.filter(ep => ep.id !== partialExecutionId)
      };

      setExecutions(prev => prev.map(ex => ex.id === selectedExecution.id ? updatedExecution : ex));
      setSelectedExecution(updatedExecution);

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

  const calculateTotalArea = (partialExecutions: PartialExecution[]) => {
    return partialExecutions.reduce((total, ep) => total + parseFloat(ep.executedArea || "0"), 0);
  };

  const filteredExecutions = statusFilter === "Todos" 
    ? executions 
    : executions.filter(ex => ex.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">Gerencie execuções e agendamentos</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Execuções ({filteredExecutions.length})
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredExecutions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma execução encontrada</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Área (ha)</TableHead>
                  <TableHead>Data Agendada</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell className="font-medium">{execution.clientName || "-"}</TableCell>
                    <TableCell>{execution.farmName || "-"}</TableCell>
                    <TableCell>{execution.serviceName || "-"}</TableCell>
                    <TableCell>{execution.area || "-"}</TableCell>
                    <TableCell>
                      {execution.scheduledDate 
                        ? new Date(execution.scheduledDate).toLocaleDateString('pt-BR') 
                        : "-"}
                    </TableCell>
                    <TableCell>{execution.equipmentName || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(execution)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePartialExecutionsClick(execution)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showExecutionForm} onOpenChange={setShowExecutionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Execução</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <Input value={formData.clientName} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Fazenda</Label>
                <Input value={formData.farmName} readOnly className="bg-muted" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Serviço</Label>
                <Input value={formData.serviceName} readOnly className="bg-muted" />
              </div>
              <div>
                <Label>Área (ha)</Label>
                <Input value={formData.area} readOnly className="bg-muted" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Agendada</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Equipamento</Label>
                <Select value={formData.equipmentName} onValueChange={(value) => handleInputChange("equipmentName", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map((eq) => (
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
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Partial Executions Modal */}
      <Dialog open={showPartialExecutionsModal} onOpenChange={setShowPartialExecutionsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execuções Parciais - {selectedExecution?.serviceName}</DialogTitle>
          </DialogHeader>
          
          {selectedExecution && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Área Total:</span> {selectedExecution.area} ha
                  </div>
                  <div>
                    <span className="font-medium">Área Executada:</span> {calculateTotalArea(selectedExecution.partialExecutions).toFixed(2)} ha
                  </div>
                  <div>
                    <span className="font-medium">Área Restante:</span> {(parseFloat(selectedExecution.area || "0") - calculateTotalArea(selectedExecution.partialExecutions)).toFixed(2)} ha
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddPartialExecution} className="space-y-4 border p-4 rounded-lg">
                <h4 className="font-medium">Adicionar Execução Parcial</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={partialExecutionForm.date}
                      onChange={(e) => setPartialExecutionForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Área Executada (ha)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={partialExecutionForm.executedArea}
                      onChange={(e) => setPartialExecutionForm(prev => ({ ...prev, executedArea: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Equipamento</Label>
                    <Select 
                      value={partialExecutionForm.equipmentName} 
                      onValueChange={(value) => setPartialExecutionForm(prev => ({ ...prev, equipmentName: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentList.map((eq) => (
                          <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Operador</Label>
                    <Input
                      value={partialExecutionForm.operator}
                      onChange={(e) => setPartialExecutionForm(prev => ({ ...prev, operator: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input
                    value={partialExecutionForm.notes}
                    onChange={(e) => setPartialExecutionForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full">Adicionar</Button>
              </form>

              {selectedExecution.partialExecutions.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedExecution.partialExecutions.map((pe) => (
                      <TableRow key={pe.id}>
                        <TableCell>{pe.date ? new Date(pe.date).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>{pe.executedArea}</TableCell>
                        <TableCell>{pe.equipmentName || "-"}</TableCell>
                        <TableCell>{pe.operator || "-"}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            {pe.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePartialExecution(pe.id)}
                          >
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
