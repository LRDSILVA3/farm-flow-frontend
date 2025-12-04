import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  cadPro?: string;
}

interface ClienteDB {
  id: string;
  user_id: string;
  cpf: string;
  nome: string;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
  cad_pro: string | null;
  created_at: string;
  updated_at: string;
}

const mapFromDB = (db: ClienteDB): Cliente => ({
  id: db.id,
  cpf: db.cpf,
  nome: db.nome,
  dataNascimento: db.data_nascimento || "",
  email: db.email || "",
  telefone: db.telefone || "",
  cep: db.cep || "",
  cidade: db.cidade || "",
  estado: db.estado || "",
  cadPro: db.cad_pro || ""
});

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome");

      if (error) throw error;
      setClientes((data || []).map(mapFromDB));
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const addCliente = async (cliente: Omit<Cliente, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("clientes")
        .insert({
          user_id: user.id,
          cpf: cliente.cpf,
          nome: cliente.nome,
          data_nascimento: cliente.dataNascimento || null,
          email: cliente.email || null,
          telefone: cliente.telefone || null,
          cep: cliente.cep || null,
          cidade: cliente.cidade || null,
          estado: cliente.estado || null,
          cad_pro: cliente.cadPro || null
        })
        .select()
        .single();

      if (error) throw error;
      setClientes(prev => [...prev, mapFromDB(data)]);
      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateCliente = async (updatedClient: Cliente) => {
    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          cpf: updatedClient.cpf,
          nome: updatedClient.nome,
          data_nascimento: updatedClient.dataNascimento || null,
          email: updatedClient.email || null,
          telefone: updatedClient.telefone || null,
          cep: updatedClient.cep || null,
          cidade: updatedClient.cidade || null,
          estado: updatedClient.estado || null,
          cad_pro: updatedClient.cadPro || null
        })
        .eq("id", updatedClient.id);

      if (error) throw error;
      setClientes(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive"
      });
    }
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
    loading,
    addCliente,
    updateCliente,
    startEditing,
    stopEditing,
    refetch: fetchClientes
  };
};
