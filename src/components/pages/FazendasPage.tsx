import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, MapPin, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Talhao {
  id: string;
  nome: string;
  matricula: string;
  cidade: string;
  estado: string;
  alqueires: number;
  hectares: number;
}

interface Fazenda {
  id: string;
  nome: string;
  matricula: string;
  cidade: string;
  estado: string;
  alqueires: number;
  hectares: number;
  clienteCpf: string;
  talhoes: Talhao[];
}

interface FazendasPageProps {
  selectedClienteCpf?: string;
}

const FazendasPage = ({ selectedClienteCpf }: FazendasPageProps) => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([
    {
      id: "1",
      nome: "Fazenda São João",
      matricula: "12345",
      cidade: "Ribeirão Preto",
      estado: "SP",
      alqueires: 100,
      hectares: 242,
      clienteCpf: "123.456.789-00",
      talhoes: []
    }
  ]);

  const [showFazendaForm, setShowFazendaForm] = useState(false);
  const [showTalhaoForm, setShowTalhaoForm] = useState(false);
  const [selectedFazendaForTalhao, setSelectedFazendaForTalhao] = useState<string | null>(null);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [editingTalhao, setEditingTalhao] = useState<Talhao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFazenda, setExpandedFazenda] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();

  const [fazendaForm, setFazendaForm] = useState({
    nome: "",
    matricula: "",
    cidade: "",
    estado: "",
    alqueires: "",
    hectares: "",
    clienteCpf: selectedClienteCpf || ""
  });

  const [talhaoForm, setTalhaoForm] = useState({
    nome: "",
    matricula: "",
    cidade: "",
    estado: "",
    alqueires: "",
    hectares: ""
  });

  useEffect(() => {
    console.log("selectedClienteCpf mudou:", selectedClienteCpf);
    if (selectedClienteCpf) {
      setFazendaForm(prev => ({ ...prev, clienteCpf: selectedClienteCpf }));
    }
  }, [selectedClienteCpf]);

  // Conversão: 1 alqueire = 2.42 hectares
  const convertAlqueiresToHectares = (alqueires: number) => alqueires * 2.42;
  const convertHectaresToAlqueires = (hectares: number) => hectares / 2.42;

  const updateTotaisFazenda = (fazendaId: string, talhoes: Talhao[]) => {
    const totalAlqueires = talhoes.reduce((sum, t) => sum + t.alqueires, 0);
    const totalHectares = talhoes.reduce((sum, t) => sum + t.hectares, 0);
    
    setFazendas(prev => prev.map(f => 
      f.id === fazendaId 
        ? { ...f, alqueires: totalAlqueires, hectares: totalHectares }
        : f
    ));
  };

  const handleFazendaAlqueiresChange = (value: string) => {
    const alqueires = parseFloat(value) || 0;
    setFazendaForm({
      ...fazendaForm,
      alqueires: value,
      hectares: alqueires > 0 ? convertAlqueiresToHectares(alqueires).toFixed(2) : ""
    });
  };

  const handleFazendaHectaresChange = (value: string) => {
    const hectares = parseFloat(value) || 0;
    setFazendaForm({
      ...fazendaForm,
      hectares: value,
      alqueires: hectares > 0 ? convertHectaresToAlqueires(hectares).toFixed(2) : ""
    });
  };

  const handleTalhaoAlqueiresChange = (value: string) => {
    const alqueires = parseFloat(value) || 0;
    setTalhaoForm({
      ...talhaoForm,
      alqueires: value,
      hectares: alqueires > 0 ? convertAlqueiresToHectares(alqueires).toFixed(2) : ""
    });
  };

  const handleTalhaoHectaresChange = (value: string) => {
    const hectares = parseFloat(value) || 0;
    setTalhaoForm({
      ...talhaoForm,
      hectares: value,
      alqueires: hectares > 0 ? convertHectaresToAlqueires(hectares).toFixed(2) : ""
    });
  };

  const handleFazendaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submetendo fazenda:", fazendaForm);
    
    const alqueires = parseFloat(fazendaForm.alqueires) || 0;
    const hectares = parseFloat(fazendaForm.hectares) || 0;

    if (editingFazenda) {
      console.log("Editando fazenda existente:", editingFazenda.id);
      setFazendas(fazendas.map(f => 
        f.id === editingFazenda.id ? {
          ...f,
          nome: fazendaForm.nome,
          matricula: fazendaForm.matricula,
          cidade: fazendaForm.cidade,
          estado: fazendaForm.estado,
          alqueires,
          hectares,
          clienteCpf: fazendaForm.clienteCpf
        } : f
      ));
      toast({ title: "Fazenda atualizada com sucesso!" });
    } else {
      console.log("Criando nova fazenda");
      const newFazenda: Fazenda = {
        id: Date.now().toString(),
        nome: fazendaForm.nome,
        matricula: fazendaForm.matricula,
        cidade: fazendaForm.cidade,
        estado: fazendaForm.estado,
        alqueires,
        hectares,
        clienteCpf: fazendaForm.clienteCpf,
        talhoes: []
      };
      setFazendas([...fazendas, newFazenda]);
      toast({ title: "Fazenda cadastrada com sucesso!" });
    }

    resetFazendaForm();
  };

  const handleTalhaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submetendo talhão:", talhaoForm);
    
    if (!selectedFazendaForTalhao) {
      console.log("Nenhuma fazenda selecionada para o talhão");
      return;
    }

    const alqueires = parseFloat(talhaoForm.alqueires) || 0;
    const hectares = parseFloat(talhaoForm.hectares) || 0;

    if (editingTalhao) {
      console.log("Editando talhão existente:", editingTalhao.id);
      setFazendas(prev => prev.map(f => {
        if (f.id === selectedFazendaForTalhao) {
          const updatedTalhoes = f.talhoes.map(t => 
            t.id === editingTalhao.id 
              ? { 
                  ...t,
                  nome: talhaoForm.nome,
                  matricula: talhaoForm.matricula,
                  cidade: talhaoForm.cidade,
                  estado: talhaoForm.estado,
                  alqueires,
                  hectares
                }
              : t
          );
          updateTotaisFazenda(f.id, updatedTalhoes);
          return { ...f, talhoes: updatedTalhoes };
        }
        return f;
      }));
      toast({ title: "Talhão atualizado com sucesso!" });
    } else {
      console.log("Criando novo talhão");
      const newTalhao: Talhao = {
        id: Date.now().toString(),
        nome: talhaoForm.nome,
        matricula: talhaoForm.matricula,
        cidade: talhaoForm.cidade,
        estado: talhaoForm.estado,
        alqueires,
        hectares
      };

      setFazendas(prev => prev.map(f => {
        if (f.id === selectedFazendaForTalhao) {
          const updatedTalhoes = [...f.talhoes, newTalhao];
          updateTotaisFazenda(f.id, updatedTalhoes);
          return { ...f, talhoes: updatedTalhoes };
        }
        return f;
      }));
      toast({ title: "Talhão cadastrado com sucesso!" });
    }

    resetTalhaoForm();
  };

  const handleDeleteTalhao = (fazendaId: string, talhaoId: string) => {
    console.log("Deletando talhão:", talhaoId, "da fazenda:", fazendaId);
    setFazendas(prev => prev.map(f => {
      if (f.id === fazendaId) {
        const updatedTalhoes = f.talhoes.filter(t => t.id !== talhaoId);
        updateTotaisFazenda(f.id, updatedTalhoes);
        return { ...f, talhoes: updatedTalhoes };
      }
      return f;
    }));
    toast({ title: "Talhão removido com sucesso!" });
  };

  const resetFazendaForm = () => {
    console.log("Resetando formulário de fazenda");
    setFazendaForm({
      nome: "",
      matricula: "",
      cidade: "",
      estado: "",
      alqueires: "",
      hectares: "",
      clienteCpf: selectedClienteCpf || ""
    });
    setShowFazendaForm(false);
    setEditingFazenda(null);
  };

  const resetTalhaoForm = () => {
    console.log("Resetando formulário de talhão");
    setTalhaoForm({
      nome: "",
      matricula: "",
      cidade: "",
      estado: "",
      alqueires: "",
      hectares: ""
    });
    setShowTalhaoForm(false);
    setSelectedFazendaForTalhao(null);
    setEditingTalhao(null);
  };

  const handleEditFazenda = (fazenda: Fazenda) => {
    console.log("Iniciando edição da fazenda:", fazenda);
    setFazendaForm({
      nome: fazenda.nome,
      matricula: fazenda.matricula,
      cidade: fazenda.cidade,
      estado: fazenda.estado,
      alqueires: fazenda.alqueires.toString(),
      hectares: fazenda.hectares.toString(),
      clienteCpf: fazenda.clienteCpf
    });
    setEditingFazenda(fazenda);
    setShowFazendaForm(true);
  };

  const handleEditTalhao = (fazendaId: string, talhao: Talhao) => {
    console.log("Iniciando edição do talhão:", talhao, "da fazenda:", fazendaId);
    setTalhaoForm({
      nome: talhao.nome,
      matricula: talhao.matricula,
      cidade: talhao.cidade,
      estado: talhao.estado,
      alqueires: talhao.alqueires.toString(),
      hectares: talhao.hectares.toString()
    });
    setSelectedFazendaForTalhao(fazendaId);
    setEditingTalhao(talhao);
    setShowTalhaoForm(true);
  };

  const filteredFazendas = fazendas.filter(fazenda => {
    const matchesSearch = fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.matricula.includes(searchTerm) ||
      fazenda.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClient = selectedClienteCpf ? fazenda.clienteCpf === selectedClienteCpf : true;
    
    return matchesSearch && matchesClient;
  });

  // Get talhões for the selected fazenda when editing/creating
  const getTalhoesForSelectedFazenda = () => {
    if (editingFazenda) {
      return editingFazenda.talhoes;
    }
    if (selectedFazendaForTalhao) {
      const fazenda = fazendas.find(f => f.id === selectedFazendaForTalhao);
      return fazenda?.talhoes || [];
    }
    return [];
  };

  const shouldShowTalhoesList = editingFazenda || selectedFazendaForTalhao;
  const talhoesForDisplay = getTalhoesForSelectedFazenda();

  const totalItems = filteredFazendas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFazendas = filteredFazendas.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold tracking-tight">Fazendas</h1>
          <p className="text-gray-600">
            Gerencie as fazendas e talhões
            {selectedClienteCpf && ` - Cliente: ${selectedClienteCpf}`}
          </p>
        </div>
        <Button onClick={() => setShowFazendaForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Fazenda
        </Button>
      </div>

      {showFazendaForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFazenda ? "Editar Fazenda" : "Nova Fazenda"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFazendaSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clienteCpf">CPF do Cliente</Label>
                <Input
                  id="clienteCpf"
                  value={fazendaForm.clienteCpf}
                  onChange={(e) => setFazendaForm({...fazendaForm, clienteCpf: e.target.value})}
                  placeholder="123.456.789-00"
                  required
                  disabled={!!selectedClienteCpf}
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={fazendaForm.nome}
                  onChange={(e) => setFazendaForm({...fazendaForm, nome: e.target.value})}
                  placeholder="Nome da fazenda"
                  required
                />
              </div>
              <div>
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  value={fazendaForm.matricula}
                  onChange={(e) => setFazendaForm({...fazendaForm, matricula: e.target.value})}
                  placeholder="Matrícula"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={fazendaForm.cidade}
                  onChange={(e) => setFazendaForm({...fazendaForm, cidade: e.target.value})}
                  placeholder="Cidade"
                  required
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={fazendaForm.estado}
                  onChange={(e) => setFazendaForm({...fazendaForm, estado: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label htmlFor="alqueires">Alqueires</Label>
                <Input
                  id="alqueires"
                  type="number"
                  step="0.01"
                  value={fazendaForm.alqueires}
                  onChange={(e) => handleFazendaAlqueiresChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="hectares">Hectares</Label>
                <Input
                  id="hectares"
                  type="number"
                  step="0.01"
                  value={fazendaForm.hectares}
                  onChange={(e) => handleFazendaHectaresChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingFazenda ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetFazendaForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showTalhaoForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTalhao ? "Editar Talhão" : "Novo Talhão"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTalhaoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="talhaoNome">Nome do Talhão</Label>
                <Input
                  id="talhaoNome"
                  value={talhaoForm.nome}
                  onChange={(e) => setTalhaoForm({...talhaoForm, nome: e.target.value})}
                  placeholder="Nome do talhão"
                  required
                />
              </div>
              <div>
                <Label htmlFor="talhaoMatricula">Matrícula</Label>
                <Input
                  id="talhaoMatricula"
                  value={talhaoForm.matricula}
                  onChange={(e) => setTalhaoForm({...talhaoForm, matricula: e.target.value})}
                  placeholder="Matrícula"
                  required
                />
              </div>
              <div>
                <Label htmlFor="talhaoCidade">Cidade</Label>
                <Input
                  id="talhaoCidade"
                  value={talhaoForm.cidade}
                  onChange={(e) => setTalhaoForm({...talhaoForm, cidade: e.target.value})}
                  placeholder="Cidade"
                  required
                />
              </div>
              <div>
                <Label htmlFor="talhaoEstado">Estado</Label>
                <Input
                  id="talhaoEstado"
                  value={talhaoForm.estado}
                  onChange={(e) => setTalhaoForm({...talhaoForm, estado: e.target.value})}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <Label htmlFor="talhaoAlqueires">Alqueires</Label>
                <Input
                  id="talhaoAlqueires"
                  type="number"
                  step="0.01"
                  value={talhaoForm.alqueires}
                  onChange={(e) => handleTalhaoAlqueiresChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="talhaoHectares">Hectares</Label>
                <Input
                  id="talhaoHectares"
                  type="number"
                  step="0.01"
                  value={talhaoForm.hectares}
                  onChange={(e) => handleTalhaoHectaresChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingTalhao ? "Atualizar" : "Cadastrar"} Talhão
                </Button>
                <Button type="button" variant="outline" onClick={resetTalhaoForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {shouldShowTalhoesList && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Lista de Talhões
                {editingFazenda && ` - ${editingFazenda.nome}`}
                {selectedFazendaForTalhao && !editingFazenda && 
                  ` - ${fazendas.find(f => f.id === selectedFazendaForTalhao)?.nome}`
                }
              </CardTitle>
              {editingFazenda && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedFazendaForTalhao(editingFazenda.id);
                    setShowTalhaoForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Talhão
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {talhoesForDisplay.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum talhão cadastrado para esta fazenda.
                </p>
              ) : (
                talhoesForDisplay.map((talhao) => (
                  <div key={talhao.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                      <div>
                        <div className="font-medium">{talhao.nome}</div>
                        <div className="text-sm text-gray-500">Mat: {talhao.matricula}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Localização</div>
                        <div>{talhao.cidade}/{talhao.estado}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Alqueires</div>
                        <div>{talhao.alqueires.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Hectares</div>
                        <div>{talhao.hectares.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTalhao(
                          editingFazenda?.id || selectedFazendaForTalhao || '', 
                          talhao
                        )}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTalhao(
                          editingFazenda?.id || selectedFazendaForTalhao || '', 
                          talhao.id
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!shouldShowTalhoesList && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Fazendas</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar fazenda..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentFazendas.map((fazenda) => (
                <div key={fazenda.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1">
                      <div>
                        <div className="font-medium">{fazenda.nome}</div>
                        <div className="text-sm text-gray-500">Mat: {fazenda.matricula}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">CPF Cliente</div>
                        <div className="font-medium">{fazenda.clienteCpf}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Localização</div>
                        <div>{fazenda.cidade}/{fazenda.estado}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Alqueires</div>
                        <div>{fazenda.alqueires.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Hectares</div>
                        <div>{fazenda.hectares.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Talhões</div>
                        <div>{fazenda.talhoes.length}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFazenda(fazenda)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log("Abrindo formulário de talhão para fazenda:", fazenda.id);
                          setSelectedFazendaForTalhao(fazenda.id);
                          setShowTalhaoForm(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Talhão
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedFazenda(expandedFazenda === fazenda.id ? null : fazenda.id)}
                      >
                        <MapPin className="h-4 w-4" />
                        Ver Talhões
                      </Button>
                    </div>
                  </div>

                  {expandedFazenda === fazenda.id && fazenda.talhoes.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-2">Talhões</h4>
                      <div className="space-y-2">
                        {fazenda.talhoes.map((talhao) => (
                          <div key={talhao.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                              <div>
                                <div className="font-medium">{talhao.nome}</div>
                                <div className="text-sm text-gray-500">Mat: {talhao.matricula}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Localização</div>
                                <div>{talhao.cidade}/{talhao.estado}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Alqueires</div>
                                <div>{talhao.alqueires.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Hectares</div>
                                <div>{talhao.hectares.toFixed(2)}</div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTalhao(fazenda.id, talhao)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTalhao(fazenda.id, talhao.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination Controls for Fazendas */}
              {totalItems > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} fazendas
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
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FazendasPage;
