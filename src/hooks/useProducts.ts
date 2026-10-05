import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface Product {
  id: string;
  name: string;
  supplier: string;
  valuePerUnit: number;
  unit: string;
  status: string;
}

export const useProducts = () => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Product>({
    id: "",
    name: "",
    supplier: "",
    valuePerUnit: 0,
    unit: "",
    status: "Ativo"
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/products');
      if (Array.isArray(data)) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          supplier: p.supplier || "",
          valuePerUnit: Number(p.value_per_unit || p.valuePerUnit || 0),
          unit: p.unit || "",
          status: p.status || "Ativo"
        })));
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar produtos", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData(product);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productFormData.name,
        supplier: productFormData.supplier,
        value_per_unit: productFormData.valuePerUnit,
        unit: productFormData.unit,
        status: productFormData.status
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast({ title: "Produto atualizado", description: "O produto foi atualizado com sucesso." });
      } else {
        await api.post('/products', payload);
        toast({ title: "Produto criado", description: "O produto foi criado com sucesso." });
      }
      fetchProducts();
      resetProductForm();
    } catch (err: any) {
      toast({ title: "Erro ao salvar produto", description: err.message, variant: "destructive" });
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      id: "",
      name: "",
      supplier: "",
      valuePerUnit: 0,
      unit: "",
      status: "Ativo"
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast({ title: "Produto excluído", description: "O produto foi excluído com sucesso." });
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Erro ao excluir produto", description: err.message, variant: "destructive" });
    }
  };

  const handleProductInputChange = (field: keyof Product, value: string | number) => {
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
