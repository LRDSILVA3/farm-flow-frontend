import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CostVariable } from "./../../../hooks/useCostVariables";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface CostVariablesTabProps {
  costVariables: CostVariable[];
  costVariablesStartIndex: number;
  costVariablesEndIndex: number;
  totalCostVariables: number;
  costVariablesPerPage: number;
  setCostVariablesPerPage: (value: number) => void;
  costVariablesPage: number;
  setCostVariablesPage: (value: number) => void;
  totalCostVariablesPages: number;
  setShowCostVariableForm: (value: boolean) => void;
  handleEditCostVariable: (variable: CostVariable) => void;
  handleDeleteCostVariable: (id: string) => void;
}

export const VariaveisCustoTab: React.FC<CostVariablesTabProps> = ({
  costVariables,
  costVariablesStartIndex,
  costVariablesEndIndex,
  totalCostVariables,
  costVariablesPerPage,
  setCostVariablesPerPage,
  costVariablesPage,
  setCostVariablesPage,
  totalCostVariablesPages,
  setShowCostVariableForm,
  handleEditCostVariable,
  handleDeleteCostVariable
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setVariableToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (variableToDelete) {
      handleDeleteCostVariable(variableToDelete);
      setVariableToDelete(null);
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
            onClick={() => setShowCostVariableForm(true)}
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
                {costVariables.map((variable) => (
                  <TableRow key={variable.id}>
                    <TableCell className="font-medium">{variable.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-muted text-xs">
                        {variable.code}
                      </code>
                    </TableCell>
                    <TableCell>{formatCurrency(variable.value)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{variable.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCostVariable(variable)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(variable.id)}
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
                  Mostrando {costVariablesStartIndex + 1} a {Math.min(costVariablesEndIndex, totalCostVariables)} de {totalCostVariables} variáveis
                </span>
                <Select value={costVariablesPerPage.toString()} onValueChange={(value) => {
                  setCostVariablesPerPage(Number(value));
                  setCostVariablesPage(1);
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
              
              {totalCostVariablesPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCostVariablesPage(Math.max(1, costVariablesPage - 1))}
                        className={costVariablesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalCostVariablesPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCostVariablesPage(page)}
                          isActive={costVariablesPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCostVariablesPage(Math.min(totalCostVariablesPages, costVariablesPage + 1))}
                        className={costVariablesPage === totalCostVariablesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
