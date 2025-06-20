import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  id: string;
  cpf: string;
  nome: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  cep: string;
  cidade: string;
  estado: string;
}

interface ClientesPageProps {
  onNavigateToFazendas: (clienteCpf: string) => void;
}

const estadosComCidades = {
  "SP": {
    label: "São Paulo",
    cidades: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba"]
  },
  "RJ": {
    label: "Rio de Janeiro", 
    cidades: ["Rio de Janeiro", "Niterói", "Petrópolis", "Nova Iguaçu", "Duque de Caxias"]
  },
  "MG": {
    label: "Minas Gerais",
    cidades: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"]
  },
  "DF": {
    label: "Distrito Federal",
    cidades: ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina"]
  },
  "BA": {
    label: "Bahia",
    cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"]
  },
  "PR": {
    label: "Paraná",
    cidades: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"]
  },
  "RS": {
    label: "Rio Grande do Sul",
    cidades: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"]
  },
  "GO": {
    label: "Goiás",
    cidades: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"]
  },
  "MS": {
    label: "Mato Grosso do Sul",
    cidades: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"]
  },
  "MT": {
    label: "Mato Grosso",
    cidades: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"]
  }
};

const ClientesPage = ({ onNavigateToFazendas }: ClientesPageProps) => {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: "1",
      cpf: "123.456.789-00",
      nome: "João Silva",
      dataNascimento: "1980-05-15",
      email: "joao@email.com",
      telefone: "(11) 99999-9999",
      cep: "01234-567",
      cidade: "São Paulo",
      estado: "SP"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    dataNascimento: "",
    email: "",
    telefone: "",
    cep: "",
    cidade: "",
    estado: ""
  });

  const handleEstadoChange = (estado: string) => {
    setFormData(prev => ({ ...prev, estado, cidade: "" }));
  };

  const cidadesDisponiveis = formData.estado && estadosComCidades[formData.estado as keyof typeof estadosComCidades] 
    ? estadosComCidades[formData.estado as keyof typeof estadosComCidades].cidades 
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      setClientes(clientes.map(c => 
        c.id === editingClient.id ? { ...formData, id: editingClient.id } : c
      ));
      toast({ title: "Cliente atualizado com sucesso!" });
    } else {
      const newClient: Cliente = {
        ...formData,
        id: Date.now().toString()
      };
      setClientes([...clientes, newClient]);
      toast({ title: "Cliente cadastrado com sucesso!" });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cpf: "",
      nome: "",
      dataNascimento: "",
      email: "",
      telefone: "",
      cep: "",
      cidade: "",
      estado: ""
    });
    setShowForm(false);
    setEditingClient(null);
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData({
      cpf: cliente.cpf,
      nome: cliente.nome,
      dataNascimento: cliente.dataNascimento,
      email: cliente.email,
      telefone: cliente.telefone,
      cep: cliente.cep,
      cidade: cliente.cidade,
      estado: cliente.estado
    });
    setEditingClient(cliente);
    setShowForm(true);
  };

  const handleNavigateToFazendas = (cpf: string) => {
    console.log("Navegando para fazendas do cliente:", cpf);
    onNavigateToFazendas(cpf);
  };

  // Obter lista única de cidades/estados para o filtro
  const cidadesEstados = Array.from(new Set(clientes.map(c => `${c.cidade}/${c.estado}`))).sort();

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpf.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCidadeEstado = !cidadeEstadoFilter || `${cliente.cidade}/${cliente.estado}` === cidadeEstadoFilter;
    
    return matchesSearch && matchesCidadeEstado;
  });

  // Pagination logic
  const totalItems = filteredClientes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClientes = filteredClientes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes da empresa</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="123.456.789-00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  placeholder="01234-567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={handleEstadoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(estadosComCidades).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Select 
                  value={formData.cidade} 
                  onValueChange={(value) => setFormData({...formData, cidade: value})}
                  disabled={!formData.estado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.estado ? "Selecione a cidade" : "Primeiro selecione o estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cidadesDisponiveis.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingClient ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={cidadeEstadoFilter} onValueChange={setCidadeEstadoFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Cidade/Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cidadesEstados.map((cidadeEstado) => (
                    <SelectItem key={cidadeEstado} value={cidadeEstado}>
                      {cidadeEstado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade/Estado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>{cliente.email}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.cidade}/{cliente.estado}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigateToFazendas(cliente.cpf)}
                          title="Ver fazendas do cliente"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} clientes
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesPage;
