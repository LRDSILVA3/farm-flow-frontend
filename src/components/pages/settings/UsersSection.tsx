import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { PERMISSION_LABELS } from "@/constants/permissions";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { UserModal } from "./UserModal";
import { useUser } from "./useUser";

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
  } = useUser();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuários e Permissões</CardTitle>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleOpenNewUser}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Ações</TableHead>
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
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                              user.status === "Ativo"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.slice(0, 3).map((permission) => (
                              <span key={permission} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                {PERMISSION_LABELS[permission] || permission}
                              </span>
                            ))}
                            {user.permissions.length > 3 && (
                              <span className="text-xs text-gray-500 self-center">+{user.permissions.length - 3}</span>
                            )}
                            {user.permissions.length === 0 && (
                              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                Nenhuma
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{user.creationDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
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
                                title={isSelf ? "Você não pode excluir seu próprio usuário" : "Excluir usuário"}
                                aria-label={isSelf ? "Você não pode excluir seu próprio usuário" : "Excluir usuário"}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {totalUsers > 0 ? usersStartIndex + 1 : 0} a {Math.min(usersEndIndex, totalUsers)} de {totalUsers} usuários
                </span>
                <Select
                  value={usersPerPage.toString()}
                  onValueChange={(value) => {
                    setUsersPerPage(Number(value));
                    setUsersPage(1);
                  }}
                >
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
                        className={usersPage === totalUsersPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
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
    </>
  );
};
