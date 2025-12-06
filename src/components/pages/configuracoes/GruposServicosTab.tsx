
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useGruposServicos } from "./useGruposServicos";
import { GrupoServicoModal } from "./GrupoServicoModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export const GruposServicosTab = () => {
  const {
    currentGruposServicos,
    gruposServicosStartIndex,
    gruposServicosEndIndex,
    totalGruposServicos,
    gruposServicosPerPage,
    setGruposServicosPerPage,
    gruposServicosPage,
    setGruposServicosPage,
    totalGruposServicosPages,
    handleEditGrupoServico,
    showGrupoServicoForm,
    setShowGrupoServicoForm,
    editingGrupoServico,
    grupoServicoFormData,
    handleGrupoServicoSubmit,
    resetGrupoServicoForm,
    handleGrupoServicoInputChange,
    handleDeleteGrupoServico
  } = useGruposServicos();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState<string | null>(null);

  const openDeleteDialog = (id: string) => {
    setGrupoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (grupoToDelete) {
      handleDeleteGrupoServico(grupoToDelete);
      setGrupoToDelete(null);
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
          onClick={() => setShowGrupoServicoForm(true)}
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
            {currentGruposServicos.map((grupo) => (
              <TableRow key={grupo.id}>
                <TableCell className="font-medium">{grupo.nome}</TableCell>
                <TableCell>{grupo.descricao}</TableCell>
                <TableCell>{grupo.servicosIds.length} serviços</TableCell>
                <TableCell>
                  <Badge variant={grupo.status === "Ativo" ? "default" : "secondary"}>
                    {grupo.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditGrupoServico(grupo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(grupo.id)}
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

      {totalGruposServicos > gruposServicosPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {gruposServicosStartIndex + 1} a {Math.min(gruposServicosEndIndex, totalGruposServicos)} de {totalGruposServicos} grupos
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGruposServicosPage(Math.max(1, gruposServicosPage - 1))}
              disabled={gruposServicosPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {gruposServicosPage} de {totalGruposServicosPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGruposServicosPage(Math.min(totalGruposServicosPages, gruposServicosPage + 1))}
              disabled={gruposServicosPage === totalGruposServicosPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <GrupoServicoModal
        showGrupoServicoForm={showGrupoServicoForm}
        setShowGrupoServicoForm={setShowGrupoServicoForm}
        editingGrupoServico={editingGrupoServico}
        grupoServicoFormData={grupoServicoFormData}
        handleGrupoServicoSubmit={handleGrupoServicoSubmit}
        resetGrupoServicoForm={resetGrupoServicoForm}
        handleGrupoServicoInputChange={handleGrupoServicoInputChange}
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
