
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Eye } from "lucide-react";
import { Farm } from "@/hooks/useFarms";


interface FarmsTableProps {
  farms: Farm[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onEdit: (farm: Farm) => void;
  onViewPlots: (farm: Farm) => void;
}

export const FarmsTable = ({
  farms,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onViewPlots
}: FarmsTableProps) => {
  const totalItems = farms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFarms = farms.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    onItemsPerPageChange(parseInt(value));
    onPageChange(1);
  };

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

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Fazenda</TableHead>
            <TableHead>Proprietário</TableHead>
            <TableHead>Área (ha)</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Talhões</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentFarms.map((farm) => (
            <TableRow key={farm.id}>
              <TableCell className="font-medium">{farm.name}</TableCell>
              <TableCell>{farm.owner}</TableCell>
              <TableCell>{farm.area}</TableCell>
              <TableCell>{farm.city} - {farm.state}</TableCell>
              <TableCell>{farm.contact}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(farm.status)}`}>
                  {farm.status}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {farm.plots.length}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(farm)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewPlots(farm)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Talhões
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} fazendas
          </span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
        
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};
