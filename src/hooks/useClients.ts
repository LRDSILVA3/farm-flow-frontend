import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  cpf: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  zipCode: string;
  city: string;
  state: string;
  cadPro?: string;
}

interface ClientDB {
  id: string;
  user_id: string;
  cpf: string;
  name: string;
  birth_date: string | null;
  email: string | null;
  phone: string | null;
  zip_code: string | null;
  city: string | null;
  state: string | null;
  cad_pro: string | null;
  created_at: string;
  updated_at: string;
}

const mapFromDB = (db: ClientDB): Client => ({
  id: db.id,
  cpf: db.cpf,
  name: db.name,
  birthDate: db.birth_date || "",
  email: db.email || "",
  phone: db.phone || "",
  zipCode: db.zip_code || "",
  city: db.city || "",
  state: db.state || "",
  cadPro: db.cad_pro || ""
});

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (error) throw error;
      setClients((data || []).map(mapFromDB));
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
    fetchClients();
  }, []);

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          cpf: client.cpf,
          name: client.name,
          birth_date: client.birthDate || null,
          email: client.email || null,
          phone: client.phone || null,
          zip_code: client.zipCode || null,
          city: client.city || null,
          state: client.state || null,
          cad_pro: client.cadPro || null
        })
        .select()
        .single();

      if (error) throw error;
      setClients(prev => [...prev, mapFromDB(data)]);
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

  const updateClient = async (updatedClient: Client) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          cpf: updatedClient.cpf,
          name: updatedClient.name,
          birth_date: updatedClient.birthDate || null,
          email: updatedClient.email || null,
          phone: updatedClient.phone || null,
          zip_code: updatedClient.zipCode || null,
          city: updatedClient.city || null,
          state: updatedClient.state || null,
          cad_pro: updatedClient.cadPro || null
        })
        .eq("id", updatedClient.id);

      if (error) throw error;
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
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

  const startEditing = (client: Client) => {
    setEditingClient(client);
  };

  const stopEditing = () => {
    setEditingClient(null);
  };

  return {
    clients,
    editingClient,
    loading,
    addClient,
    updateClient,
    startEditing,
    stopEditing,
    refetch: fetchClients
  };
};
