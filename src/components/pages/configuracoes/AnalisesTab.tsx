
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AnaliseConfig } from "./useAnalises";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface AnalisesTabProps {
  analises: AnaliseConfig[];
  currentAnalises: AnaliseConfig[];
  analisesStartIndex: number;
  analisesEndIndex: number;
  totalAnalises: number;
  analisesPerPage: number;
  setAnalisesPerPage: (value: number) => void;
  analisesPage: number;
  setAnalisesPage: (value: number) => void;
  totalAnalisesPages: number;
  setShowAnaliseForm: (show: boolean) => void;
  setEditingAnalise: (analise: AnaliseConfig | null) => void;
  setAnaliseFormData: (data: AnaliseConfig) => void;
  handleDeleteAnalise: (id: string) => void;
}

export const AnalisesTab = ({
  currentAnalises,
  analisesStartIndex,
  analisesEndIndex,
  totalAnalises,
  analisesPerPage,
  setAnalisesPerPage,
  analisesPage,
  setAnalisesPage,
  totalAnalisesPages,
  setShowAnaliseForm,
  setEditingAnalise,
  setAnaliseFormData,
  handleDeleteAnalise
}: AnalisesTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analiseToDelete, setAnaliseToDelete] = useState<string | null>(null);

  const handleEdit = (analise: AnaliseConfig) => {
    setEditingAnalise(analise);
    setAnaliseFormData(analise);
    setShowAnaliseForm(true);
  };

  const openDeleteDialog = (id: string) => {
    setAnaliseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (analiseToDelete) {
      handleDeleteAnalise(analiseToDelete);
      setAnaliseToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Análises</CardTitle>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowAnaliseForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Prazo (dias)</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAnalises.map((analise) => (
                  <TableRow key={analise.id}>
                    <TableCell className="font-medium">{analise.nome}</TableCell>
                    <TableCell>{analise.tipo}</TableCell>
                    <TableCell>{analise.colaborador}</TableCell>
                    <TableCell>{analise.prazo}</TableCell>
                    <TableCell>R$ {analise.valor}</TableCell>
                    <TableCell>
                      <Badge variant={analise.status === "Ativo" ? "default" : "secondary"}>
                        {analise.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(analise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(analise.id)}
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
                  Mostrando {analisesStartIndex + 1} a {Math.min(analisesEndIndex, totalAnalises)} de {totalAnalises} análises
                </span>
                <Select value={analisesPerPage.toString()} onValueChange={(value) => {
                  setAnalisesPerPage(Number(value));
                  setAnalisesPage(1);
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
              
              {totalAnalisesPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setAnalisesPage(Math.max(1, analisesPage - 1))}
                        className={analisesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalAnalisesPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setAnalisesPage(page)}
                          isActive={analisesPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setAnalisesPage(Math.min(totalAnalisesPages, analisesPage + 1))}
                        className={analisesPage === totalAnalisesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
        title="Excluir análise"
        description="Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita."
      />
    </>
  );
};
