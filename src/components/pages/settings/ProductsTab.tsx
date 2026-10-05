import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, X, RotateCcw, Filter } from "lucide-react";
import { Product } from "../../../hooks/useProducts";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface ProductsTabProps {
  products: Product[];
  productsStartIndex: number;
  productsEndIndex: number;
  totalProducts: number;
  productsPerPage: number;
  setProductsPerPage: (value: number) => void;
  productsPage: number;
  setProductsPage: (value: number) => void;
  totalProductsPages: number;
  setShowProductForm: (value: boolean) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (id: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  productsPerPage,
  setProductsPerPage,
  productsPage,
  setProductsPage,
  setShowProductForm,
  handleEditProduct,
  handleDeleteProduct
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        product.name.toLowerCase().includes(term) ||
        (product.supplier && product.supplier.toLowerCase().includes(term)) ||
        (product.unit && product.unit.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / (productsPerPage || 10)));
  const currentPage = Math.min(productsPage, totalPages);
  const startIndex = (currentPage - 1) * (productsPerPage || 10);
  const endIndex = Math.min(startIndex + (productsPerPage || 10), totalFiltered);
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setProductsPage(1);
  };

  const openDeleteDialog = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      handleDeleteProduct(productToDelete);
      setProductToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Produtos</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Insumos, fertilizantes e produtos utilizados nas operações
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowProductForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto ou fornecedor..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setProductsPage(1);
                    }}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setProductsPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select 
                  value={statusFilter} 
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setProductsPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpar
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground self-center">
                {totalFiltered} {totalFiltered === 1 ? 'produto' : 'produtos'}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum produto encontrado</p>
                          <p className="text-xs text-muted-foreground">
                            {hasActiveFilters 
                              ? "Tente ajustar os filtros ou termo de busca." 
                              : "Nenhum produto cadastrado no sistema."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium text-foreground">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {product.supplier || "-"}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-700">
                          R$ {((product as any).unitValue ?? product.valuePerUnit ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          {product.unit ? ` / ${product.unit}` : ''}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === "Ativo" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {product.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDeleteDialog(product.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {totalFiltered > 0 ? startIndex + 1 : 0} a {endIndex} de {totalFiltered} produtos
                </span>
                <Select 
                  value={(productsPerPage || 10).toString()} 
                  onValueChange={(value) => {
                    setProductsPerPage(Number(value));
                    setProductsPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">por página</span>
              </div>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setProductsPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setProductsPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setProductsPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
      />
    </>
  );
};
