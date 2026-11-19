import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  RotateCcw,
  Filter,
  Package,
  PackagePlus,
  History,
  AlertTriangle,
  Boxes,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Product, StockMovement, StockSummary } from "../../../hooks/useProducts";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { StockMovementDialog } from "./StockMovementDialog";
import { StockHistoryDialog } from "./StockHistoryDialog";

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
  stockSummary?: StockSummary;
  movements?: StockMovement[];
  loadingMovements?: boolean;
  fetchMovements?: (productId?: string) => void;
  registerMovement?: (productId: string, data: any) => Promise<boolean>;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  productsPerPage,
  setProductsPerPage,
  productsPage,
  setProductsPage,
  setShowProductForm,
  handleEditProduct,
  handleDeleteProduct,
  stockSummary,
  movements = [],
  loadingMovements = false,
  fetchMovements,
  registerMovement,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Stock dialogs state
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockControlFilter, setStockControlFilter] = useState<"all" | "controlled" | "service_only">("all");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.code && product.code.toLowerCase().includes(term)) ||
        (product.supplier && product.supplier.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term));

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      const matchesStockControl =
        stockControlFilter === "all" ||
        (stockControlFilter === "controlled" && product.controlsStock) ||
        (stockControlFilter === "service_only" && !product.controlsStock);

      const isLow = product.controlsStock && Number(product.minStock) > 0 && Number(product.quantity) <= Number(product.minStock);
      const matchesLowStock = !onlyLowStock || isLow;

      return matchesSearch && matchesCategory && matchesStatus && matchesStockControl && matchesLowStock;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, stockControlFilter, onlyLowStock]);

  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / (productsPerPage || 10)));
  const currentPage = Math.min(productsPage, totalPages);
  const startIndex = (currentPage - 1) * (productsPerPage || 10);
  const endIndex = Math.min(startIndex + (productsPerPage || 10), totalFiltered);
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const hasActiveFilters =
    searchTerm !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockControlFilter !== "all" ||
    onlyLowStock;

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockControlFilter("all");
    setOnlyLowStock(false);
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

  const handleOpenMovement = (product: Product) => {
    setSelectedProduct(product);
    setMovementDialogOpen(true);
  };

  const handleOpenHistory = (product?: Product) => {
    setSelectedProduct(product || null);
    setHistoryDialogOpen(true);
  };

  // Categories list derived from current products
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "Corretivo":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
      case "Fertilizante":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
      case "Biológico":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300";
      case "Adjuvante":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
      case "Defensivo":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* KPI Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 bg-card border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Itens Cadastrados
                </span>
                <span className="text-xl font-bold text-foreground">
                  {stockSummary?.totalProducts ?? products.length}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-card border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Estoque Próprio
                </span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  {products.filter((p) => p.controlsStock).length} <span className="text-xs font-normal text-muted-foreground">itens</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-card border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                  Valor em Estoque
                </span>
                <span className="text-lg font-bold text-foreground">
                  R$ {(stockSummary?.totalStockValue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card
            className={`p-3 border shadow-sm cursor-pointer transition-colors ${
              (stockSummary?.lowStockCount ?? 0) > 0
                ? "bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-800"
                : "bg-card"
            }`}
            onClick={() => setOnlyLowStock((prev) => !prev)}
            title="Clique para filtrar produtos com estoque baixo"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-amber-900 dark:text-amber-400 uppercase tracking-wider block">
                  Estoque Baixo
                </span>
                <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
                  {stockSummary?.lowStockCount ?? 0}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                Catálogo de Produtos & Controle de Estoque
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Insumos, corretivos e fertilizantes para aplicação e vendas
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-9"
                onClick={() => handleOpenHistory()}
              >
                <History className="h-4 w-4" />
                Histórico Geral
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5 h-9"
                onClick={() => setShowProductForm(true)}
              >
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Filter toolbar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, código ou fornecedor..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setProductsPage(1);
                      }}
                      className="pl-8 pr-8 h-9 text-xs"
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

                  {/* Categoria */}
                  <Select
                    value={categoryFilter}
                    onValueChange={(val) => {
                      setCategoryFilter(val);
                      setProductsPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      {uniqueCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tipo de Insumo / Estoque */}
                  <Select
                    value={stockControlFilter}
                    onValueChange={(val: any) => {
                      setStockControlFilter(val);
                      setProductsPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs">
                      <SelectValue placeholder="Tipo de Insumo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Insumos</SelectItem>
                      <SelectItem value="controlled">Estoque Próprio</SelectItem>
                      <SelectItem value="service_only">Insumos de Serviço</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status */}
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => {
                      setStatusFilter(val);
                      setProductsPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs">
                      <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Botão rápido Estoque Baixo */}
                  <Button
                    type="button"
                    variant={onlyLowStock ? "default" : "outline"}
                    size="sm"
                    className={`h-9 text-xs gap-1 ${
                      onlyLowStock ? "bg-amber-600 hover:bg-amber-700" : ""
                    }`}
                    onClick={() => {
                      setOnlyLowStock((prev) => !prev);
                      setProductsPage(1);
                    }}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Estoque Baixo
                  </Button>

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
                  {totalFiltered} {totalFiltered === 1 ? "produto" : "produtos"}
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Saldo em Estoque</TableHead>
                      <TableHead className="text-right">Estoque Mínimo</TableHead>
                      <TableHead className="text-right">Preço Venda / Aplicação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-36 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
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
                      displayedProducts.map((product) => {
                        const qty = Number(product.quantity) || 0;
                        const min = Number(product.minStock) || 0;
                        const isLowStock = min > 0 && qty <= min;

                        return (
                          <TableRow key={product.id} className="text-xs">
                            <TableCell className="font-mono text-[11px] text-muted-foreground font-semibold">
                              {product.code || "-"}
                            </TableCell>

                            <TableCell>
                              <div>
                                <span className="font-semibold text-foreground text-sm block">
                                  {product.name}
                                </span>
                                {product.supplier && (
                                  <span className="text-[11px] text-muted-foreground">
                                    Fornecedor: {product.supplier}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getCategoryBadgeClass(
                                  product.category
                                )}`}
                              >
                                {product.category || "Outro"}
                              </span>
                            </TableCell>

                            {/* Saldo Estoque */}
                            <TableCell className="text-right">
                              {product.controlsStock ? (
                                <div className="flex flex-col items-end">
                                  <span
                                    className={`font-bold text-sm ${
                                      isLowStock ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                    }`}
                                  >
                                    {qty.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {product.unit}
                                  </span>
                                  {isLowStock && (
                                    <span className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                                      <AlertTriangle className="h-3 w-3" />
                                      Estoque Baixo
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground border-dashed bg-slate-50 dark:bg-slate-900 text-[11px] font-normal">
                                  Insumo de Serviço (Cliente)
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-right text-muted-foreground">
                              {product.controlsStock && min > 0 ? `${min.toLocaleString("pt-BR")} ${product.unit}` : "-"}
                            </TableCell>

                            <TableCell className="text-right font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                              R$ {(product.valuePerUnit ?? product.unitValue ?? 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                              {product.unit ? ` / ${product.unit}` : ""}
                            </TableCell>

                            <TableCell>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                  product.status === "Ativo"
                                    ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {product.status}
                              </span>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {product.controlsStock ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenMovement(product)}
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                                    title="Movimentar Estoque (Entrada/Saída/Ajuste)"
                                  >
                                    <PackagePlus className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="h-8 w-8 p-0 opacity-40 cursor-not-allowed text-muted-foreground"
                                    title="Insumo de serviço (sem controle de estoque físico)"
                                  >
                                    <PackagePlus className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenHistory(product)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                  title="Ver Histórico de Movimentações"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  className="h-8 w-8 p-0"
                                  title="Editar Produto"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(product.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  title="Excluir Produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
      </div>

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        open={movementDialogOpen}
        onOpenChange={setMovementDialogOpen}
        product={selectedProduct}
        onSaveMovement={registerMovement || (async () => false)}
      />

      {/* Stock History Dialog */}
      <StockHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        product={selectedProduct}
        movements={movements}
        loading={loadingMovements}
        onLoadMovements={fetchMovements || (() => {})}
      />

      {/* Delete Confirm Dialog */}
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
