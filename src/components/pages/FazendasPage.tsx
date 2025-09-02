
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { FazendasTable } from "./fazendas/FazendasTable";
import { FazendaForm } from "./fazendas/FazendaForm";
import { TalhoesModal } from "./fazendas/TalhoesModal";
import { AddTalhaoModal } from "./fazendas/AddTalhaoModal";
import { FazendasPageHeader } from "./fazendas/FazendasPageHeader";
import { useFazendas } from "./fazendas/useFazendas";
import { useFazendaHandlers } from "./fazendas/useFazendaHandlers";

export interface Talhao {
  id: string;
  nome: string;
  area: string;
  status: string;
  cidade: string;
  estado: string;
  matricula: string;
  lote: string;
}

export interface Fazenda {
  id: string;
  nome: string;
  proprietario: string;
  area: string;
  cidade: string;
  estado: string;
  contato: string;
  status: string;
  matricula: string;
  lote: string;
  talhoes: Talhao[];
}

const FazendasPage = () => {
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

  // Cleanup para prevenir erros de DOM ao navegar
  useEffect(() => {
    return () => {
      // Limpa qualquer estado pendente ao desmontar
      setShowFazendaForm(false);
      setShowTalhoesModal(false);
      setEditingFazenda(null);
      setSelectedFazenda(null);
    };
  }, []);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");

  // Estado para controlar o modal de adicionar talhão
  const [showAddTalhaoModal, setShowAddTalhaoModal] = useState(false);

  const {
    handleEdit,
    handleViewTalhoes,
    handleSubmit,
    resetForm,
    handleInputChange,
    handleAddTalhao,
    handleDeleteTalhao
  } = useFazendaHandlers(
    fazendas,
    setFazendas,
    setEditingFazenda,
    setFormData,
    setShowFazendaForm,
    setSelectedFazenda,
    setShowTalhoesModal,
    editingFazenda,
    formData,
    setTalhaoForm
  );

  const handleAddTalhaoWrapper = (fazendaId: string) => {
    handleAddTalhao(fazendaId, talhaoForm);
  };

  const handleAddTalhaoFromForm = (fazendaId: string) => {
    const fazenda = fazendas.find(f => f.id === fazendaId);
    if (fazenda) {
      setSelectedFazenda(fazenda);
      setShowAddTalhaoModal(true);
    }
  };

  // Obter lista única de localizações para o filtro (cidade/estado combinados)
  const localizacoes = Array.from(new Set(fazendas.map(f => `${f.cidade} - ${f.estado}`))).sort();

  // Filtrar fazendas baseado nos critérios de busca
  const filteredFazendas = fazendas.filter(fazenda => {
    const matchesSearch = fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.proprietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fazenda.estado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const fazendaLocation = `${fazenda.cidade} - ${fazenda.estado}`;
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all" || fazendaLocation === cidadeEstadoFilter;
    
    return matchesSearch && matchesCidadeEstado;
  });

  return (
    <div className="space-y-6">
      <FazendasPageHeader onNewFazenda={() => setShowFazendaForm(true)} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Fazendas</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar fazenda..."
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
                  <SelectItem value="all">Todas as localizações</SelectItem>
                  {localizacoes.map((localizacao) => (
                    <SelectItem key={localizacao} value={localizacao}>
                      {localizacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FazendasTable
            fazendas={filteredFazendas}
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
        onAddTalhao={handleAddTalhaoFromForm}
      />

      <TalhoesModal
        open={showTalhoesModal}
        onOpenChange={setShowTalhoesModal}
        fazenda={selectedFazenda}
        talhaoForm={talhaoForm}
        setTalhaoForm={setTalhaoForm}
        onAddTalhao={handleAddTalhaoWrapper}
        onDeleteTalhao={handleDeleteTalhao}
      />

      <AddTalhaoModal
        open={showAddTalhaoModal}
        onOpenChange={setShowAddTalhaoModal}
        fazenda={selectedFazenda}
        talhaoForm={talhaoForm}
        setTalhaoForm={setTalhaoForm}
        onAddTalhao={handleAddTalhaoWrapper}
      />
    </div>
  );
};

export default FazendasPage;
