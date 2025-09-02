
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useClientes } from "./clientes/useClientes";
import { ClienteForm } from "./clientes/ClienteForm";
import { ClientesFilters } from "./clientes/ClientesFilters";
import { ClientesTable } from "./clientes/ClientesTable";

interface ClientesPageProps {
  onNavigateToFazendas: (clienteCpf: string) => void;
}

const ClientesPage = ({ onNavigateToFazendas }: ClientesPageProps) => {
  console.log("ClientesPage montado");
  
  const {
    clientes,
    editingClient,
    addCliente,
    updateCliente,
    startEditing,
    stopEditing
  } = useClientes();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Cleanup para prevenir erros de DOM ao navegar
  useEffect(() => {
    console.log("ClientesPage useEffect montado");
    return () => {
      console.log("ClientesPage cleanup executado");
      setShowForm(false);
      stopEditing();
    };
  }, []);

  const handleEdit = (cliente: any) => {
    startEditing(cliente);
    setShowForm(true);
  };

  const handleSave = (clienteData: any) => {
    addCliente(clienteData);
    setShowForm(false);
  };

  const handleUpdate = (clienteData: any) => {
    updateCliente(clienteData);
    setShowForm(false);
    stopEditing();
  };

  const handleCancel = () => {
    setShowForm(false);
    stopEditing();
  };

  const handleNavigateToFazendas = (cpf: string) => {
    console.log("Navegando para fazendas do cliente:", cpf);
    onNavigateToFazendas(cpf);
  };

  // Obter lista única de cidades/estados para o filtro
  const cidadesEstados = Array.from(new Set(clientes.map(c => `${c.estado}/${c.cidade}`))).sort();

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpf.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all" || `${cliente.estado}/${cliente.cidade}` === cidadeEstadoFilter;
    
    return matchesSearch && matchesCidadeEstado;
  });

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
        <ClienteForm
          editingClient={editingClient}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Clientes</CardTitle>
            <ClientesFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              cidadeEstadoFilter={cidadeEstadoFilter}
              onCidadeEstadoFilterChange={setCidadeEstadoFilter}
              cidadesEstados={cidadesEstados}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ClientesTable
            clientes={filteredClientes}
            onEdit={handleEdit}
            onNavigateToFazendas={handleNavigateToFazendas}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesPage;
