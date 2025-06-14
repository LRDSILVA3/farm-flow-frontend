
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, ChevronDown, ChevronRight } from "lucide-react";
import { Fazenda } from "../FazendasPage";
import { TalhoesSection } from "./TalhoesSection";

interface FazendasTableProps {
  fazendas: Fazenda[];
  currentPage: number;
  itemsPerPage: number;
  expandedFazendas: Set<string>;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onEdit: (fazenda: Fazenda) => void;
  onToggleExpand: (fazendaId: string) => void;
  onAddTalhao: (fazendaId: string) => void;
  onDeleteTalhao: (fazendaId: string, talhaoId: string) => void;
}

export const FazendasTable = ({
  fazendas,
  currentPage,
  itemsPerPage,
  expandedFazendas,
  onPageChange,
  onItemsPerPageChange,
  onEdit,
  onToggleExpand,
  onAddTalhao,
  onDeleteTalhao
}: FazendasTableProps) => {
  const totalItems = fazendas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFazendas = fazendas.slice(startIndex, endIndex);

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
            <TableHead className="w-12"></TableHead>
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
          {currentFazendas.map((fazenda) => (
            <>
              <TableRow key={fazenda.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpand(fazenda.id)}
                  >
                    {expandedFazendas.has(fazenda.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{fazenda.nome}</TableCell>
                <TableCell>{fazenda.proprietario}</TableCell>
                <TableCell>{fazenda.area}</TableCell>
                <TableCell>{fazenda.localizacao}</TableCell>
                <TableCell>{fazenda.contato}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(fazenda.status)}`}>
                    {fazenda.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {fazenda.talhoes.length} talhão{fazenda.talhoes.length !== 1 ? 'es' : ''}
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(fazenda)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              {expandedFazendas.has(fazenda.id) && (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <TalhoesSection
                      fazenda={fazenda}
                      onAddTalhao={() => onAddTalhao(fazenda.id)}
                      onDeleteTalhao={(talhaoId) => onDeleteTalhao(fazenda.id, talhaoId)}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
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
