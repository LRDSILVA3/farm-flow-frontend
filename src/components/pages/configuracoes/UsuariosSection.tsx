
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { UsuarioModal } from "./UsuarioModal";
import { useUsuarios } from "./useUsuarios";

export const UsuariosSection = () => {
  const {
    currentUsuarios,
    usuariosStartIndex,
    usuariosEndIndex,
    totalUsuarios,
    usuariosPerPage,
    setUsuariosPerPage,
    usuariosPage,
    setUsuariosPage,
    totalUsuariosPages,
    handleEditUsuario,
    // Include all modal props including setShowUsuarioForm
    showUsuarioForm,
    setShowUsuarioForm,
    editingUsuario,
    usuarioFormData,
    handleUsuarioSubmit,
    resetUsuarioForm,
    handleUsuarioInputChange,
    handlePermissaoChange
  } = useUsuarios();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuários e Permissões</CardTitle>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowUsuarioForm(true)}
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
                {currentUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.cargo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        usuario.status === "Ativo" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {usuario.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {usuario.permissoes.slice(0, 3).map((permissao) => (
                          <span key={permissao} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {permissao}
                          </span>
                        ))}
                        {usuario.permissoes.length > 3 && (
                          <span className="text-xs text-gray-500">+{usuario.permissoes.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{usuario.dataCriacao}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUsuario(usuario)}
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
                  Mostrando {usuariosStartIndex + 1} a {Math.min(usuariosEndIndex, totalUsuarios)} de {totalUsuarios} usuários
                </span>
                <Select value={usuariosPerPage.toString()} onValueChange={(value) => {
                  setUsuariosPerPage(Number(value));
                  setUsuariosPage(1);
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
              
              {totalUsuariosPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setUsuariosPage(Math.max(1, usuariosPage - 1))}
                        className={usuariosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalUsuariosPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setUsuariosPage(page)}
                          isActive={usuariosPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setUsuariosPage(Math.min(totalUsuariosPages, usuariosPage + 1))}
                        className={usuariosPage === totalUsuariosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <UsuarioModal 
        showUsuarioForm={showUsuarioForm}
        setShowUsuarioForm={setShowUsuarioForm}
        editingUsuario={editingUsuario}
        usuarioFormData={usuarioFormData}
        handleUsuarioSubmit={handleUsuarioSubmit}
        resetUsuarioForm={resetUsuarioForm}
        handleUsuarioInputChange={handleUsuarioInputChange}
        handlePermissaoChange={handlePermissaoChange}
      />
    </>
  );
};
