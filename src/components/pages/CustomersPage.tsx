import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useClients, Client } from "@/hooks/useClients";
import { CustomersForm } from "./customers/CustomersForm";
import { CustomersFilters } from "./customers/CustomersFilters";
import { CustomersTable } from "./customers/CustomersTable";

interface CustomersPageProps {
  onNavigateToFazendas: (clienteCpf: string) => void;
}

const CustomersPage = ({ onNavigateToFazendas }: CustomersPageProps) => {
  const {
    clients,
    editingClient,
    addClient,
    updateClient,
    startEditing,
    stopEditing
  } = useClients();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cidadeEstadoFilter, setCidadeEstadoFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    return () => {
      setShowForm(false);
      stopEditing();
    };
  }, []);

  const handleEdit = (client: Client) => {
    startEditing(client);
    setShowForm(true);
  };

  const handleSave = (clientData: Omit<Client, 'id'>) => {
    addClient(clientData);
    setShowForm(false);
  };

  const handleUpdate = (clientData: Client) => {
    updateClient(clientData);
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

  const cidadesEstados = Array.from(new Set(clients.map(c => `${c.state}/${c.city}`))).sort();

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCidadeEstado = !cidadeEstadoFilter || cidadeEstadoFilter === "all" || `${client.state}/${client.city}` === cidadeEstadoFilter;
    
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
        <CustomersForm
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
            <CustomersFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              cidadeEstadoFilter={cidadeEstadoFilter}
              onCidadeEstadoFilterChange={setCidadeEstadoFilter}
              cidadesEstados={cidadesEstados}
            />
          </div>
        </CardHeader>
        <CardContent>
          <CustomersTable
            clientes={filteredClients}
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

export default CustomersPage;
