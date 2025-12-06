import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Produto {
  id: string;
  nome: string;
  valorUn: string;
  status: string;
}

export const useProdutos = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [produtosPage, setProdutosPage] = useState(1);
  const [produtosPerPage, setProdutosPerPage] = useState(10);
  const [showProdutoForm, setShowProdutoForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [produtoFormData, setProdutoFormData] = useState<Produto>({
    id: "",
    nome: "",
    valorUn: "",
    status: "Ativo"
  });

  const fetchProdutos = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar produtos", description: error.message, variant: "destructive" });
    } else {
      setProdutos(data?.map(p => ({
        id: p.id,
        nome: p.nome,
        valorUn: p.valor_un || "",
        status: p.status || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProdutos();
  }, [user]);

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setProdutoFormData(produto);
    setShowProdutoForm(true);
  };

  const handleProdutoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingProduto) {
      const { error } = await supabase
        .from("produtos")
        .update({
          nome: produtoFormData.nome,
          valor_un: produtoFormData.valorUn,
          status: produtoFormData.status
        })
        .eq("id", editingProduto.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Produto atualizado", description: "O produto foi atualizado com sucesso." });
        fetchProdutos();
      }
    } else {
      const { error } = await supabase
        .from("produtos")
        .insert({
          user_id: user.id,
          nome: produtoFormData.nome,
          valor_un: produtoFormData.valorUn,
          status: produtoFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Produto criado", description: "O produto foi criado com sucesso." });
        fetchProdutos();
      }
    }

    resetProdutoForm();
  };

  const resetProdutoForm = () => {
    setProdutoFormData({
      id: "",
      nome: "",
      valorUn: "",
      status: "Ativo"
    });
    setEditingProduto(null);
    setShowProdutoForm(false);
  };

  const handleDeleteProduto = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produto excluído", description: "O produto foi excluído com sucesso." });
      fetchProdutos();
    }
  };

  const handleProdutoInputChange = (field: keyof Produto, value: string) => {
    setProdutoFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalProdutos = produtos.length;
  const totalProdutosPages = Math.ceil(totalProdutos / produtosPerPage);
  const produtosStartIndex = (produtosPage - 1) * produtosPerPage;
  const produtosEndIndex = produtosStartIndex + produtosPerPage;
  const currentProdutos = produtos.slice(produtosStartIndex, produtosEndIndex);

  return {
    produtos,
    loading,
    produtosPage,
    setProdutosPage,
    produtosPerPage,
    setProdutosPerPage,
    showProdutoForm,
    setShowProdutoForm,
    editingProduto,
    produtoFormData,
    handleEditProduto,
    handleProdutoSubmit,
    resetProdutoForm,
    handleProdutoInputChange,
    handleDeleteProduto,
    totalProdutos,
    totalProdutosPages,
    produtosStartIndex,
    produtosEndIndex,
    currentProdutos,
    fetchProdutos
  };
};
