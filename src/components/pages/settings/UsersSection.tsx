
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { UserModal } from "./UserModal";
import { useUser } from "./useUser";

export const UsersSection = () => {
  const {
    currentUsers,
    usersStartIndex,
    usersEndIndex,
    totalUsers,
    usersPerPage,
    setUsersPerPage,
    usersPage,
    setUsersPage,
    totalUsersPages,
    handleEditUser,
    // Include all modal props including setShowUserForm
    showUserForm,
    setShowUserForm,
    editingUser,
    userFormData,
    handleUserSubmit,
    resetUserForm,
    handleUserInputChange,
    handlePermissionChange
  } = useUser();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuários e Permissões</CardTitle>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowUserForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                {currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "Ativo" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.slice(0, 3).map((permission) => (
                          <span key={permission} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {permission}
                          </span>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="text-xs text-gray-500">+{user.permissions.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.creationDate}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {usersStartIndex + 1} a {Math.min(usersEndIndex, totalUsers)} de {totalUsers} usuários
                </span>
                <Select value={usersPerPage.toString()} onValueChange={(value) => {
                  setUsersPerPage(Number(value));
                  setUsersPage(1);
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
        handlePermissionChange={handlePermissionChange}
      />
    </>
  );
};
