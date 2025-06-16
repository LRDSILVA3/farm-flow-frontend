
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { Colaborador } from "./useColaboradores";

interface ColaboradoresTabProps {
  colaboradores: Colaborador[];
  setShowColaboradorForm: (show: boolean) => void;
  setEditingColaborador: (colaborador: Colaborador | null) => void;
  setColaboradorFormData: (data: Colaborador) => void;
}

export const ColaboradoresTab = ({
  colaboradores,
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
            {colaboradores.map((colaborador) => (
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
      </CardContent>
    </Card>
  );
};
