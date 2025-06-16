
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Colaborador } from "./useColaboradores";

interface ColaboradoresTabProps {
  colaboradores: Colaborador[];
  currentColaboradores: Colaborador[];
  colaboradoresStartIndex: number;
  colaboradoresEndIndex: number;
  totalColaboradores: number;
  colaboradoresPerPage: number;
  setColaboradoresPerPage: (value: number) => void;
  colaboradoresPage: number;
  setColaboradoresPage: (value: number) => void;
  totalColaboradoresPages: number;
  setShowColaboradorForm: (show: boolean) => void;
  setEditingColaborador: (colaborador: Colaborador | null) => void;
  setColaboradorFormData: (data: Colaborador) => void;
}

export const ColaboradoresTab = ({
  currentColaboradores,
  colaboradoresStartIndex,
  colaboradoresEndIndex,
  totalColaboradores,
  colaboradoresPerPage,
  setColaboradoresPerPage,
  colaboradoresPage,
  setColaboradoresPage,
  totalColaboradoresPages,
  setShowColaboradorForm,
  setEditingColaborador,
  setColaboradorFormData
}: ColaboradoresTabProps) => {
  const handleEdit = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setColaboradorFormData(colaborador);
    setShowColaboradorForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Colaboradores</CardTitle>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowColaboradorForm(true)}
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
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentColaboradores.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell className="font-medium">{colaborador.nome}</TableCell>
                  <TableCell>{colaborador.endereco}</TableCell>
                  <TableCell>
                    <Badge variant={colaborador.status === "Ativo" ? "default" : "secondary"}>
                      {colaborador.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(colaborador)}
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
                Mostrando {colaboradoresStartIndex + 1} a {Math.min(colaboradoresEndIndex, totalColaboradores)} de {totalColaboradores} colaboradores
              </span>
              <Select value={colaboradoresPerPage.toString()} onValueChange={(value) => {
                setColaboradoresPerPage(Number(value));
                setColaboradoresPage(1);
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
            
            {totalColaboradoresPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setColaboradoresPage(Math.max(1, colaboradoresPage - 1))}
                      className={colaboradoresPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalColaboradoresPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setColaboradoresPage(page)}
                        isActive={colaboradoresPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setColaboradoresPage(Math.min(totalColaboradoresPages, colaboradoresPage + 1))}
                      className={colaboradoresPage === totalColaboradoresPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
