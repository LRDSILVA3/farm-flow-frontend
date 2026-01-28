
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useServiceGroups } from "../../../hooks/useServiceGroups";
import { ServiceGroupModal } from "./ServiceGroupModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export const ServiceGroupsTab = () => {
  const {
    currentServiceGroups,
    serviceGroupsStartIndex,
    serviceGroupsEndIndex,
    totalServiceGroups,
    serviceGroupsPerPage,
    setServiceGroupsPerPage,
    serviceGroupsPage,
    setServiceGroupsPage,
    totalServiceGroupsPages,
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Grupos de Serviços</h3>
          <p className="text-sm text-gray-600">Gerencie grupos de serviços para facilitar a criação de pedidos</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowServiceGroupForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Serviços</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentServiceGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.servicesIds.length} serviços</TableCell>
                <TableCell>
                  <Badge variant={group.status === "Ativo" ? "default" : "secondary"}>
                    {group.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
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
            ))}
          </TableBody>
        </Table>
      </div>

      {totalServiceGroups > serviceGroupsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {serviceGroupsStartIndex + 1} a {Math.min(serviceGroupsEndIndex, totalServiceGroups)} de {totalServiceGroups} grupos
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setServiceGroupsPage(Math.max(1, serviceGroupsPage - 1))}
              disabled={serviceGroupsPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {serviceGroupsPage} de {totalServiceGroupsPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setServiceGroupsPage(Math.min(totalServiceGroupsPages, serviceGroupsPage + 1))}
              disabled={serviceGroupsPage === totalServiceGroupsPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <ServiceGroupModal
        showGrupoServicoForm={showServiceGroupForm}
        setShowGrupoServicoForm={setShowServiceGroupForm}
        editingGrupoServico={editingServiceGroup}
        grupoServicoFormData={serviceGroupFormData}
        handleGrupoServicoSubmit={handleServiceGroupSubmit}
        resetGrupoServicoForm={resetServiceGroupForm}
        handleGrupoServicoInputChange={handleServiceGroupInputChange}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir grupo"
        description="Tem certeza que deseja excluir este grupo de serviços? Esta ação não pode ser desfeita."
      />
    </div>
  );
};
