import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Shield, Eye, Edit3 } from "lucide-react";
import { PERMISSION_LABELS, PERMISSION_MODULES } from "@/constants/permissions";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { UserModal } from "./UserModal";
import { PositionModal } from "./PositionModal";
import { useUser } from "./useUser";
import { Position } from "@/hooks/usePositions";

export const UsersSection = () => {
  const {
    currentUsers,
    currentUserId,
    usersStartIndex,
    usersEndIndex,
    totalUsers,
    usersPerPage,
    setUsersPerPage,
    usersPage,
    setUsersPage,
    totalUsersPages,
    showUserForm,
    setShowUserForm,
    editingUser,
    userFormData,
    userToDelete,
    setUserToDelete,
    handleOpenNewUser,
    handleEditUser,
    handleUserSubmit,
    confirmDeleteUser,
    resetUserForm,
    handleUserInputChange,
    handleRoleChange,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleClearPermissions,
    positions,
    savePosition,
    deletePosition,
  } = useUser();

  const [activeTab, setActiveTab] = useState<"users" | "positions">("users");
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState<Position | null>(null);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  const handleOpenNewPosition = () => {
    setPositionToEdit(null);
    setShowPositionModal(true);
  };

  const handleEditPosition = (pos: Position) => {
    setPositionToEdit(pos);
    setShowPositionModal(true);
  };

  const confirmDeletePosition = async () => {
    if (!positionToDelete) return;
    await deletePosition(positionToDelete.id, positionToDelete.name);
    setPositionToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Gestão de Usuários e Cargos
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie usuários do sistema, cadastre cargos e defina níveis de visualização e edição.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border">
              <Button
                type="button"
                variant={activeTab === "users" ? "default" : "ghost"}
                size="sm"
                className={`h-8 text-xs font-medium ${
                  activeTab === "users"
                    ? "bg-white text-slate-900 shadow-sm hover:bg-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Usuários ({totalUsers})
              </Button>
              <Button
                type="button"
                variant={activeTab === "positions" ? "default" : "ghost"}
                size="sm"
                className={`h-8 text-xs font-medium ${
                  activeTab === "positions"
                    ? "bg-white text-slate-900 shadow-sm hover:bg-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("positions")}
              >
                <Shield className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                Cargos & Permissões ({positions.length})
              </Button>
            </div>

            {activeTab === "users" ? (
              <Button
                className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                onClick={handleOpenNewUser}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Novo Usuário
              </Button>
            ) : (
              <Button
                className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                onClick={handleOpenNewPosition}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Novo Cargo
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {activeTab === "users" ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Níveis de Acesso</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((user) => {
                      const isSelf = currentUserId === user.id;
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                            {isSelf && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-normal">
                                Você
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className="font-medium text-slate-700">{user.role}</span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap font-medium ${
                                user.status === "Ativo"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {user.permissions.slice(0, 4).map((permission) => {
                                const isEdit = permission.endsWith(":edit");
                                const isView = permission.endsWith(":view");
                                return (
                                  <span
                                    key={permission}
                                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 ${
                                      isEdit
                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                        : isView
                                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {isEdit ? (
                                      <Edit3 className="h-3 w-3 text-emerald-600" />
                                    ) : isView ? (
                                      <Eye className="h-3 w-3 text-blue-600" />
                                    ) : null}
                                    {PERMISSION_LABELS[permission] || permission}
                                  </span>
                                );
                              })}
                              {user.permissions.length > 4 && (
                                <span className="text-[11px] text-gray-500 self-center font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                  +{user.permissions.length - 4}
                                </span>
                              )}
                              {user.permissions.length === 0 && (
                                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                  Nenhum acesso configurado
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {user.creationDate}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label="Editar usuário"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {totalUsers > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isSelf}
                                  title={
                                    isSelf
                                      ? "Você não pode excluir seu próprio usuário"
                                      : "Excluir usuário"
                                  }
                                  aria-label={
                                    isSelf
                                      ? "Você não pode excluir seu próprio usuário"
                                      : "Excluir usuário"
                                  }
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setUserToDelete(user)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
                    Mostrando {totalUsers > 0 ? usersStartIndex + 1 : 0} a{" "}
                    {Math.min(usersEndIndex, totalUsers)} de {totalUsers} usuários
                  </span>
                  <Select
                    value={usersPerPage.toString()}
                    onValueChange={(value) => {
                      setUsersPerPage(Number(value));
                      setUsersPage(1);
                    }}
                  >
                    <SelectTrigger className="w-16 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-gray-600">por página</span>
                </div>

                {totalUsersPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                          className={usersPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setUsersPage(page)}
                            isActive={usersPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setUsersPage(Math.min(totalUsersPages, usersPage + 1))}
                          className={
                            usersPage === totalUsersPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          ) : (
            /* TAB DE CARGOS E PERMISSÕES */
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissões Configuradas</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                          Nenhum cargo personalizado encontrado. Clique em "+ Novo Cargo" para cadastrar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      positions.map((pos) => {
                        const totalMods = PERMISSION_MODULES.length;
                        const viewsCount = pos.permissions.filter((p) => p.endsWith(":view")).length;
                        const editsCount = pos.permissions.filter((p) => p.endsWith(":edit")).length;

                        return (
                          <TableRow key={pos.id}>
                            <TableCell className="font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                {pos.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  pos.status === "Ativo"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {pos.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  <Eye className="h-3 w-3" />
                                  {viewsCount} visualização(ões)
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Edit3 className="h-3 w-3" />
                                  {editsCount} edição(ões)
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  de {totalMods} módulos
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  aria-label="Editar cargo"
                                  onClick={() => handleEditPosition(pos)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  aria-label="Excluir cargo"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setPositionToDelete(pos)}
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
            </div>
          )}
        </CardContent>
      </Card>

      <UserModal
        showUserForm={showUserForm}
        setShowUserForm={setShowUserForm}
        editingUser={editingUser}
        userFormData={userFormData}
        handleUserSubmit={handleUserSubmit}
        resetUserForm={resetUserForm}
        handleUserInputChange={handleUserInputChange}
        handleRoleChange={handleRoleChange}
        handlePermissionChange={handlePermissionChange}
        handleSelectAllPermissions={handleSelectAllPermissions}
        handleClearPermissions={handleClearPermissions}
        positions={positions}
      />

      <PositionModal
        open={showPositionModal}
        onOpenChange={(open) => {
          setShowPositionModal(open);
          if (!open) setPositionToEdit(null);
        }}
        positionToEdit={positionToEdit}
        onSave={savePosition}
      />

      <DeleteConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Excluir Usuário"
        description={
          userToDelete
            ? `Tem certeza que deseja excluir o usuário "${userToDelete.name}" (${userToDelete.email})? Esta ação não pode ser desfeita.`
            : undefined
        }
      />

      <DeleteConfirmDialog
        open={!!positionToDelete}
        onOpenChange={(open) => {
          if (!open) setPositionToDelete(null);
        }}
        onConfirm={confirmDeletePosition}
        title="Excluir Cargo"
        description={
          positionToDelete
            ? `Tem certeza que deseja excluir o cargo "${positionToDelete.name}"? Usuários associados a este cargo manterão suas permissões salvas individualmente.`
            : undefined
        }
      />
    </>
  );
};
