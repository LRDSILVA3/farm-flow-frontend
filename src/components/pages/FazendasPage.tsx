import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FazendasTable } from "./fazendas/FazendasTable";
import { FazendaForm } from "./fazendas/FazendaForm";
import { TalhoesModal } from "./fazendas/TalhoesModal";
import { useFazendas } from "./fazendas/useFazendas";

export interface Talhao {
  id: string;
  nome: string;
  area: string;
  status: string;
  cidade: string;
  estado: string;
  matricula: string;
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
    showTalhoesModal,
    setShowTalhoesModal,
    selectedFazenda,
    setSelectedFazenda,
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

  const handleViewTalhoes = (fazenda: Fazenda) => {
    setSelectedFazenda(fazenda);
    setShowTalhoesModal(true);
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

    if (selectedFazenda && selectedFazenda.id === fazendaId) {
      setSelectedFazenda(prev => prev ? {
        ...prev,
        talhoes: [...prev.talhoes, newTalhao]
      } : null);
    }

    setTalhaoForm({
      id: "",
      nome: "",
      area: "",
      status: "Ativo",
      cidade: "",
      estado: "",
      matricula: ""
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

    if (selectedFazenda && selectedFazenda.id === fazendaId) {
      setSelectedFazenda(prev => prev ? {
        ...prev,
        talhoes: prev.talhoes.filter(t => t.id !== talhaoId)
      } : null);
    }

    // Atualizar formData se estiver editando a mesma fazenda
    if (editingFazenda && editingFazenda.id === fazendaId) {
      setFormData(prev => ({
        ...prev,
        talhoes: prev.talhoes.filter(t => t.id !== talhaoId)
      }));
    }

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
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onEdit={handleEdit}
            onViewTalhoes={handleViewTalhoes}
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
        onDeleteTalhao={handleDeleteTalhao}
      />

      <TalhoesModal
        open={showTalhoesModal}
        onOpenChange={setShowTalhoesModal}
        fazenda={selectedFazenda}
        talhaoForm={talhaoForm}
        setTalhaoForm={setTalhaoForm}
        onAddTalhao={handleAddTalhao}
        onDeleteTalhao={handleDeleteTalhao}
      />
    </div>
  );
};

export default FazendasPage;
