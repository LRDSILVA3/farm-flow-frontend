import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, UserCheck, Search, X, RotateCcw, Filter } from "lucide-react";
import { Collaborator } from "../../../hooks/useCollaborators";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface CollaboratorsTabProps {
  collaborators: Collaborator[];
  collaboratorsStartIndex?: number;
  collaboratorsEndIndex?: number;
  totalCollaborators?: number;
  collaboratorsPerPage?: number;
  setCollaboratorsPerPage?: (value: number) => void;
  collaboratorsPage?: number;
  setCollaboratorsPage?: (value: number) => void;
  totalCollaboratorsPages?: number;
  setShowCollaboratorForm: (show: boolean) => void;
  setEditingCollaborator?: (collaborator: Collaborator | null) => void;
  setCollaboratorFormData?: (data: Collaborator) => void;
  handleEditCollaborator?: (collaborator: Collaborator) => void;
  handleDeleteCollaborator: (id: string) => void;
}

export const CollaboratorsTab = ({
  collaborators = [],
  collaboratorsPerPage = 10,
  setCollaboratorsPerPage,
  collaboratorsPage = 1,
  setCollaboratorsPage,
  setShowCollaboratorForm,
  setEditingCollaborator,
  setCollaboratorFormData,
  handleEditCollaborator: onEdit,
  handleDeleteCollaborator
}: CollaboratorsTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Distinct roles
  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    collaborators.forEach(c => {
      if (c.role) set.add(c.role);
    });
    return Array.from(set).sort();
  }, [collaborators]);

  // Filtered collaborators
  const filteredCollaborators = useMemo(() => {
    return collaborators.filter((collaborator) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        collaborator.name.toLowerCase().includes(term) ||
        (collaborator.phone && collaborator.phone.toLowerCase().includes(term)) ||
        (collaborator.email && collaborator.email.toLowerCase().includes(term));

      const matchesRole = roleFilter === "all" || collaborator.role === roleFilter;
      const matchesStatus = statusFilter === "all" || collaborator.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [collaborators, searchTerm, roleFilter, statusFilter]);

  const totalFiltered = filteredCollaborators.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / collaboratorsPerPage));
  const currentPage = Math.min(collaboratorsPage, totalPages);
  const startIndex = (currentPage - 1) * collaboratorsPerPage;
  const endIndex = Math.min(startIndex + collaboratorsPerPage, totalFiltered);
  const displayedCollaborators = filteredCollaborators.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== "" || roleFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    if (setCollaboratorsPage) setCollaboratorsPage(1);
  };

  const handleEdit = (collaborator: Collaborator) => {
    if (onEdit) {
      onEdit(collaborator);
    } else {
      if (setEditingCollaborator) setEditingCollaborator(collaborator);
      if (setCollaboratorFormData) setCollaboratorFormData(collaborator);
      setShowCollaboratorForm(true);
    }
  };

  const openDeleteDialog = (id: string) => {
    setCollaboratorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (collaboratorToDelete) {
      handleDeleteCollaborator(collaboratorToDelete);
      setCollaboratorToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-xl">Colaboradores e Equipe</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Operadores, pilotos de drone e agrônomos de campo</p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowCollaboratorForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Colaborador
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
                    placeholder="Buscar por nome, telefone ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (setCollaboratorsPage) setCollaboratorsPage(1);
                    }}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        if (setCollaboratorsPage) setCollaboratorsPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select 
                  value={roleFilter} 
                  onValueChange={(val) => {
                    setRoleFilter(val);
                    if (setCollaboratorsPage) setCollaboratorsPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Cargo / Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Funções</SelectItem>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={statusFilter} 
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    if (setCollaboratorsPage) setCollaboratorsPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs">
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
                {totalFiltered} {totalFiltered === 1 ? 'colaborador' : 'colaboradores'}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função / Cargo</TableHead>
                    <TableHead>Telefone / WhatsApp</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCollaborators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum colaborador encontrado</p>
                          <p className="text-xs text-muted-foreground">
                            {hasActiveFilters 
                              ? "Tente ajustar os filtros ou termo de busca." 
                              : "Nenhum colaborador cadastrado. Clique em 'Novo Colaborador' para adicionar."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedCollaborators.map((collaborator) => (
                      <TableRow key={collaborator.id}>
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                            {collaborator.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal bg-muted/40">
                            {collaborator.role || "Operador"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {collaborator.phone || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {collaborator.email || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={collaborator.status === "Ativo" ? "default" : "secondary"} className={collaborator.status === "Ativo" ? "bg-green-600" : ""}>
                            {collaborator.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(collaborator)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(collaborator.id)}
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
                  Mostrando {totalFiltered > 0 ? startIndex + 1 : 0} a {endIndex} de {totalFiltered} colaboradores
                </span>
                {setCollaboratorsPerPage && (
                  <>
                    <Select 
                      value={(collaboratorsPerPage || 10).toString()} 
                      onValueChange={(value) => {
                        setCollaboratorsPerPage(Number(value));
                        if (setCollaboratorsPage) setCollaboratorsPage(1);
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
                  </>
                )}
              </div>
              
              {totalPages > 1 && setCollaboratorsPage && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCollaboratorsPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCollaboratorsPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCollaboratorsPage(Math.min(totalPages, currentPage + 1))}
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
        title="Excluir colaborador"
        description="Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita."
      />
    </>
  );
};
