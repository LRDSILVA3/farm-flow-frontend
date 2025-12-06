
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Equipamento } from "./useEquipamentos";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface EquipamentosTabProps {
  currentEquipamentos: Equipamento[];
  equipamentosStartIndex: number;
  equipamentosEndIndex: number;
  totalEquipamentos: number;
  equipamentosPerPage: number;
  setEquipamentosPerPage: (value: number) => void;
  equipamentosPage: number;
  setEquipamentosPage: (value: number) => void;
  totalEquipamentosPages: number;
  setShowEquipamentoForm: (value: boolean) => void;
  handleEditEquipamento: (equipamento: Equipamento) => void;
  handleDeleteEquipamento: (id: string) => void;
}

export const EquipamentosTab: React.FC<EquipamentosTabProps> = ({
  currentEquipamentos,
  equipamentosStartIndex,
  equipamentosEndIndex,
  totalEquipamentos,
  equipamentosPerPage,
  setEquipamentosPerPage,
  equipamentosPage,
  setEquipamentosPage,
  totalEquipamentosPages,
  setShowEquipamentoForm,
  handleEditEquipamento,
  handleDeleteEquipamento
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipamentoToDelete, setEquipamentoToDelete] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setEquipamentoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (equipamentoToDelete) {
      handleDeleteEquipamento(equipamentoToDelete);
      setEquipamentoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Equipamentos</CardTitle>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowEquipamentoForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Equipamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEquipamentos.map((equipamento) => (
                  <TableRow key={equipamento.id}>
                    <TableCell className="font-medium">{equipamento.nome}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        equipamento.status === "Disponível" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {equipamento.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEquipamento(equipamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(equipamento.id)}
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
                  Mostrando {equipamentosStartIndex + 1} a {Math.min(equipamentosEndIndex, totalEquipamentos)} de {totalEquipamentos} equipamentos
                </span>
                <Select value={equipamentosPerPage.toString()} onValueChange={(value) => {
                  setEquipamentosPerPage(Number(value));
                  setEquipamentosPage(1);
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
              
              {totalEquipamentosPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setEquipamentosPage(Math.max(1, equipamentosPage - 1))}
                        className={equipamentosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalEquipamentosPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setEquipamentosPage(page)}
                          isActive={equipamentosPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setEquipamentosPage(Math.min(totalEquipamentosPages, equipamentosPage + 1))}
                        className={equipamentosPage === totalEquipamentosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
        title="Excluir equipamento"
        description="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita."
      />
    </>
  );
};
