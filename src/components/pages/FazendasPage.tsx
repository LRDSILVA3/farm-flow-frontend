
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [selectedFazenda, setSelectedFazenda] = useState<string | null>(null);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [editingTalhao, setEditingTalhao] = useState<Talhao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFazenda, setExpandedFazenda] = useState<string | null>(null);
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
    
    const alqueires = parseFloat(fazendaForm.alqueires) || 0;
    const hectares = parseFloat(fazendaForm.hectares) || 0;

    if (editingFazenda) {
      setFazendas(fazendas.map(f => 
        f.id === editingFazenda.id ? {
          ...f,
          ...fazendaForm,
          alqueires,
          hectares
        } : f
      ));
      toast({ title: "Fazenda atualizada com sucesso!" });
    } else {
      const newFazenda: Fazenda = {
        id: Date.now().toString(),
        ...fazendaForm,
        alqueires,
        hectares,
        talhoes: []
      };
      setFazendas([...fazendas, newFazenda]);
      toast({ title: "Fazenda cadastrada com sucesso!" });
    }

    resetFazendaForm();
  };

  const handleTalhaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFazenda) return;

    const alqueires = parseFloat(talhaoForm.alqueires) || 0;
    const hectares = parseFloat(talhaoForm.hectares) || 0;

    if (editingTalhao) {
      setFazendas(prev => prev.map(f => {
        if (f.id === selectedFazenda) {
          const updatedTalhoes = f.talhoes.map(t => 
            t.id === editingTalhao.id 
              ? { ...talhaoForm, id: editingTalhao.id, alqueires, hectares }
              : t
          );
          updateTotaisFazenda(f.id, updatedTalhoes);
          return { ...f, talhoes: updatedTalhoes };
        }
        return f;
      }));
      toast({ title: "Talhão atualizado com sucesso!" });
    } else {
      const newTalhao: Talhao = {
        id: Date.now().toString(),
        ...talhaoForm,
        alqueires,
        hectares
      };

      setFazendas(prev => prev.map(f => {
        if (f.id === selectedFazenda) {
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
    setTalhaoForm({
      nome: "",
      matricula: "",
      cidade: "",
      estado: "",
      alqueires: "",
      hectares: ""
    });
    setShowTalhaoForm(false);
    setSelectedFazenda(null);
    setEditingTalhao(null);
  };

  const handleEditFazenda = (fazenda: Fazenda) => {
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
    setTalhaoForm({
      nome: talhao.nome,
      matricula: talhao.matricula,
      cidade: talhao.cidade,
      estado: talhao.estado,
      alqueires: talhao.alqueires.toString(),
      hectares: talhao.hectares.toString()
    });
    setSelectedFazenda(fazendaId);
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
            {filteredFazendas.map((fazenda) => (
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
                        setSelectedFazenda(fazenda.id);
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FazendasPage;
