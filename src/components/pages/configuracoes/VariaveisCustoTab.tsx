import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { VariavelCusto } from "./useVariaveisCusto";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface VariaveisCustoTabProps {
  currentVariaveis: VariavelCusto[];
  variaveisStartIndex: number;
  variaveisEndIndex: number;
  totalVariaveis: number;
  variaveisPerPage: number;
  setVariaveisPerPage: (value: number) => void;
  variaveisPage: number;
  setVariaveisPage: (value: number) => void;
  totalVariaveisPages: number;
  setShowVariavelForm: (value: boolean) => void;
  handleEditVariavel: (variavel: VariavelCusto) => void;
  handleDeleteVariavel: (id: string) => void;
}

export const VariaveisCustoTab: React.FC<VariaveisCustoTabProps> = ({
  currentVariaveis,
  variaveisStartIndex,
  variaveisEndIndex,
  totalVariaveis,
  variaveisPerPage,
  setVariaveisPerPage,
  variaveisPage,
  setVariaveisPage,
  totalVariaveisPages,
  setShowVariavelForm,
  handleEditVariavel,
  handleDeleteVariavel
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variavelToDelete, setVariavelToDelete] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setVariavelToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (variavelToDelete) {
      handleDeleteVariavel(variavelToDelete);
      setVariavelToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variáveis de Custo</CardTitle>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowVariavelForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Variável
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVariaveis.map((variavel) => (
                  <TableRow key={variavel.id}>
                    <TableCell className="font-medium">{variavel.nome}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-muted text-xs">
                        {variavel.codigo}
                      </code>
                    </TableCell>
                    <TableCell>{formatCurrency(variavel.valor)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{variavel.descricao}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditVariavel(variavel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(variavel.id)}
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
                <span className="text-sm text-muted-foreground">
                  Mostrando {variaveisStartIndex + 1} a {Math.min(variaveisEndIndex, totalVariaveis)} de {totalVariaveis} variáveis
                </span>
                <Select value={variaveisPerPage.toString()} onValueChange={(value) => {
                  setVariaveisPerPage(Number(value));
                  setVariaveisPage(1);
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
                <span className="text-sm text-muted-foreground">por página</span>
              </div>
              
              {totalVariaveisPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setVariaveisPage(Math.max(1, variaveisPage - 1))}
                        className={variaveisPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalVariaveisPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setVariaveisPage(page)}
                          isActive={variaveisPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setVariaveisPage(Math.min(totalVariaveisPages, variaveisPage + 1))}
                        className={variaveisPage === totalVariaveisPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
        title="Excluir variável"
        description="Tem certeza que deseja excluir esta variável de custo? Esta ação não pode ser desfeita."
      />
    </>
  );
};
