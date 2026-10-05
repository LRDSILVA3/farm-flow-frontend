import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Link, Search, X, RotateCcw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CostVariable } from "../../../hooks/useCostVariables";
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

const getImpactedServices = (variable: CostVariable): string[] => {
  if (variable.linkedServices && variable.linkedServices.length > 0) {
    return variable.linkedServices.map(s => (typeof s === 'string' ? s : (s as any).name));
  }
  const code = (variable.code || '').toUpperCase();
  const name = (variable.name || '').toUpperCase();
  const category = ((variable as any).category || '').toUpperCase();

  const services: string[] = [];

  if (code.includes('AP_') || code.includes('AMOSTRAGEM') || code.includes('TIER_') || code.includes('REANALISE') || category.includes('AP')) {
    services.push('Amostragem de Solo (AP)');
  }
  if (code.includes('CONFERENCIA') || code.includes('CONF_') || category.includes('CONFERÊNCIA') || category.includes('CONFERENCIA')) {
    services.push('Conferência');
  }
  if (code.includes('FOLIAR') || code.includes('FOLHA') || category.includes('FOLIAR')) {
    services.push('Coleta Foliar');
  }
  if (code.includes('COMPACTA') || category.includes('COMPACTA')) {
    services.push('Compactação de Solo');
  }
  if (code.includes('DRONE_MAP') || code.includes('VOO_DRONE') || category.includes('DRONE MAP')) {
    services.push('Voo de Drone (Mapeamento)');
  }
  if (code.includes('DRONE_PULVE') || code.includes('SPRAY') || category.includes('DRONE PULVE')) {
    services.push('Pulverização Drone');
  }
  if (code.includes('ATV') || code.includes('ESTERCO') || category.includes('ATV')) {
    services.push('Aplicação ATV');
  }
  if (code.includes('EQUALIZA') || category.includes('EQUALIZA')) {
    services.push('Equalização de Serviços');
  }
  if (code.includes('ANALISE') || code.includes('LAB') || code.includes('MACRO') || code.includes('FISICA') || code.includes('ENXOFRE') || code.includes('ADUBO') || category.includes('LABORATÓRIO') || category.includes('LABORATORIO')) {
    services.push('Análises Laboratoriais');
  }
  if (code.includes('DIESEL') || code.includes('COMBUSTIVEL') || code.includes('KM_') || code.includes('DIARIA') || code.includes('PA_CARREGADEIRA') || category.includes('COMBUSTÍVEL') || category.includes('LOGÍSTICA') || category.includes('EQUIPAMENTOS')) {
    services.push('Operações & Frota');
  }
  if (code.includes('JUROS') || code.includes('IMPOSTO') || code.includes('NF') || category.includes('FINANCEIRO') || category.includes('FISCAL')) {
    services.push('Precificação Financeira');
  }

  return services.length > 0 ? services : ['Geral / Custo Operacional'];
};

export const CostVariablesTab: React.FC<CostVariablesTabProps> = ({
  costVariables,
  costVariablesPerPage,
  setCostVariablesPerPage,
  costVariablesPage,
  setCostVariablesPage,
  setShowCostVariableForm,
  handleEditCostVariable,
  handleDeleteCostVariable
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "value-desc" | "value-asc">("name");

  // Distinct services for filter dropdown
  const availableServices = useMemo(() => {
    const set = new Set<string>();
    costVariables.forEach(v => {
      getImpactedServices(v).forEach(s => set.add(s));
    });
    return Array.from(set).sort();
  }, [costVariables]);

  // Filtered & sorted variables
  const filteredCostVariables = useMemo(() => {
    return costVariables.filter((variable) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        variable.name.toLowerCase().includes(term) ||
        variable.code.toLowerCase().includes(term) ||
        (variable.description && variable.description.toLowerCase().includes(term));

      const matchesService = serviceFilter === "all" ||
        getImpactedServices(variable).includes(serviceFilter);

      return matchesSearch && matchesService;
    }).sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "value-desc") return (b.value || 0) - (a.value || 0);
      if (sortBy === "value-asc") return (a.value || 0) - (b.value || 0);
      return 0;
    });
  }, [costVariables, searchTerm, serviceFilter, sortBy]);

  const totalFiltered = filteredCostVariables.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / costVariablesPerPage));
  const currentPage = Math.min(costVariablesPage, totalPages);
  const startIndex = (currentPage - 1) * costVariablesPerPage;
  const endIndex = Math.min(startIndex + costVariablesPerPage, totalFiltered);
  const displayedVariables = filteredCostVariables.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== "" || serviceFilter !== "all" || sortBy !== "name";

  const handleResetFilters = () => {
    setSearchTerm("");
    setServiceFilter("all");
    setSortBy("name");
    setCostVariablesPage(1);
  };

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
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Variáveis de Custo</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Parâmetros e bases de cálculo para serviços agrícolas
            </p>
          </div>
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
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCostVariablesPage(1);
                    }}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setCostVariablesPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select 
                  value={serviceFilter} 
                  onValueChange={(val) => {
                    setServiceFilter(val);
                    setCostVariablesPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[220px] h-9 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Serviço vinculado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Serviços</SelectItem>
                    {availableServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={sortBy} 
                  onValueChange={(val: any) => {
                    setSortBy(val);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome (A-Z)</SelectItem>
                    <SelectItem value="code">Código</SelectItem>
                    <SelectItem value="value-desc">Maior Valor</SelectItem>
                    <SelectItem value="value-asc">Menor Valor</SelectItem>
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
                {totalFiltered} {totalFiltered === 1 ? 'variável' : 'variáveis'}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Serviços Vinculados</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedVariables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhuma variável de custo encontrada</p>
                          <p className="text-xs text-muted-foreground">
                            {hasActiveFilters 
                              ? "Tente ajustar os filtros ou termo de busca." 
                              : "Nenhuma variável de custo cadastrada no sistema."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedVariables.map((variable) => (
                      <TableRow key={variable.id}>
                        <TableCell className="font-medium">{variable.name}</TableCell>
                        <TableCell>
                          <code className="px-2 py-1 rounded bg-muted text-xs font-mono">
                            {variable.code}
                          </code>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-700">
                          {formatCurrency(variable.value)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {getImpactedServices(variable).map((serviceName, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center py-0.5 px-1.5"
                              >
                                <Link className="h-3 w-3 mr-1 text-emerald-600 shrink-0" />
                                {serviceName}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                          {variable.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {totalFiltered > 0 ? startIndex + 1 : 0} a {endIndex} de {totalFiltered} variáveis
                </span>
                <Select 
                  value={costVariablesPerPage.toString()} 
                  onValueChange={(value) => {
                    setCostVariablesPerPage(Number(value));
                    setCostVariablesPage(1);
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
                        onClick={() => setCostVariablesPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCostVariablesPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCostVariablesPage(Math.min(totalPages, currentPage + 1))}
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
        title="Excluir variável"
        description="Tem certeza que deseja excluir esta variável de custo? Esta ação não pode ser desfeita."
      />
    </>
  );
};
