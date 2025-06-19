import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnaliseExecucao {
  id: string;
  nomeAnalise: string;
  colaborador: string;
  cliente: string;
  fazenda: string;
  talhao: string;
  quantidade: number;
  status: "Pendente" | "Enviado" | "Recebido" | "Executando" | "Finalizado";
  dataEnvio: string;
  dataRecebimento: string;
  dataFinalizacao: string;
}

const AnalisesPrincipalPage = () => {
  const { toast } = useToast();
  
  // Lista de colaboradores (configuração)
  const colaboradoresConfig = [
    { id: "1", nome: "Laboratorio 1" },
    { id: "2", nome: "Laboratorio 2" }
  ];

  // Lista de clientes para o select
  const clientesDisponiveis = [
    { id: "1", nome: "João Silva" },
    { id: "2", nome: "Maria Santos" },
    { id: "3", nome: "Pedro Oliveira" }
  ];

  // Lista de fazendas para o select
  const fazendasDisponiveis = [
    { id: "1", nome: "Fazenda São João" },
    { id: "2", nome: "Fazenda Santa Maria" },
    { id: "3", nome: "Fazenda Boa Vista" }
  ];

  // Lista de talhões para o select
  const talhoesDisponiveis = [
    { id: "1", nome: "Talhão A1" },
    { id: "2", nome: "Talhão B2" },
    { id: "3", nome: "Talhão C3" },
    { id: "4", nome: "Talhão D4" }
  ];

  const [analises, setAnalises] = useState<AnaliseExecucao[]>([
    {
      id: "1",
      nomeAnalise: "Macro",
      colaborador: "Laboratorio 1",
      cliente: "João Silva",
      fazenda: "Fazenda São João",
      talhao: "Talhão A1",
      quantidade: 5,
      status: "Executando",
      dataEnvio: "2024-01-15",
      dataRecebimento: "2024-01-17",
      dataFinalizacao: ""
    },
    {
      id: "2",
      nomeAnalise: "Foliar",
      colaborador: "Laboratorio 2",
      cliente: "Maria Santos",
      fazenda: "Fazenda Santa Maria",
      talhao: "Talhão B2",
      quantidade: 3,
      status: "Finalizado",
      dataEnvio: "2024-01-10",
      dataRecebimento: "2024-01-12",
      dataFinalizacao: "2024-01-18"
    },
    {
      id: "3",
      nomeAnalise: "Compactação",
      colaborador: "Laboratorio 1",
      cliente: "Pedro Oliveira",
      fazenda: "Fazenda Boa Vista",
      talhao: "Talhão C3",
      quantidade: 2,
      status: "Pendente",
      dataEnvio: "",
      dataRecebimento: "",
      dataFinalizacao: ""
    },
    {
      id: "4",
      nomeAnalise: "Macro+S",
      colaborador: "Laboratorio 2",
      cliente: "Maria Santos",
      fazenda: "Fazenda Santa Maria",
      talhao: "Talhão D4",
      quantidade: 4,
      status: "Enviado",
      dataEnvio: "2024-01-20",
      dataRecebimento: "",
      dataFinalizacao: ""
    },
    {
      id: "5",
      nomeAnalise: "Macro+S+P_rem",
      colaborador: "Laboratorio 1",
      cliente: "João Silva",
      fazenda: "Fazenda São João",
      talhao: "Talhão A1",
      quantidade: 1,
      status: "Recebido",
      dataEnvio: "2024-01-18",
      dataRecebimento: "2024-01-22",
      dataFinalizacao: ""
    }
  ]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [colaboradorFilter, setColaboradorFilter] = useState("");

  const [analisesPage, setAnalisesPage] = useState(1);
  const [analisesPerPage, setAnalisesPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnalise, setEditingAnalise] = useState<AnaliseExecucao | null>(null);
  const [formData, setFormData] = useState<AnaliseExecucao>({
    id: "",
    nomeAnalise: "",
    colaborador: "",
    cliente: "",
    fazenda: "",
    talhao: "",
    quantidade: 0,
    status: "Pendente",
    dataEnvio: "",
    dataRecebimento: "",
    dataFinalizacao: ""
  });

  // Filtrar análises baseado nos critérios de busca
  const filteredAnalises = analises.filter(analise => {
    const matchesSearch = analise.colaborador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.fazenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.talhao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analise.nomeAnalise.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColaborador = !colaboradorFilter || analise.colaborador === colaboradorFilter;
    
    return matchesSearch && matchesColaborador;
  });

  // Pagination logic
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
      cliente: "",
      fazenda: "",
      talhao: "",
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
                  <SelectItem value="">Todos os colaboradores</SelectItem>
                  {colaboradoresConfig.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.nome}>
                      {colaborador.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Análise</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fazenda</TableHead>
                    <TableHead>Talhão</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Data de Recebimento</TableHead>
                    <TableHead>Data de Finalização</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAnalises.map((analise) => (
                    <TableRow key={analise.id}>
                      <TableCell className="font-medium">{analise.nomeAnalise}</TableCell>
                      <TableCell>{analise.colaborador}</TableCell>
                      <TableCell>{analise.cliente}</TableCell>
                      <TableCell>{analise.fazenda}</TableCell>
                      <TableCell>{analise.talhao}</TableCell>
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {analisesStartIndex + 1} a {Math.min(analisesEndIndex, totalAnalises)} de {totalAnalises} análises
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
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">por página</span>
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
        </CardContent>
      </Card>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Análise</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colaborador">Colaborador</Label>
                <Select
                  value={formData.colaborador}
                  onValueChange={(value) => handleInputChange("colaborador", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradoresConfig.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.nome}>
                        {colaborador.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select
                  value={formData.cliente}
                  onValueChange={(value) => handleInputChange("cliente", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientesDisponiveis.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.nome}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fazenda">Fazenda</Label>
                <Select
                  value={formData.fazenda}
                  onValueChange={(value) => handleInputChange("fazenda", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fazenda" />
                  </SelectTrigger>
                  <SelectContent>
                    {fazendasDisponiveis.map((fazenda) => (
                      <SelectItem key={fazenda.id} value={fazenda.nome}>
                        {fazenda.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="talhao">Talhão</Label>
                <Select
                  value={formData.talhao}
                  onValueChange={(value) => handleInputChange("talhao", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o talhão" />
                  </SelectTrigger>
                  <SelectContent>
                    {talhoesDisponiveis.map((talhao) => (
                      <SelectItem key={talhao.id} value={talhao.nome}>
                        {talhao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
