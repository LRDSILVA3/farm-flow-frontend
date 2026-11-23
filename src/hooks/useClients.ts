import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useSafeQueryClient } from "@/hooks/useSafeQueryClient";
import { generateUUID } from "@/lib/utils";
import {
  enqueueOfflineOp,
  getSnapshot,
  getSyncQueue,
  isNetworkError,
  saveSnapshot,
} from "@/offline/offlineDb";

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
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const queryClient = useSafeQueryClient();

  const { data: clients = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const mergePendingOfflineClients = async (baseList: Client[]): Promise<Client[]> => {
        const queue = await getSyncQueue();
        const offlineClients: Client[] = queue
          .filter((item) => item.type === "CREATE_CLIENT")
          .map((item) => ({
            id: item.tempId,
            cpf: item.payload.cpf || "",
            name: item.payload.name || "Cliente Offline",
            birthDate: item.payload.birth_date || "",
            email: item.payload.email || "",
            phone: item.payload.phone || "",
            zipCode: item.payload.zip_code || "",
            city: item.payload.city || "",
            state: item.payload.state || "",
            cadPro: item.payload.cad_pro || "",
          }));
        const existingIds = new Set(baseList.map((c) => c.id));
        return [...offlineClients.filter((c) => !existingIds.has(c.id)), ...baseList];
      };

      try {
        const backendData = await api.get<any[]>("/clients");
        const safeList = Array.isArray(backendData) ? backendData : [];
        await saveSnapshot("clients", safeList);
        return mergePendingOfflineClients(safeList.map(mapFromDB));
      } catch (error: any) {
        if (isNetworkError(error)) {
          const cached = await getSnapshot<any>("clients");
          return mergePendingOfflineClients(cached.map(mapFromDB));
        }
        toast({
          title: "Erro ao carregar clientes",
          description: error.message || "Erro na conexão com o servidor local.",
          variant: "destructive",
        });
        throw error;
      }
    },
  }, queryClient);

  const fetchClients = async () => {
    await queryClient.invalidateQueries({ queryKey: ["clients"] });
    await refetch();
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    const payload = {
      cpf: client.cpf,
      name: client.name,
      birth_date: client.birthDate || null,
      email: client.email || null,
      phone: client.phone || null,
      zip_code: client.zipCode || null,
      city: client.city || null,
      state: client.state || null,
      cad_pro: client.cadPro || null,
    };

    const saveOffline = async () => {
      const tempId = `offline-client-${generateUUID()}`;
      await enqueueOfflineOp({
        type: "CREATE_CLIENT",
        tempId,
        label: client.name || client.cpf || "Novo Cliente",
        payload,
      });
      const localClient: Client = { id: tempId, ...client };
      queryClient.setQueryData<Client[]>(["clients"], (prev = []) => [localClient, ...prev]);
      toast({
        title: "Cliente salvo no Modo Offline",
        description: `${client.name} foi gravado localmente e já pode receber fazendas e pedidos.`,
      });
      return localClient;
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return saveOffline();
    }

    try {
      const created = await api.post<any>('/clients', payload);
      await fetchClients();
      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso."
      });
      return created;
    } catch (error: any) {
      if (isNetworkError(error)) {
        return saveOffline();
      }
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Erro ao salvar cliente no banco.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      await api.put<any>(`/clients/${updatedClient.id}`, {
        cpf: updatedClient.cpf,
        name: updatedClient.name,
        birth_date: updatedClient.birthDate || null,
        email: updatedClient.email || null,
        phone: updatedClient.phone || null,
        zip_code: updatedClient.zipCode || null,
        city: updatedClient.city || null,
        state: updatedClient.state || null,
        cad_pro: updatedClient.cadPro || null
      });
      await fetchClients();
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || "Erro ao atualizar cliente.",
        variant: "destructive"
      });
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      await api.delete(`/clients/${clientId}`);
      await fetchClients();
      toast({
        title: "Cliente removido",
        description: "O cliente foi excluído com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Erro ao excluir cliente.",
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
    deleteClient,
    startEditing,
    stopEditing,
    refetch: fetchClients
  };
};
