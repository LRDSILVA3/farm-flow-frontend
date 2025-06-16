
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { AnaliseConfig } from "./useAnalises";

interface AnalisesTabProps {
  analises: AnaliseConfig[];
  setShowAnaliseForm: (show: boolean) => void;
  setEditingAnalise: (analise: AnaliseConfig | null) => void;
  setAnaliseFormData: (data: AnaliseConfig) => void;
}

export const AnalisesTab = ({
  analises,
  setShowAnaliseForm,
  setEditingAnalise,
  setAnaliseFormData
}: AnalisesTabProps) => {
  const handleEdit = (analise: AnaliseConfig) => {
    setEditingAnalise(analise);
    setAnaliseFormData(analise);
    setShowAnaliseForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Análises</CardTitle>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowAnaliseForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Análise
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Colaborador</TableHead>
              <TableHead>Prazo (dias)</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analises.map((analise) => (
              <TableRow key={analise.id}>
                <TableCell className="font-medium">{analise.nome}</TableCell>
                <TableCell>{analise.tipo}</TableCell>
                <TableCell>{analise.colaborador}</TableCell>
                <TableCell>{analise.prazo}</TableCell>
                <TableCell>R$ {analise.valor}</TableCell>
                <TableCell>
                  <Badge variant={analise.status === "Ativo" ? "default" : "secondary"}>
                    {analise.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(analise)}
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
