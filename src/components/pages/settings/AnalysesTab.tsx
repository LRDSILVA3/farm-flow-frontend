import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, X, RotateCcw, Filter } from "lucide-react";
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
  analyses = [],
  analysesPerPage = 10,
  setAnalysesPerPage,
  analysesPage = 1,
  setAnalysesPage,
  setShowAnalysisForm,
  setEditingAnalysis,
  setAnalysisFormData,
  handleDeleteAnalysis
}: AnalysesTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Distinct types
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    analyses.forEach(a => {
      if (a.type) set.add(a.type);
    });
    return Array.from(set).sort();
  }, [analyses]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((analysis) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        analysis.name.toLowerCase().includes(term) ||
        (analysis.collaborator && analysis.collaborator.toLowerCase().includes(term));

      const matchesType = typeFilter === "all" || analysis.type === typeFilter;
      
      const isStatusActive = analysis.status === "Active" || (analysis.status as any) === "Ativo";
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "Active" && isStatusActive) ||
        (statusFilter === "Inactive" && !isStatusActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [analyses, searchTerm, typeFilter, statusFilter]);

  const totalFiltered = filteredAnalyses.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / (analysesPerPage || 10)));
  const currentPage = Math.min(analysesPage, totalPages);
  const startIndex = (currentPage - 1) * (analysesPerPage || 10);
  const endIndex = Math.min(startIndex + (analysesPerPage || 10), totalFiltered);
  const displayedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    if (setAnalysesPage) setAnalysesPage(1);
  };

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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Análises</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Protocolos de análises laboratoriais de solo, folha e granulometria
            </p>
          </div>
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
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar análise ou laboratório/colaborador..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (setAnalysesPage) setAnalysesPage(1);
                    }}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        if (setAnalysesPage) setAnalysesPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select 
                  value={typeFilter} 
                  onValueChange={(val) => {
                    setTypeFilter(val);
                    if (setAnalysesPage) setAnalysesPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "Soil" ? "Solo (Química/Física)" : type === "Leaf" ? "Foliar" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={statusFilter} 
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    if (setAnalysesPage) setAnalysesPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Active">Ativo</SelectItem>
                    <SelectItem value="Inactive">Inativo</SelectItem>
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
                {totalFiltered} {totalFiltered === 1 ? 'análise' : 'análises'}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Colaborador / Lab</TableHead>
                    <TableHead>Prazo (dias)</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedAnalyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhuma análise encontrada</p>
                          <p className="text-xs text-muted-foreground">
                            {hasActiveFilters 
                              ? "Tente ajustar os filtros ou termo de busca." 
                              : "Nenhuma análise cadastrada no sistema."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedAnalyses.map((analysis) => {
                      const isActive = analysis.status === "Active" || (analysis.status as any) === "Ativo";
                      return (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium text-foreground">{analysis.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal text-xs">
                              {analysis.type === "Soil" ? "Solo" : analysis.type === "Leaf" ? "Foliar" : analysis.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{analysis.collaborator || "-"}</TableCell>
                          <TableCell>{analysis.deadline ? `${analysis.deadline} dias` : "-"}</TableCell>
                          <TableCell className="font-semibold text-emerald-700">R$ {analysis.value}</TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : ""}>
                              {isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
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
                  Mostrando {totalFiltered > 0 ? startIndex + 1 : 0} a {endIndex} de {totalFiltered} análises
                </span>
                <Select 
                  value={(analysesPerPage || 10).toString()} 
                  onValueChange={(value) => {
                    setAnalysesPerPage(Number(value));
                    if (setAnalysesPage) setAnalysesPage(1);
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
              
              {totalPages > 1 && setAnalysesPage && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setAnalysesPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setAnalysesPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setAnalysesPage(Math.min(totalPages, currentPage + 1))}
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
        title="Excluir análise"
        description="Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita."
      />
    </>
  );
};
