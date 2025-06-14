
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FazendasTable } from "./fazendas/FazendasTable";
import { FazendaForm } from "./fazendas/FazendaForm";
import { useFazendas } from "./fazendas/useFazendas";

export interface Talhao {
  id: string;
  nome: string;
  area: string;
  cultura: string;
  status: string;
}

export interface Fazenda {
  id: string;
  nome: string;
  proprietario: string;
  area: string;
  localizacao: string;
  contato: string;
  status: string;
  talhoes: Talhao[];
}

const FazendasPage = () => {
  const { toast } = useToast();
  const {
    fazendas,
    setFazendas,
    showFazendaForm,
    setShowFazendaForm,
    editingFazenda,
    setEditingFazenda,
    expandedFazendas,
    setExpandedFazendas,
    formData,
    setFormData,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    talhaoForm,
    setTalhaoForm
  } = useFazendas();

  const handleEdit = (fazenda: Fazenda) => {
    console.log("Editando fazenda:", fazenda);
    setEditingFazenda(fazenda);
    setFormData(fazenda);
    setShowFazendaForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFazenda) {
      setFazendas(prev => prev.map(f => f.id === editingFazenda.id ? formData : f));
      toast({
        title: "Fazenda atualizada",
        description: "A fazenda foi atualizada com sucesso.",
      });
    } else {
      const newFazenda = { ...formData, id: Date.now().toString() };
      setFazendas(prev => [...prev, newFazenda]);
      toast({
        title: "Fazenda criada",
        description: "A fazenda foi criada com sucesso.",
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      nome: "",
      proprietario: "",
      area: "",
      localizacao: "",
      contato: "",
      status: "Ativo",
      talhoes: []
    });
    setEditingFazenda(null);
    setShowFazendaForm(false);
  };

  const handleInputChange = (field: keyof Fazenda, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleExpand = (fazendaId: string) => {
    setExpandedFazendas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fazendaId)) {
        newSet.delete(fazendaId);
      } else {
        newSet.add(fazendaId);
      }
      return newSet;
    });
  };

  const handleAddTalhao = (fazendaId: string) => {
    const newTalhao = {
      ...talhaoForm,
      id: Date.now().toString()
    };

    setFazendas(prev => prev.map(fazenda => 
      fazenda.id === fazendaId 
        ? { ...fazenda, talhoes: [...fazenda.talhoes, newTalhao] }
        : fazenda
    ));

    setTalhaoForm({
      id: "",
      nome: "",
      area: "",
      cultura: "",
      status: "Preparando"
    });

    toast({
      title: "Talhão adicionado",
      description: "O talhão foi adicionado com sucesso.",
    });
  };

  const handleDeleteTalhao = (fazendaId: string, talhaoId: string) => {
    setFazendas(prev => prev.map(fazenda => 
      fazenda.id === fazendaId 
        ? { ...fazenda, talhoes: fazenda.talhoes.filter(t => t.id !== talhaoId) }
        : fazenda
    ));

    toast({
      title: "Talhão removido",
      description: "O talhão foi removido com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fazendas</h1>
          <p className="text-gray-600">Gerencie as fazendas e seus talhões</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowFazendaForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Fazenda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fazendas</CardTitle>
        </CardHeader>
        <CardContent>
          <FazendasTable
            fazendas={fazendas}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            expandedFazendas={expandedFazendas}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onEdit={handleEdit}
            onToggleExpand={handleToggleExpand}
            onAddTalhao={handleAddTalhao}
            onDeleteTalhao={handleDeleteTalhao}
          />
        </CardContent>
      </Card>

      <FazendaForm
        open={showFazendaForm}
        onOpenChange={setShowFazendaForm}
        editingFazenda={editingFazenda}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
    </div>
  );
};

export default FazendasPage;
