import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisExecution {
  id: string;
  analysisName: string;
  collaborator: string;
  clientId: string;
  clientName: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotName: string;
  quantity: number;
  status: "Pendente" | "Enviado" | "Recebido" | "Executando" | "Finalizado";
  sendDate: string;
  receiptDate: string;
  completionDate: string;
}

const AnalisesPrincipalPage = () => {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<{id: string; name: string}[]>([]);
  const [farms, setFarms] = useState<{id: string; name: string}[]>([]);
  const [plots, setPlots] = useState<{id: string; name: string}[]>([]);

  const collaboratorsConfig = [
    { id: "1", name: "Laboratorio 1" },
    { id: "2", name: "Laboratorio 2" }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [collaboratorFilter, setCollaboratorFilter] = useState("");
  const [analysesPage, setAnalysesPage] = useState(1);
  const [analysesPerPage, setAnalysesPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<AnalysisExecution | null>(null);
  const [formData, setFormData] = useState<AnalysisExecution>({
    id: "",
    analysisName: "",
    collaborator: "",
    clientId: "",
    clientName: "",
    farmId: "",
    farmName: "",
    plotId: "",
    plotName: "",
    quantity: 1,
    status: "Pendente",
    sendDate: "",
    receiptDate: "",
    completionDate: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analysesRes, clientsRes, farmsRes, plotsRes] = await Promise.all([
        supabase.from("analysis_executions").select(`
          id, analysis_name, collaborator, quantity, status, 
          send_date, receipt_date, completion_date,
          clients:client_id (id, name),
          farms:farm_id (id, name),
          plots:plot_id (id, name)
        `).order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name"),
        supabase.from("farms").select("id, name").order("name"),
        supabase.from("plots").select("id, name").order("name")
      ]);

      if (analysesRes.error) throw analysesRes.error;

      const mapped = (analysesRes.data || []).map(a => ({
        id: a.id,
        analysisName: a.analysis_name || "",
        collaborator: a.collaborator || "",
        clientId: (a.clients as any)?.id || "",
        clientName: (a.clients as any)?.name || "",
        farmId: (a.farms as any)?.id || "",
        farmName: (a.farms as any)?.name || "",
        plotId: (a.plots as any)?.id || "",
        plotName: (a.plots as any)?.name || "",
        quantity: a.quantity || 1,
        status: (a.status as any) || "Pendente",
        sendDate: a.send_date || "",
        receiptDate: a.receipt_date || "",
        completionDate: a.completion_date || ""
      }));

      setAnalyses(mapped);
      setClients(clientsRes.data || []);
      setFarms(farmsRes.data || []);
      setPlots(plotsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar análises",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.collaborator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.plotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.analysisName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollaborator = !collaboratorFilter || collaboratorFilter === "all" || analysis.collaborator === collaboratorFilter;
    
    return matchesSearch && matchesCollaborator;
  });

  const totalAnalyses = filteredAnalyses.length;
  const totalAnalysesPages = Math.ceil(totalAnalyses / analysesPerPage);
  const analysesStartIndex = (analysesPage - 1) * analysesPerPage;
  const analysesEndIndex = analysesStartIndex + analysesPerPage;
  const currentAnalyses = filteredAnalyses.slice(analysesStartIndex, analysesEndIndex);

  const handleEdit = (analysis: AnalysisExecution) => {
    setEditingAnalysis(analysis);
    setFormData(analysis);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setFormData({
      id: "",
      analysisName: "",
      collaborator: "",
      clientId: "",
      clientName: "",
      farmId: "",
      farmName: "",
      plotId: "",
      plotName: "",
      quantity: 1,
      status: "Pendente",
      sendDate: "",
      receiptDate: "",
      completionDate: ""
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("analysis_executions")
        .update({
          analysis_name: formData.analysisName,
          collaborator: formData.collaborator,
          client_id: formData.clientId || null,
          farm_id: formData.farmId || null,
          plot_id: formData.plotId || null,
          quantity: formData.quantity,
          status: formData.status,
          send_date: formData.sendDate || null,
          receipt_date: formData.receiptDate || null,
          completion_date: formData.completionDate || null
        })
        .eq("id", editingAnalysis?.id);

      if (error) throw error;

      setAnalyses(prev => prev.map(a => a.id === editingAnalysis?.id ? formData : a));
      toast({
        title: "Análise atualizada",
        description: "A análise foi atualizada com sucesso.",
      });
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar análise",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("analysis_executions")
        .insert({
          user_id: user.id,
          analysis_name: formData.analysisName,
          collaborator: formData.collaborator,
          client_id: formData.clientId || null,
          farm_id: formData.farmId || null,
          plot_id: formData.plotId || null,
          quantity: formData.quantity,
          status: formData.status,
          send_date: formData.sendDate || null,
          receipt_date: formData.receiptDate || null,
          completion_date: formData.completionDate || null
        })
        .select()
        .single();

      if (error) throw error;

      const clientName = clients.find(c => c.id === formData.clientId)?.name || "";
      const farmName = farms.find(f => f.id === formData.farmId)?.name || "";
      const plotName = plots.find(t => t.id === formData.plotId)?.name || "";

      const newAnalysis: AnalysisExecution = {
        ...formData,
        id: data.id,
        clientName,
        farmName,
        plotName
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      toast({
        title: "Análise criada",
        description: "A análise foi criada com sucesso.",
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao criar análise",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      analysisName: "",
      collaborator: "",
      clientId: "",
      clientName: "",
      farmId: "",
      farmName: "",
      plotId: "",
      plotName: "",
      quantity: 1,
      status: "Pendente",
      sendDate: "",
      receiptDate: "",
      completionDate: ""
    });
    setEditingAnalysis(null);
    setShowEditModal(false);
  };

  const handleInputChange = (field: keyof AnalysisExecution, value: string | number) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análises</h1>
          <p className="text-gray-600">Acompanhamento das análises em execução</p>
        </div>
        <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Análises</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar análise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {collaboratorsConfig.map((colab) => (
                    <SelectItem key={colab.id} value={colab.name}>{colab.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma análise cadastrada</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Análise</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fazenda</TableHead>
                      <TableHead>Talhão</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Envio</TableHead>
                      <TableHead>Recebimento</TableHead>
                      <TableHead>Finalização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">{analysis.analysisName}</TableCell>
                        <TableCell>{analysis.collaborator || "-"}</TableCell>
                        <TableCell>{analysis.clientName || "-"}</TableCell>
                        <TableCell>{analysis.farmName || "-"}</TableCell>
                        <TableCell>{analysis.plotName || "-"}</TableCell>
                        <TableCell>{analysis.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(analysis.status)}>{analysis.status}</Badge>
                        </TableCell>
                        <TableCell>{analysis.sendDate ? new Date(analysis.sendDate).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>{analysis.receiptDate ? new Date(analysis.receiptDate).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>{analysis.completionDate ? new Date(analysis.completionDate).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(analysis)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Mostrando {analysesStartIndex + 1} a {Math.min(analysesEndIndex, totalAnalyses)} de {totalAnalyses}
                  </span>
                  <Select value={analysesPerPage.toString()} onValueChange={(value) => {
                    setAnalysesPerPage(Number(value));
                    setAnalysesPage(1);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {totalAnalysesPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setAnalysesPage(Math.max(1, analysesPage - 1))}
                          className={analysesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalAnalysesPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setAnalysesPage(page)}
                            isActive={analysesPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setAnalysesPage(Math.min(totalAnalysesPages, analysesPage + 1))}
                          className={analysesPage === totalAnalysesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Análise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Análise</Label>
                <Input
                  value={formData.analysisName}
                  onChange={(e) => handleInputChange("analysisName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Select value={formData.collaborator} onValueChange={(value) => handleInputChange("collaborator", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaboratorsConfig.map((colab) => (
                      <SelectItem key={colab.id} value={colab.name}>{colab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fazenda</Label>
                <Select value={formData.farmId} onValueChange={(value) => handleInputChange("farmId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Talhão</Label>
                <Select value={formData.plotId} onValueChange={(value) => handleInputChange("plotId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {plots.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data Envio</Label>
                <Input
                  type="date"
                  value={formData.sendDate}
                  onChange={(e) => handleInputChange("sendDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Recebimento</Label>
                <Input
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) => handleInputChange("receiptDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Finalização</Label>
                <Input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange("completionDate", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Análise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Análise</Label>
                <Input
                  value={formData.analysisName}
                  onChange={(e) => handleInputChange("analysisName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Select value={formData.collaborator} onValueChange={(value) => handleInputChange("collaborator", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {collaboratorsConfig.map((colab) => (
                      <SelectItem key={colab.id} value={colab.name}>{colab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleInputChange("clientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fazenda</Label>
                <Select value={formData.farmId} onValueChange={(value) => handleInputChange("farmId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Talhão</Label>
                <Select value={formData.plotId} onValueChange={(value) => handleInputChange("plotId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {plots.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data Envio</Label>
                <Input
                  type="date"
                  value={formData.sendDate}
                  onChange={(e) => handleInputChange("sendDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Recebimento</Label>
                <Input
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) => handleInputChange("receiptDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Finalização</Label>
                <Input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) => handleInputChange("completionDate", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
              <Button type="submit">Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisesPrincipalPage;
