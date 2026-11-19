import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface Product {
  id: string;
  name: string;
  code?: string;
  category: string;
  unit: string;
  costPrice: number;
  valuePerUnit: number;
  unitValue?: number; // alias for backwards compatibility
  quantity: number;
  minStock: number;
  supplier?: string;
  status: string;
  description?: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    unit?: string;
    code?: string;
  };
  order_id?: string;
  type: 'ENTRADA' | 'SAIDA_ORDEM' | 'SAIDA_AVULSA' | 'AJUSTE';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_price?: number;
  document_number?: string;
  notes?: string;
  created_at: string;
}

export interface StockSummary {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalStockValue: number;
}

export const useProducts = () => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock tracking states
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockCount: 0,
    totalStockValue: 0,
  });
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const [productFormData, setProductFormData] = useState<Product>({
    id: "",
    name: "",
    code: "",
    category: "Corretivo",
    unit: "Ton",
    costPrice: 0,
    valuePerUnit: 0,
    unitValue: 0,
    quantity: 0,
    minStock: 0,
    supplier: "",
    status: "Ativo",
    description: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/products');
      if (Array.isArray(data)) {
        setProducts(data.map(p => {
          const price = Number(p.price || p.value_per_unit || p.valuePerUnit || 0);
          return {
            id: p.id,
            name: p.name,
            code: p.code || "",
            category: p.category || "Outro",
            unit: p.unit || "un",
            costPrice: Number(p.cost_price || p.costPrice || 0),
            valuePerUnit: price,
            unitValue: price,
            quantity: Number(p.quantity || 0),
            minStock: Number(p.min_stock || p.minStock || 0),
            supplier: p.supplier || "",
            status: p.status || "Ativo",
            description: p.description || "",
          };
        }));
      }
    } catch (err: any) {
      toast({ title: "Erro ao carregar produtos", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockSummary = async () => {
    try {
      const summary = await api.get<StockSummary>('/products/summary');
      if (summary) {
        setStockSummary(summary);
      }
    } catch (err) {
      console.error("Failed to fetch stock summary", err);
    }
  };

  const fetchMovements = async (productId?: string) => {
    setLoadingMovements(true);
    try {
      const url = productId ? `/products/movements?productId=${productId}` : '/products/movements';
      const list = await api.get<StockMovement[]>(url);
      setMovements(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast({ title: "Erro ao carregar histórico", description: err.message, variant: "destructive" });
    } finally {
      setLoadingMovements(false);
    }
  };

  const registerMovement = async (
    productId: string,
    movementData: {
      type: 'ENTRADA' | 'SAIDA_ORDEM' | 'SAIDA_AVULSA' | 'AJUSTE';
      quantity: number;
      unit_price?: number;
      document_number?: string;
      notes?: string;
    }
  ) => {
    try {
      await api.post(`/products/${productId}/movements`, movementData);
      toast({
        title: "Movimentação registrada",
        description: `Estoque atualizado com sucesso (${movementData.type}).`,
      });
      fetchProducts();
      fetchStockSummary();
      return true;
    } catch (err: any) {
      toast({
        title: "Erro na movimentação",
        description: err.message || "Não foi possível registrar a movimentação",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStockSummary();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData(product);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const price = Number(productFormData.valuePerUnit || productFormData.unitValue || 0);
      const payload = {
        name: productFormData.name,
        code: productFormData.code,
        category: productFormData.category,
        unit: productFormData.unit,
        cost_price: Number(productFormData.costPrice || 0),
        price: price,
        value_per_unit: price,
        quantity: Number(productFormData.quantity || 0),
        min_stock: Number(productFormData.minStock || 0),
        supplier: productFormData.supplier,
        status: productFormData.status,
        description: productFormData.description,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast({ title: "Produto atualizado", description: "O produto foi atualizado com sucesso." });
      } else {
        await api.post('/products', payload);
        toast({ title: "Produto criado", description: "O produto foi criado com sucesso." });
      }
      fetchProducts();
      fetchStockSummary();
      resetProductForm();
    } catch (err: any) {
      toast({ title: "Erro ao salvar produto", description: err.message, variant: "destructive" });
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      id: "",
      name: "",
      code: "",
      category: "Corretivo",
      unit: "Ton",
      costPrice: 0,
      valuePerUnit: 0,
      unitValue: 0,
      quantity: 0,
      minStock: 0,
      supplier: "",
      status: "Ativo",
      description: "",
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      toast({ title: "Produto excluído", description: "O produto foi excluído com sucesso." });
      fetchProducts();
      fetchStockSummary();
    } catch (err: any) {
      toast({ title: "Erro ao excluir produto", description: err.message, variant: "destructive" });
    }
  };

  const handleProductInputChange = (field: keyof Product, value: any) => {
    setProductFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'valuePerUnit' ? { unitValue: value } : {}),
      ...(field === 'unitValue' ? { valuePerUnit: value } : {}),
    }));
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
    fetchProducts,
    stockSummary,
    fetchStockSummary,
    movements,
    loadingMovements,
    fetchMovements,
    registerMovement,
  };
};
