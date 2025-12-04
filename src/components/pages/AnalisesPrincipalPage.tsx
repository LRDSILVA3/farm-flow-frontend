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

interface AnaliseExecucao {
  id: string;
  nomeAnalise: string;
  colaborador: string;
  clienteId: string;
  cliente: string;
  fazendaId: string;
  fazenda: string;
  talhaoId: string;
  talhao: string;
  quantidade: number;
  status: "Pendente" | "Enviado" | "Recebido" | "Executando" | "Finalizado";
  dataEnvio: string;
  dataRecebimento: string;
  dataFinalizacao: string;
}

const AnalisesPrincipalPage = () => {
  const { toast } = useToast();
  const [analises, setAnalises] = useState<AnaliseExecucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<{id: string; nome: string}[]>([]);
  const [fazendas, setFazendas] = useState<{id: string; nome: string}[]>([]);
  const [talhoes, setTalhoes] = useState<{id: string; nome: string}[]>([]);

  const colaboradoresConfig = [
    { id: "1", nome: "Laboratorio 1" },
    { id: "2", nome: "Laboratorio 2" }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [colaboradorFilter, setColaboradorFilter] = useState("");
  const [analisesPage, setAnalisesPage] = useState(1);
  const [analisesPerPage, setAnalisesPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseExecucao | null>(null);
  const [formData, setFormData] = useState<AnaliseExecucao>({
    id: "",
    nomeAnalise: "",
    colaborador: "",
    clienteId: "",
    cliente: "",
    fazendaId: "",
    fazenda: "",
    talhaoId: "",
    talhao: "",
    quantidade: 1,
    status: "Pendente",
    dataEnvio: "",
    dataRecebimento: "",
    dataFinalizacao: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analisesRes, clientesRes, fazendasRes, talhoesRes] = await Promise.all([
        supabase.from("analises_execucao").select(`
          id, nome_analise, colaborador, quantidade, status, 
          data_envio, data_recebimento, data_finalizacao,
          clientes:cliente_id (id, nome),
          fazendas:fazenda_id (id, nome),
          talhoes:talhao_id (id, nome)
        `).order("created_at", { ascending: false }),
        supabase.from("clientes").select("id, nome").order("nome"),
        supabase.from("fazendas").select("id, nome").order("nome"),
        supabase.from("talhoes").select("id, nome").order("nome")
      ]);

      if (analisesRes.error) throw analisesRes.error;

      const mapped = (analisesRes.data || []).map(a => ({
        id: a.id,
        nomeAnalise: a.nome_analise || "",
        colaborador: a.colaborador || "",
        clienteId: (a.clientes as any)?.id || "",
        cliente: (a.clientes as any)?.nome || "",
        fazendaId: (a.fazendas as any)?.id || "",
        fazenda: (a.fazendas as any)?.nome || "",
        talhaoId: (a.talhoes as any)?.id || "",
        talhao: (a.talhoes as any)?.nome || "",
        quantidade: a.quantidade || 1,
        status: (a.status as any) || "Pendente",
        dataEnvio: a.data_envio || "",
        dataRecebimento: a.data_recebimento || "",
        dataFinalizacao: a.data_finalizacao || ""
      }));

      setAnalises(mapped);
      setClientes(clientesRes.data || []);
      setFazendas(fazendasRes.data || []);
      setTalhoes(talhoesRes.data || []);
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

  const filteredAnalises = analises.filter(analise => {
    const matchesSearch = analise.colaborador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.fazenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.talhao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.nomeAnalise.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColaborador = !colaboradorFilter || colaboradorFilter === "all" || analise.colaborador === colaboradorFilter;
    
    return matchesSearch && matchesColaborador;
  });

  const totalAnalises = filteredAnalises.length;
  const totalAnalisesPages = Math.ceil(totalAnalises / analisesPerPage);
  const analisesStartIndex = (analisesPage - 1) * analisesPerPage;
  const analisesEndIndex = analisesStartIndex + analisesPerPage;
  const currentAnalises = filteredAnalises.slice(analisesStartIndex, analisesEndIndex);

  const handleEdit = (analise: AnaliseExecucao) => {
    setEditingAnalise(analise);
    setFormData(analise);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setFormData({
      id: "",
      nomeAnalise: "",
      colaborador: "",
      clienteId: "",
      cliente: "",
      fazendaId: "",
      fazenda: "",
      talhaoId: "",
      talhao: "",
      quantidade: 1,
      status: "Pendente",
      dataEnvio: "",
      dataRecebimento: "",
      dataFinalizacao: ""
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("analises_execucao")
        .update({
          nome_analise: formData.nomeAnalise,
          colaborador: formData.colaborador,
          cliente_id: formData.clienteId || null,
          fazenda_id: formData.fazendaId || null,
          talhao_id: formData.talhaoId || null,
          quantidade: formData.quantidade,
          status: formData.status,
          data_envio: formData.dataEnvio || null,
          data_recebimento: formData.dataRecebimento || null,
          data_finalizacao: formData.dataFinalizacao || null
        })
        .eq("id", editingAnalise?.id);

      if (error) throw error;

      setAnalises(prev => prev.map(a => a.id === editingAnalise?.id ? formData : a));
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
        .from("analises_execucao")
        .insert({
          user_id: user.id,
          nome_analise: formData.nomeAnalise,
          colaborador: formData.colaborador,
          cliente_id: formData.clienteId || null,
          fazenda_id: formData.fazendaId || null,
          talhao_id: formData.talhaoId || null,
          quantidade: formData.quantidade,
          status: formData.status,
          data_envio: formData.dataEnvio || null,
          data_recebimento: formData.dataRecebimento || null,
          data_finalizacao: formData.dataFinalizacao || null
        })
        .select()
        .single();

      if (error) throw error;

      const clienteNome = clientes.find(c => c.id === formData.clienteId)?.nome || "";
      const fazendaNome = fazendas.find(f => f.id === formData.fazendaId)?.nome || "";
      const talhaoNome = talhoes.find(t => t.id === formData.talhaoId)?.nome || "";

      const newAnalise: AnaliseExecucao = {
        ...formData,
        id: data.id,
        cliente: clienteNome,
        fazenda: fazendaNome,
        talhao: talhaoNome
      };

      setAnalises(prev => [newAnalise, ...prev]);
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
      nomeAnalise: "",
      colaborador: "",
      clienteId: "",
      cliente: "",
      fazendaId: "",
      fazenda: "",
      talhaoId: "",
      talhao: "",
      quantidade: 1,
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
              <Select value={colaboradorFilter} onValueChange={setColaboradorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {colaboradoresConfig.map((colab) => (
                    <SelectItem key={colab.id} value={colab.nome}>{colab.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analises.length === 0 ? (
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
                    {currentAnalises.map((analise) => (
                      <TableRow key={analise.id}>
                        <TableCell className="font-medium">{analise.nomeAnalise}</TableCell>
                        <TableCell>{analise.colaborador || "-"}</TableCell>
                        <TableCell>{analise.cliente || "-"}</TableCell>
                        <TableCell>{analise.fazenda || "-"}</TableCell>
                        <TableCell>{analise.talhao || "-"}</TableCell>
                        <TableCell>{analise.quantidade}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(analise.status)}>{analise.status}</Badge>
                        </TableCell>
                        <TableCell>{analise.dataEnvio ? new Date(analise.dataEnvio).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>{analise.dataRecebimento ? new Date(analise.dataRecebimento).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>{analise.dataFinalizacao ? new Date(analise.dataFinalizacao).toLocaleDateString('pt-BR') : "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(analise)}>
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
                    Mostrando {analisesStartIndex + 1} a {Math.min(analisesEndIndex, totalAnalises)} de {totalAnalises}
                  </span>
                  <Select value={analisesPerPage.toString()} onValueChange={(value) => {
                    setAnalisesPerPage(Number(value));
                    setAnalisesPage(1);
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
                
                {totalAnalisesPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setAnalisesPage(Math.max(1, analisesPage - 1))}
                          className={analisesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalAnalisesPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setAnalisesPage(page)}
                            isActive={analisesPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setAnalisesPage(Math.min(totalAnalisesPages, analisesPage + 1))}
                          className={analisesPage === totalAnalisesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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

      {/* Modal de Edição */}
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
                  value={formData.nomeAnalise}
                  onChange={(e) => handleInputChange("nomeAnalise", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Select value={formData.colaborador} onValueChange={(value) => handleInputChange("colaborador", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {colaboradoresConfig.map((colab) => (
                      <SelectItem key={colab.id} value={colab.nome}>{colab.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formData.clienteId} onValueChange={(value) => handleInputChange("clienteId", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fazenda</Label>
                <Select value={formData.fazendaId} onValueChange={(value) => handleInputChange("fazendaId", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {fazendas.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Talhão</Label>
                <Select value={formData.talhaoId} onValueChange={(value) => handleInputChange("talhaoId", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {talhoes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
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
                  value={formData.quantidade}
                  onChange={(e) => handleInputChange("quantidade", parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Input type="date" value={formData.dataEnvio} onChange={(e) => handleInputChange("dataEnvio", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data Recebimento</Label>
                <Input type="date" value={formData.dataRecebimento} onChange={(e) => handleInputChange("dataRecebimento", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data Finalização</Label>
                <Input type="date" value={formData.dataFinalizacao} onChange={(e) => handleInputChange("dataFinalizacao", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação */}
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
                  value={formData.nomeAnalise}
                  onChange={(e) => handleInputChange("nomeAnalise", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Select value={formData.colaborador} onValueChange={(value) => handleInputChange("colaborador", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {colaboradoresConfig.map((colab) => (
                      <SelectItem key={colab.id} value={colab.nome}>{colab.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formData.clienteId} onValueChange={(value) => handleInputChange("clienteId", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fazenda</Label>
                <Select value={formData.fazendaId} onValueChange={(value) => handleInputChange("fazendaId", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {fazendas.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Talhão</Label>
                <Select value={formData.talhaoId} onValueChange={(value) => handleInputChange("talhaoId", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {talhoes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
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
                  value={formData.quantidade}
                  onChange={(e) => handleInputChange("quantidade", parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisesPrincipalPage;
