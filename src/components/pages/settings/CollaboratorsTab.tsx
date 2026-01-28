
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Collaborator } from "../../../hooks/useCollaborators";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface CollaboratorsTabProps {
  collaborators: Collaborator[];
  collaboratorsStartIndex: number;
  collaboratorsEndIndex: number;
  totalCollaborators: number;
  collaboratorsPerPage: number;
  setCollaboratorsPerPage: (value: number) => void;
  collaboratorsPage: number;
  setCollaboratorsPage: (value: number) => void;
  totalCollaboratorsPages: number;
  setShowCollaboratorForm: (show: boolean) => void;
  setEditingCollaborator: (collaborator: Collaborator | null) => void;
  setCollaboratorFormData: (data: Collaborator) => void;
  handleDeleteCollaborator: (id: string) => void;
}

export const CollaboratorsTab = ({
  collaborators,
  collaboratorsStartIndex,
  collaboratorsEndIndex,
  totalCollaborators,
  collaboratorsPerPage,
  setCollaboratorsPerPage,
  collaboratorsPage,
  setCollaboratorsPage,
  totalCollaboratorsPages,
  setShowCollaboratorForm,
  setEditingCollaborator,
  setCollaboratorFormData,
  handleDeleteCollaborator
}: CollaboratorsTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<string | null>(null);

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setCollaboratorFormData(collaborator);
    setShowCollaboratorForm(true);
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Colaboradores</CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((collaborator) => (
                  <TableRow key={collaborator.id}>
                    <TableCell className="font-medium">{collaborator.name}</TableCell>
                    <TableCell>{collaborator.address}</TableCell>
                    <TableCell>
                      <Badge variant={collaborator.status === "Ativo" ? "default" : "secondary"}>
                        {collaborator.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCollaborator(collaborator)}
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
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {collaboratorsStartIndex + 1} a {Math.min(collaboratorsEndIndex, totalCollaborators)} de {totalCollaborators} colaboradores
                </span>
                <Select value={collaboratorsPerPage.toString()} onValueChange={(value) => {
                  setCollaboratorsPerPage(Number(value));
                  setCollaboratorsPage(1);
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
              
              {totalCollaboratorsPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCollaboratorsPage(Math.max(1, collaboratorsPage - 1))}
                        className={collaboratorsPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalCollaboratorsPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCollaboratorsPage(page)}
                          isActive={collaboratorsPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCollaboratorsPage(Math.min(totalCollaboratorsPages, collaboratorsPage + 1))}
                        className={collaboratorsPage === totalCollaboratorsPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
