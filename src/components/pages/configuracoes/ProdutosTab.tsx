
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Produto } from "./useProdutos";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface ProdutosTabProps {
  currentProdutos: Produto[];
  produtosStartIndex: number;
  produtosEndIndex: number;
  totalProdutos: number;
  produtosPerPage: number;
  setProdutosPerPage: (value: number) => void;
  produtosPage: number;
  setProdutosPage: (value: number) => void;
  totalProdutosPages: number;
  setShowProdutoForm: (value: boolean) => void;
  handleEditProduto: (produto: Produto) => void;
  handleDeleteProduto: (id: string) => void;
}

export const ProdutosTab: React.FC<ProdutosTabProps> = ({
  currentProdutos,
  produtosStartIndex,
  produtosEndIndex,
  totalProdutos,
  produtosPerPage,
  setProdutosPerPage,
  produtosPage,
  setProdutosPage,
  totalProdutosPages,
  setShowProdutoForm,
  handleEditProduto,
  handleDeleteProduto
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setProdutoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (produtoToDelete) {
      handleDeleteProduto(produtoToDelete);
      setProdutoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos</CardTitle>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowProdutoForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor Unitário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>R$ {produto.valorUn}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {produto.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProduto(produto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(produto.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {produtosStartIndex + 1} a {Math.min(produtosEndIndex, totalProdutos)} de {totalProdutos} produtos
                </span>
                <Select value={produtosPerPage.toString()} onValueChange={(value) => {
                  setProdutosPerPage(Number(value));
                  setProdutosPage(1);
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">por página</span>
              </div>
              
              {totalProdutosPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setProdutosPage(Math.max(1, produtosPage - 1))}
                        className={produtosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalProdutosPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setProdutosPage(page)}
                          isActive={produtosPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setProdutosPage(Math.min(totalProdutosPages, produtosPage + 1))}
                        className={produtosPage === totalProdutosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
