
import { useState } from "react";

export interface Cliente {
  id: string;
  cpf: string;
  nome: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  cep: string;
  cidade: string;
  estado: string;
  cadPro?: string; // Campo opcional CAD/PRO
}

export const useClientes = () => {
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

  const [editingClient, setEditingClient] = useState<Cliente | null>(null);

  const addCliente = (cliente: Omit<Cliente, 'id'>) => {
    const newClient: Cliente = {
      ...cliente,
      id: Date.now().toString()
    };
    setClientes([...clientes, newClient]);
  };

  const updateCliente = (updatedClient: Cliente) => {
    setClientes(clientes.map(c => 
      c.id === updatedClient.id ? updatedClient : c
    ));
  };

  const startEditing = (cliente: Cliente) => {
    setEditingClient(cliente);
  };

  const stopEditing = () => {
    setEditingClient(null);
  };

  return {
    clientes,
    editingClient,
    addCliente,
    updateCliente,
    startEditing,
    stopEditing
  };
};
