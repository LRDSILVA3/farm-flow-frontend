import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Edit, Trash2, Search, X, RotateCcw, Filter, Layers } from "lucide-react";
import { useServiceGroups } from "../../../hooks/useServiceGroups";
import { ServiceGroupModal } from "./ServiceGroupModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export const ServiceGroupsTab = () => {
  const {
    serviceGroups,
    serviceGroupsPerPage,
    setServiceGroupsPerPage,
    serviceGroupsPage,
    setServiceGroupsPage,
    handleEditServiceGroup,
    showServiceGroupForm,
    setShowServiceGroupForm,
    editingServiceGroup,
    serviceGroupFormData,
    handleServiceGroupSubmit,
    resetServiceGroupForm,
    handleServiceGroupInputChange,
    handleDeleteServiceGroup
  } = useServiceGroups();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtered service groups
  const filteredServiceGroups = useMemo(() => {
    return serviceGroups.filter((group) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        group.name.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "all" || group.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [serviceGroups, searchTerm, statusFilter]);

  const totalFiltered = filteredServiceGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / (serviceGroupsPerPage || 10)));
  const currentPage = Math.min(serviceGroupsPage, totalPages);
  const startIndex = (currentPage - 1) * (serviceGroupsPerPage || 10);
  const endIndex = Math.min(startIndex + (serviceGroupsPerPage || 10), totalFiltered);
  const displayedServiceGroups = filteredServiceGroups.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setServiceGroupsPage(1);
  };

  const openDeleteDialog = (id: string) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      handleDeleteServiceGroup(groupToDelete);
      setGroupToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-xl">Grupos de Serviços</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie pacotes e grupos de serviços para orçamentação e pedidos
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowServiceGroupForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo
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
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setServiceGroupsPage(1);
                    }}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setServiceGroupsPage(1);
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
                    setServiceGroupsPage(1);
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
                {totalFiltered} {totalFiltered === 1 ? 'grupo' : 'grupos'}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedServiceGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum grupo de serviços encontrado</p>
                          <p className="text-xs text-muted-foreground">
                            {hasActiveFilters 
                              ? "Tente ajustar os filtros ou termo de busca." 
                              : "Nenhum grupo de serviços cadastrado no sistema."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedServiceGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-emerald-600" />
                            {group.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{group.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal text-xs bg-muted/40">
                            {group.servicesIds?.length || 0} serviços
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={group.status === "Ativo" ? "default" : "secondary"}
                            className={group.status === "Ativo" ? "bg-green-600" : ""}
                          >
                            {group.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditServiceGroup(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(group.id)}
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
                  Mostrando {totalFiltered > 0 ? startIndex + 1 : 0} a {endIndex} de {totalFiltered} grupos
                </span>
                <Select 
                  value={(serviceGroupsPerPage || 10).toString()} 
                  onValueChange={(value) => {
                    setServiceGroupsPerPage(Number(value));
                    setServiceGroupsPage(1);
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
                        onClick={() => setServiceGroupsPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setServiceGroupsPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setServiceGroupsPage(Math.min(totalPages, currentPage + 1))}
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

      <ServiceGroupModal
        showServiceGroupForm={showServiceGroupForm}
        setShowServiceGroupForm={setShowServiceGroupForm}
        editingServiceGroup={editingServiceGroup}
        serviceGroupFormData={serviceGroupFormData}
        handleServiceGroupSubmit={handleServiceGroupSubmit}
        resetServiceGroupForm={resetServiceGroupForm}
        handleServiceGroupInputChange={handleServiceGroupInputChange}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir grupo"
        description="Tem certeza que deseja excluir este grupo de serviços? Esta ação não pode ser desfeita."
      />
    </>
  );
};
