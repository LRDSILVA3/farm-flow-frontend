
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, MapPin, Search } from "lucide-react";
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
  talhoes: Talhao[];
}

const FazendasPage = () => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([
    {
      id: "1",
      nome: "Fazenda São João",
      matricula: "12345",
      cidade: "Ribeirão Preto",
      estado: "SP",
      alqueires: 100,
      hectares: 242,
      talhoes: []
    }
  ]);

  const [showFazendaForm, setShowFazendaForm] = useState(false);
  const [showTalhaoForm, setShowTalhaoForm] = useState(false);
  const [selectedFazenda, setSelectedFazenda] = useState<string | null>(null);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [fazendaForm, setFazendaForm] = useState({
    nome: "",
    matricula: "",
    cidade: "",
    estado: "",
    alqueires: "",
    hectares: ""
  });

  const [talhaoForm, setTalhaoForm] = useState({
    nome: "",
    matricula: "",
    cidade: "",
    estado: "",
    alqueires: "",
    hectares: ""
  });

  // Conversão: 1 alqueire = 2.42 hectares
  const convertAlqueiresToHectares = (alqueires: number) => alqueires * 2.42;
  const convertHectaresToAlqueires = (hectares: number) => hectares / 2.42;

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

    const newTalhao: Talhao = {
      id: Date.now().toString(),
      ...talhaoForm,
      alqueires,
      hectares
    };

    setFazendas(fazendas.map(f => {
      if (f.id === selectedFazenda) {
        const updatedTalhoes = [...f.talhoes, newTalhao];
        const totalAlqueires = updatedTalhoes.reduce((sum, t) => sum + t.alqueires, 0);
        const totalHectares = updatedTalhoes.reduce((sum, t) => sum + t.hectares, 0);
        
        return {
          ...f,
          talhoes: updatedTalhoes,
          alqueires: totalAlqueires,
          hectares: totalHectares
        };
      }
      return f;
    }));

    toast({ title: "Talhão cadastrado com sucesso!" });
    resetTalhaoForm();
  };

  const resetFazendaForm = () => {
    setFazendaForm({
      nome: "",
      matricula: "",
      cidade: "",
      estado: "",
      alqueires: "",
      hectares: ""
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
  };

  const handleEditFazenda = (fazenda: Fazenda) => {
    setFazendaForm({
      nome: fazenda.nome,
      matricula: fazenda.matricula,
      cidade: fazenda.cidade,
      estado: fazenda.estado,
      alqueires: fazenda.alqueires.toString(),
      hectares: fazenda.hectares.toString()
    });
    setEditingFazenda(fazenda);
    setShowFazendaForm(true);
  };

  const filteredFazendas = fazendas.filter(fazenda =>
    fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fazenda.matricula.includes(searchTerm) ||
    fazenda.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fazendas</h1>
          <p className="text-gray-600">Gerencie as fazendas e talhões</p>
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
            <CardTitle>Novo Talhão</CardTitle>
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
                  Cadastrar Talhão
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Cidade/Estado</TableHead>
                <TableHead>Alqueires</TableHead>
                <TableHead>Hectares</TableHead>
                <TableHead>Talhões</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFazendas.map((fazenda) => (
                <TableRow key={fazenda.id}>
                  <TableCell className="font-medium">{fazenda.nome}</TableCell>
                  <TableCell>{fazenda.matricula}</TableCell>
                  <TableCell>{fazenda.cidade}/{fazenda.estado}</TableCell>
                  <TableCell>{fazenda.alqueires.toFixed(2)}</TableCell>
                  <TableCell>{fazenda.hectares.toFixed(2)}</TableCell>
                  <TableCell>{fazenda.talhoes.length}</TableCell>
                  <TableCell>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FazendasPage;
