
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Produto {
  id: string;
  nome: string;
  valorUn: string;
  status: string;
}

export const useProdutos = () => {
  const { toast } = useToast();
  
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: "1", nome: "Defensivo A", valorUn: "45.00", status: "Ativo" },
    { id: "2", nome: "Sementes Milho", valorUn: "120.00", status: "Ativo" }
  ]);

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

  const handleEditProduto = (produto: Produto) => {
    console.log("Editando produto:", produto);
    setEditingProduto(produto);
    setProdutoFormData(produto);
    setShowProdutoForm(true);
  };

  const handleProdutoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduto) {
      setProdutos(prev => prev.map(p => p.id === editingProduto.id ? produtoFormData : p));
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
    } else {
      const newProduto = { ...produtoFormData, id: Date.now().toString() };
      setProdutos(prev => [...prev, newProduto]);
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
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

  const handleProdutoInputChange = (field: keyof Produto, value: string) => {
    setProdutoFormData(prev => ({ ...prev, [field]: value }));
  };

  // Pagination logic
  const totalProdutos = produtos.length;
  const totalProdutosPages = Math.ceil(totalProdutos / produtosPerPage);
  const produtosStartIndex = (produtosPage - 1) * produtosPerPage;
  const produtosEndIndex = produtosStartIndex + produtosPerPage;
  const currentProdutos = produtos.slice(produtosStartIndex, produtosEndIndex);

  return {
    produtos,
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
    totalProdutos,
    totalProdutosPages,
    produtosStartIndex,
    produtosEndIndex,
    currentProdutos
  };
};
