import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Settings, Package, Wrench, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Servico {
  id: string;
  nome: string;
  valorAlqueire: string;
  status: string;
  produtos: string;
}

interface Produto {
  id: string;
  nome: string;
  valorUn: string;
  status: string;
}

interface Equipamento {
  id: string;
  nome: string;
  status: string;
}

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("operacionais");

  const [servicos, setServicos] = useState<Servico[]>([
    { id: "1", nome: "Pulverização", valorAlqueire: "200.00", status: "Ativo", produtos: "Defensivo A, Defensivo B" },
    { id: "2", nome: "Plantio", valorAlqueire: "150.00", status: "Ativo", produtos: "Sementes, Fertilizante" }
  ]);

  const [produtos, setProdutos] = useState<Produto[]>([
    { id: "1", nome: "Defensivo A", valorUn: "45.00", status: "Ativo" },
    { id: "2", nome: "Sementes Milho", valorUn: "120.00", status: "Ativo" }
  ]);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([
    { id: "1", nome: "Caminhão 01", status: "Disponível" },
    { id: "2", nome: "Colheitadeira 01", status: "Em Manutenção" }
  ]);

  // Pagination states
  const [servicosPage, setServicosPage] = useState(1);
  const [servicosPerPage, setServicosPerPage] = useState(10);
  const [produtosPage, setProdutosPage] = useState(1);
  const [produtosPerPage, setProdutosPerPage] = useState(10);
  const [equipamentosPage, setEquipamentosPage] = useState(1);
  const [equipamentosPerPage, setEquipamentosPerPage] = useState(10);

  // Estados para modal de serviços
  const [showServicoForm, setShowServicoForm] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [servicoFormData, setServicoFormData] = useState<Servico>({
    id: "",
    nome: "",
    valorAlqueire: "",
    status: "Ativo",
    produtos: ""
  });

  // Estados para modal de produtos
  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [produtoFormData, setProdutoFormData] = useState<Produto>({
    id: "",
    nome: "",
    valorUn: "",
    status: "Ativo"
  });

  // Estados para modal de equipamentos
  const [showEquipamentoForm, setShowEquipamentoForm] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);
  const [equipamentoFormData, setEquipamentoFormData] = useState<Equipamento>({
    id: "",
    nome: "",
    status: "Disponível"
  });

  // Menu items for configuration sections
  const menuSections = [
    {
      id: "operacionais",
      title: "Configurações Operacionais",
      icon: Settings,
      description: "Serviços, produtos e equipamentos"
    },
    {
      id: "sistema",
      title: "Configurações do Sistema",
      icon: Settings,
      description: "Configurações gerais do sistema"
    },
    {
      id: "usuarios",
      title: "Usuários e Permissões",
      icon: Settings,
      description: "Gerenciar usuários e acessos"
    }
  ];

  const handleEditServico = (servico: Servico) => {
    console.log("Editando serviço:", servico);
    setEditingServico(servico);
    setServicoFormData(servico);
    setShowServicoForm(true);
  };

  const handleServicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingServico) {
      // Atualizar serviço existente
      setServicos(prev => prev.map(s => s.id === editingServico.id ? servicoFormData : s));
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    } else {
      // Criar novo serviço
      const newServico = { ...servicoFormData, id: Date.now().toString() };
      setServicos(prev => [...prev, newServico]);
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    }
    
    resetServicoForm();
  };

  const resetServicoForm = () => {
    setServicoFormData({
      id: "",
      nome: "",
      valorAlqueire: "",
      status: "Ativo",
      produtos: ""
    });
    setEditingServico(null);
    setShowServicoForm(false);
  };

  const handleServicoInputChange = (field: keyof Servico, value: string) => {
    setServicoFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditProduto = (produto: Produto) => {
    console.log("Editando produto:", produto);
    setEditingProduto(produto);
    setProdutoFormData(produto);
    setShowProdutoForm(true);
  };

  const handleProdutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduto) {
      // Atualizar produto existente
      setProdutos(prev => prev.map(p => p.id === editingProduto.id ? produtoFormData : p));
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    } else {
      // Criar novo produto
      const newProduto = { ...produtoFormData, id: Date.now().toString() };
      setProdutos(prev => [...prev, newProduto]);
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
    }
    
    resetProdutoForm();
  };

  const resetProdutoForm = () => {
    setProdutoFormData({
      id: "",
      nome: "",
      valorUn: "",
      status: "Ativo"
    });
    setEditingProduto(null);
    setShowProdutoForm(false);
  };

  const handleProdutoInputChange = (field: keyof Produto, value: string) => {
    setProdutoFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditEquipamento = (equipamento: Equipamento) => {
    console.log("Editando equipamento:", equipamento);
    setEditingEquipamento(equipamento);
    setEquipamentoFormData(equipamento);
    setShowEquipamentoForm(true);
  };

  const handleEquipamentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEquipamento) {
      // Atualizar equipamento existente
      setEquipamentos(prev => prev.map(e => e.id === editingEquipamento.id ? equipamentoFormData : e));
      toast({
        title: "Equipamento atualizado",
        description: "O equipamento foi atualizado com sucesso.",
      });
    } else {
      // Criar novo equipamento
      const newEquipamento = { ...equipamentoFormData, id: Date.now().toString() };
      setEquipamentos(prev => [...prev, newEquipamento]);
      toast({
        title: "Equipamento criado",
        description: "O equipamento foi criado com sucesso.",
      });
    }
    
    resetEquipamentoForm();
  };

  const resetEquipamentoForm = () => {
    setEquipamentoFormData({
      id: "",
      nome: "",
      status: "Disponível"
    });
    setEditingEquipamento(null);
    setShowEquipamentoForm(false);
  };

  const handleEquipamentoInputChange = (field: keyof Equipamento, value: string) => {
    setEquipamentoFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination logic for serviços
  const totalServicos = servicos.length;
  const totalServicosPages = Math.ceil(totalServicos / servicosPerPage);
  const servicosStartIndex = (servicosPage - 1) * servicosPerPage;
  const servicosEndIndex = servicosStartIndex + servicosPerPage;
  const currentServicos = servicos.slice(servicosStartIndex, servicosEndIndex);

  // Pagination logic for produtos
  const totalProdutos = produtos.length;
  const totalProdutosPages = Math.ceil(totalProdutos / produtosPerPage);
  const produtosStartIndex = (produtosPage - 1) * produtosPerPage;
  const produtosEndIndex = produtosStartIndex + produtosPerPage;
  const currentProdutos = produtos.slice(produtosStartIndex, produtosEndIndex);

  // Pagination logic for equipamentos
  const totalEquipamentos = equipamentos.length;
  const totalEquipamentosPages = Math.ceil(totalEquipamentos / equipamentosPerPage);
  const equipamentosStartIndex = (equipamentosPage - 1) * equipamentosPerPage;
  const equipamentosEndIndex = equipamentosStartIndex + equipamentosPerPage;
  const currentEquipamentos = equipamentos.slice(equipamentosStartIndex, equipamentosEndIndex);

  const renderOperacionaisSection = () => (
    <Tabs defaultValue="servicos" className="space-y-4">
      <TabsList>
        <TabsTrigger value="servicos">
          <Settings className="h-4 w-4 mr-2" />
          Serviços
        </TabsTrigger>
        <TabsTrigger value="produtos">
          <Package className="h-4 w-4 mr-2" />
          Produtos
        </TabsTrigger>
        <TabsTrigger value="equipamentos">
          <Truck className="h-4 w-4 mr-2" />
          Equipamentos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="servicos">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Serviços</CardTitle>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowServicoForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor por Alqueire</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentServicos.map((servico) => (
                    <TableRow key={servico.id}>
                      <TableCell className="font-medium">{servico.nome}</TableCell>
                      <TableCell>R$ {servico.valorAlqueire}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {servico.status}
                        </span>
                      </TableCell>
                      <TableCell>{servico.produtos}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditServico(servico)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination for Serviços */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Mostrando {servicosStartIndex + 1} a {Math.min(servicosEndIndex, totalServicos)} de {totalServicos} serviços
                  </span>
                  <Select value={servicosPerPage.toString()} onValueChange={(value) => {
                    setServicosPerPage(Number(value));
                    setServicosPage(1);
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
                
                {totalServicosPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setServicosPage(Math.max(1, servicosPage - 1))}
                          className={servicosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalServicosPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setServicosPage(page)}
                            isActive={servicosPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setServicosPage(Math.min(totalServicosPages, servicosPage + 1))}
                          className={servicosPage === totalServicosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="produtos">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produtos</CardTitle>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowProdutoForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>R$ {produto.valorUn}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {produto.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduto(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination for Produtos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Mostrando {produtosStartIndex + 1} a {Math.min(produtosEndIndex, totalProdutos)} de {totalProdutos} produtos
                  </span>
                  <Select value={produtosPerPage.toString()} onValueChange={(value) => {
                    setProdutosPerPage(Number(value));
                    setProdutosPage(1);
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
                
                {totalProdutosPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setProdutosPage(Math.max(1, produtosPage - 1))}
                          className={produtosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalProdutosPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setProdutosPage(page)}
                            isActive={produtosPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setProdutosPage(Math.min(totalProdutosPages, produtosPage + 1))}
                          className={produtosPage === totalProdutosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="equipamentos">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Equipamentos</CardTitle>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowEquipamentoForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEquipamentos.map((equipamento) => (
                    <TableRow key={equipamento.id}>
                      <TableCell className="font-medium">{equipamento.nome}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          equipamento.status === "Disponível" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {equipamento.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEquipamento(equipamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination for Equipamentos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Mostrando {equipamentosStartIndex + 1} a {Math.min(equipamentosEndIndex, totalEquipamentos)} de {totalEquipamentos} equipamentos
                  </span>
                  <Select value={equipamentosPerPage.toString()} onValueChange={(value) => {
                    setEquipamentosPerPage(Number(value));
                    setEquipamentosPage(1);
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
                
                {totalEquipamentosPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setEquipamentosPage(Math.max(1, equipamentosPage - 1))}
                          className={equipamentosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalEquipamentosPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setEquipamentosPage(page)}
                            isActive={equipamentosPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setEquipamentosPage(Math.min(totalEquipamentosPages, equipamentosPage + 1))}
                          className={equipamentosPage === totalEquipamentosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderSystemSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Seção em desenvolvimento</p>
          <p className="text-sm mt-2">Aqui você poderá configurar parâmetros gerais do sistema</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsersSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Usuários e Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Seção em desenvolvimento</p>
          <p className="text-sm mt-2">Aqui você poderá gerenciar usuários e suas permissões</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "operacionais":
        return renderOperacionaisSection();
      case "sistema":
        return renderSystemSection();
      case "usuarios":
        return renderUsersSection();
      default:
        return renderOperacionaisSection();
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Menu */}
      <div className="w-64 space-y-2">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-gray-600 text-sm">Gerencie as configurações do sistema</p>
        </div>
        
        {menuSections.map((section) => (
          <Card 
            key={section.id}
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              activeSection === section.id ? "border-green-500 bg-green-50" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <section.icon className={`h-5 w-5 mt-0.5 ${
                  activeSection === section.id ? "text-green-600" : "text-gray-500"
                }`} />
                <div>
                  <h3 className={`font-medium text-sm ${
                    activeSection === section.id ? "text-green-800" : "text-gray-900"
                  }`}>
                    {section.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderActiveSection()}
      </div>

      {/* Modal de Serviços */}
      <Dialog open={showServicoForm} onOpenChange={setShowServicoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingServico ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleServicoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Serviço</Label>
                <Input
                  id="nome"
                  value={servicoFormData.nome}
                  onChange={(e) => handleServicoInputChange("nome", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valorAlqueire">Valor por Alqueire</Label>
                <Input
                  id="valorAlqueire"
                  type="number"
                  step="0.01"
                  value={servicoFormData.valorAlqueire}
                  onChange={(e) => handleServicoInputChange("valorAlqueire", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={servicoFormData.status} onValueChange={(value) => handleServicoInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="produtos">Produtos Utilizados</Label>
                <Input
                  id="produtos"
                  value={servicoFormData.produtos}
                  onChange={(e) => handleServicoInputChange("produtos", e.target.value)}
                  placeholder="Ex: Defensivo A, Sementes"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetServicoForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingServico ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Produtos */}
      <Dialog open={showProdutoForm} onOpenChange={setShowProdutoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduto ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProdutoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="produtoNome">Nome do Produto</Label>
                <Input
                  id="produtoNome"
                  value={produtoFormData.nome}
                  onChange={(e) => handleProdutoInputChange("nome", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valorUn">Valor Unitário</Label>
                <Input
                  id="valorUn"
                  type="number"
                  step="0.01"
                  value={produtoFormData.valorUn}
                  onChange={(e) => handleProdutoInputChange("valorUn", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="produtoStatus">Status</Label>
              <Select value={produtoFormData.status} onValueChange={(value) => handleProdutoInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetProdutoForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingProduto ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Equipamentos */}
      <Dialog open={showEquipamentoForm} onOpenChange={setShowEquipamentoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEquipamento ? "Editar Equipamento" : "Novo Equipamento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEquipamentoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="equipamentoNome">Nome do Equipamento</Label>
              <Input
                id="equipamentoNome"
                value={equipamentoFormData.nome}
                onChange={(e) => handleEquipamentoInputChange("nome", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="equipamentoStatus">Status</Label>
              <Select value={equipamentoFormData.status} onValueChange={(value) => handleEquipamentoInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                  <SelectItem value="Em Uso">Em Uso</SelectItem>
                  <SelectItem value="Indisponível">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetEquipamentoForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingEquipamento ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfiguracoesPage;
