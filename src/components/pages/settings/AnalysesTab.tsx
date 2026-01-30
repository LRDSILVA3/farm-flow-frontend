
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Analysis } from "../../../hooks/useAnalyses";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface AnalysesTabProps {
  analyses: Analysis[];
  analysesStartIndex: number;
  analysesEndIndex: number;
  totalAnalyses: number;
  analysesPerPage: number;
  setAnalysesPerPage: (value: number) => void;
  analysesPage: number;
  setAnalysesPage: (value: number) => void;
  totalAnalysesPages: number;
  setShowAnalysisForm: (show: boolean) => void;
  setEditingAnalysis: (analysis: Analysis | null) => void;
  setAnalysisFormData: (data: Analysis) => void;
  handleDeleteAnalysis: (id: string) => void;
}

export const AnalysesTab = ({
  analyses,
  analysesStartIndex,
  analysesEndIndex,
  totalAnalyses,
  analysesPerPage,
  setAnalysesPerPage,
  analysesPage,
  setAnalysesPage,
  totalAnalysesPages,
  setShowAnalysisForm,
  setEditingAnalysis,
  setAnalysisFormData,
  handleDeleteAnalysis
}: AnalysesTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);

  const handleEditAnalysis = (analysis: Analysis) => {
    setEditingAnalysis(analysis);
    setAnalysisFormData(analysis);
    setShowAnalysisForm(true);
  };

  const openDeleteDialog = (id: string) => {
    setAnalysisToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (analysisToDelete) {
      handleDeleteAnalysis(analysisToDelete);
      setAnalysisToDelete(null);
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
            onClick={() => setShowAnalysisForm(true)}
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
                {analyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">{analysis.name}</TableCell>
                    <TableCell>{analysis.type}</TableCell>
                    <TableCell>{analysis.collaborator}</TableCell>
                    <TableCell>{analysis.deadline}</TableCell>
                    <TableCell>R$ {analysis.value}</TableCell>
                    <TableCell>
                      <Badge variant={analysis.status === "Active" ? "default" : "secondary"}>
                        {analysis.status === "Active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAnalysis(analysis)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(analysis.id)}
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
                  Mostrando {analysesStartIndex + 1} a {Math.min(analysesEndIndex, totalAnalyses)} de {totalAnalyses} análises
                </span>
                <Select value={analysesPerPage.toString()} onValueChange={(value) => {
                  setAnalysesPerPage(Number(value));
                  setAnalysesPage(1);
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
              
              {totalAnalysesPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setAnalysesPage(Math.max(1, analysesPage - 1))}
                        className={analysesPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalAnalysesPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setAnalysesPage(page)}
                          isActive={analysesPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setAnalysesPage(Math.min(totalAnalysesPages, analysesPage + 1))}
                        className={analysesPage === totalAnalysesPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
