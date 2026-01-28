import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Product {
  id: string;
  name: string;
  unitValue: string;
  status: string;
}

export const useProducts = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Product>({
    id: "",
    name: "",
    unitValue: "",
    status: "Ativo"
  });

  const fetchProducts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar produtos", description: error.message, variant: "destructive" });
    } else {
      setProducts(data?.map(p => ({
        id: p.id,
        name: p.name,
        unitValue: p.unit_value || "",
        status: p.status || "Ativo"
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData(product);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update({
          name: productFormData.name,
          unit_value: productFormData.unitValue,
          status: productFormData.status
        })
        .eq("id", editingProduct.id);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Produto atualizado", description: "O produto foi atualizado com sucesso." });
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name: productFormData.name,
          unit_value: productFormData.unitValue,
          status: productFormData.status
        });

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Produto criado", description: "O produto foi criado com sucesso." });
        fetchProducts();
      }
    }

    resetProductForm();
  };

  const resetProductForm = () => {
    setProductFormData({
      id: "",
      name: "",
      unitValue: "",
      status: "Ativo"
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produto excluído", description: "O produto foi excluído com sucesso." });
      fetchProducts();
    }
  };

  const handleProductInputChange = (field: keyof Product, value: string) => {
    setProductFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalProducts = products.length;
  const totalProductsPages = Math.ceil(totalProducts / productsPerPage);
  const productsStartIndex = (productsPage - 1) * productsPerPage;
  const productsEndIndex = productsStartIndex + productsPerPage;
  const currentProducts = products.slice(productsStartIndex, productsEndIndex);

  return {
    products,
    loading,
    productsPage,
    setProductsPage,
    productsPerPage,
    setProductsPerPage,
    showProductForm,
    setShowProductForm,
    editingProduct,
    productFormData,
    handleEditProduct,
    handleProductSubmit,
    resetProductForm,
    handleProductInputChange,
    handleDeleteProduct,
    totalProducts,
    totalProductsPages,
    productsStartIndex,
    productsEndIndex,
    currentProducts,
    fetchProducts
  };
};
