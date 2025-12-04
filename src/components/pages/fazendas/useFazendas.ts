import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Fazenda, Talhao } from "../FazendasPage";

interface FazendaDB {
  id: string;
  user_id: string;
  cliente_id: string | null;
  nome: string;
  proprietario: string | null;
  area: number | null;
  cidade: string | null;
  estado: string | null;
  contato: string | null;
  status: string | null;
  matricula: string | null;
  lote: string | null;
  created_at: string;
  updated_at: string;
}

interface TalhaoDB {
  id: string;
  fazenda_id: string;
  nome: string;
  area: number | null;
  status: string | null;
  cidade: string | null;
  estado: string | null;
  matricula: string | null;
  lote: string | null;
  created_at: string;
  updated_at: string;
}

const mapTalhaoFromDB = (db: TalhaoDB): Talhao => ({
  id: db.id,
  nome: db.nome,
  area: db.area?.toString() || "",
  status: db.status || "Ativo",
  cidade: db.cidade || "",
  estado: db.estado || "",
  matricula: db.matricula || "",
  lote: db.lote || ""
});

const mapFazendaFromDB = (db: FazendaDB, talhoes: TalhaoDB[] = []): Fazenda => ({
  id: db.id,
  nome: db.nome,
  proprietario: db.proprietario || "",
  area: db.area?.toString() || "",
  cidade: db.cidade || "",
  estado: db.estado || "",
  contato: db.contato || "",
  status: db.status || "Ativo",
  matricula: db.matricula || "",
  lote: db.lote || "",
  talhoes: talhoes.filter(t => t.fazenda_id === db.id).map(mapTalhaoFromDB)
});

export const useFazendas = () => {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFazendaForm, setShowFazendaForm] = useState(false);
  const [editingFazenda, setEditingFazenda] = useState<Fazenda | null>(null);
  const [showTalhoesModal, setShowTalhoesModal] = useState(false);
  const [selectedFazenda, setSelectedFazenda] = useState<Fazenda | null>(null);
  const [formData, setFormData] = useState<Fazenda>({
    id: "",
    nome: "",
    proprietario: "",
    area: "",
    cidade: "",
    estado: "",
    contato: "",
    status: "Ativo",
    matricula: "",
    lote: "",
    talhoes: []
  });

  const [talhaoForm, setTalhaoForm] = useState<Talhao>({
    id: "",
    nome: "",
    area: "",
    status: "Ativo",
    cidade: "",
    estado: "",
    matricula: "",
    lote: ""
  });

  const fetchFazendas = async () => {
    try {
      const { data: fazendasData, error: fazendasError } = await supabase
        .from("fazendas")
        .select("*")
        .order("nome");

      if (fazendasError) throw fazendasError;

      const { data: talhoesData, error: talhoesError } = await supabase
        .from("talhoes")
        .select("*");

      if (talhoesError) throw talhoesError;

      const mappedFazendas = (fazendasData || []).map(f => 
        mapFazendaFromDB(f, talhoesData || [])
      );
      setFazendas(mappedFazendas);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar fazendas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFazendas();
  }, []);

  const addFazenda = async (fazenda: Omit<Fazenda, 'id' | 'talhoes'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("fazendas")
        .insert({
          user_id: user.id,
          nome: fazenda.nome,
          proprietario: fazenda.proprietario || null,
          area: fazenda.area ? parseFloat(fazenda.area) : null,
          cidade: fazenda.cidade || null,
          estado: fazenda.estado || null,
          contato: fazenda.contato || null,
          status: fazenda.status || "Ativo",
          matricula: fazenda.matricula || null,
          lote: fazenda.lote || null
        })
        .select()
        .single();

      if (error) throw error;
      setFazendas(prev => [...prev, mapFazendaFromDB(data, [])]);
      toast({
        title: "Fazenda cadastrada",
        description: "A fazenda foi cadastrada com sucesso."
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar fazenda",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateFazenda = async (fazenda: Fazenda) => {
    try {
      const { error } = await supabase
        .from("fazendas")
        .update({
          nome: fazenda.nome,
          proprietario: fazenda.proprietario || null,
          area: fazenda.area ? parseFloat(fazenda.area) : null,
          cidade: fazenda.cidade || null,
          estado: fazenda.estado || null,
          contato: fazenda.contato || null,
          status: fazenda.status || "Ativo",
          matricula: fazenda.matricula || null,
          lote: fazenda.lote || null
        })
        .eq("id", fazenda.id);

      if (error) throw error;
      setFazendas(prev => prev.map(f => f.id === fazenda.id ? fazenda : f));
      toast({
        title: "Fazenda atualizada",
        description: "A fazenda foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar fazenda",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addTalhao = async (fazendaId: string, talhao: Omit<Talhao, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from("talhoes")
        .insert({
          fazenda_id: fazendaId,
          nome: talhao.nome,
          area: talhao.area ? parseFloat(talhao.area) : null,
          status: talhao.status || "Ativo",
          cidade: talhao.cidade || null,
          estado: talhao.estado || null,
          matricula: talhao.matricula || null,
          lote: talhao.lote || null
        })
        .select()
        .single();

      if (error) throw error;
      
      const newTalhao = mapTalhaoFromDB(data);
      setFazendas(prev => prev.map(f => {
        if (f.id === fazendaId) {
          return { ...f, talhoes: [...f.talhoes, newTalhao] };
        }
        return f;
      }));
      
      if (selectedFazenda?.id === fazendaId) {
        setSelectedFazenda(prev => prev ? { ...prev, talhoes: [...prev.talhoes, newTalhao] } : null);
      }
      
      toast({
        title: "Talhão adicionado",
        description: "O talhão foi adicionado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar talhão",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTalhao = async (fazendaId: string, talhaoId: string) => {
    try {
      const { error } = await supabase
        .from("talhoes")
        .delete()
        .eq("id", talhaoId);

      if (error) throw error;
      
      setFazendas(prev => prev.map(f => {
        if (f.id === fazendaId) {
          return { ...f, talhoes: f.talhoes.filter(t => t.id !== talhaoId) };
        }
        return f;
      }));
      
      if (selectedFazenda?.id === fazendaId) {
        setSelectedFazenda(prev => prev ? { ...prev, talhoes: prev.talhoes.filter(t => t.id !== talhaoId) } : null);
      }
      
      toast({
        title: "Talhão removido",
        description: "O talhão foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover talhão",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    fazendas,
    setFazendas,
    loading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
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
    talhaoForm,
    setTalhaoForm,
    addFazenda,
    updateFazenda,
    addTalhao,
    deleteTalhao,
    refetch: fetchFazendas
  };
};
