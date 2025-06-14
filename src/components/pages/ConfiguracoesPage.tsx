
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
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

  const [servicos, setServicos] = useState<Servico[]>([
    { id: "1", nome: "Pulverização", valorAlqueire: "200.00", status: "Ativo", produtos: "Defensivo A, Defensivo B" },
    { id: "2", nome: "Plantio", valorAlqueire: "150.00", status: "Ativo", produtos: "Sementes, Fertilizante" }
  ]);

  const [produtos] = useState<Produto[]>([
    { id: "1", nome: "Defensivo A", valorUn: "45.00", status: "Ativo" },
    { id: "2", nome: "Sementes Milho", valorUn: "120.00", status: "Ativo" }
  ]);

  const [equipamentos] = useState<Equipamento[]>([
    { id: "1", nome: "Caminhão 01", status: "Disponível" },
    { id: "2", nome: "Colheitadeira 01", status: "Em Manutenção" }
  ]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-gray-600">Gerencie serviços, produtos e equipamentos</p>
      </div>

      <Tabs defaultValue="servicos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
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
                  {servicos.map((servico) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </CardHeader>
            <CardContent>
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
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>R$ {produto.valorUn}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          {produto.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Equipamentos</CardTitle>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipamentos.map((equipamento) => (
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
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default ConfiguracoesPage;
