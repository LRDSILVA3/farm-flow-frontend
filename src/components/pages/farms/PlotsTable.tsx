
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Plot } from "@/types/farm";

interface PlotsTableProps {
  plots: Plot[];
  onEditPlot: (plot: Plot) => void;
  onDeletePlot: (plotId: string) => void;
}

export const PlotsTable = ({ plots, onEditPlot, onDeletePlot }: PlotsTableProps) => {
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

  if (plots.length === 0) {
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
        {plots.map((plot) => (
          <TableRow key={plot.id}>
            <TableCell className="font-medium">{plot.name}</TableCell>
            <TableCell>{plot.area}</TableCell>
            <TableCell>{plot.city}</TableCell>
            <TableCell>{plot.state}</TableCell>
            <TableCell>{plot.registration}</TableCell>
            <TableCell>{plot.lot}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(plot.status)}`}>
                {plot.status}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditPlot(plot)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeletePlot(plot.id)}
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
