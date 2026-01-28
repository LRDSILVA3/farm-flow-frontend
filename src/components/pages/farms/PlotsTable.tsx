
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Talhao } from "../FarmPage";

interface TalhoesTableProps {
  talhoes: Talhao[];
  onEditTalhao: (talhao: Talhao) => void;
  onDeleteTalhao: (talhaoId: string) => void;
}

export const TalhoesTable = ({ talhoes, onEditTalhao, onDeleteTalhao }: TalhoesTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800";
      case "Inativo":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (talhoes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Nenhum talhão cadastrado para esta fazenda
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Área (ha)</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Matrícula</TableHead>
          <TableHead>Lote</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {talhoes.map((talhao) => (
          <TableRow key={talhao.id}>
            <TableCell className="font-medium">{talhao.nome}</TableCell>
            <TableCell>{talhao.area}</TableCell>
            <TableCell>{talhao.cidade}</TableCell>
            <TableCell>{talhao.estado}</TableCell>
            <TableCell>{talhao.matricula}</TableCell>
            <TableCell>{talhao.lote}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(talhao.status)}`}>
                {talhao.status}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditTalhao(talhao)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteTalhao(talhao.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
