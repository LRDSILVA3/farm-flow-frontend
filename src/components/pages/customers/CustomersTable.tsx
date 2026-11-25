
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatCPF, formatPhoneNumber } from "@/lib/utils";
import { Edit, MapPin, FileText, Users } from "lucide-react";
import { Client } from "../../../hooks/useClients";

interface CustomersTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onNavigateToFarms: (cpf: string) => void;
  onViewDossier?: (client: Client) => void;
  canNavigateToFarms?: boolean;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

export const CustomersTable = ({
  clients,
  onEdit,
  onNavigateToFarms,
  onViewDossier,
  canNavigateToFarms = true,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: CustomersTableProps) => {
  const totalItems = clients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = clients.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Estado/Cidade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentClients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Users className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-slate-700">Nenhum cliente encontrado</p>
                  <p className="text-xs text-muted-foreground">Tente ajustar os termos de busca ou cadastre um novo cliente.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            currentClients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {onViewDossier ? (
                  <button
                    type="button"
                    onClick={() => onViewDossier(client)}
                    className="text-left font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                    title="Clique para abrir o Dossiê do Produtor"
                  >
                    {client.name}
                  </button>
                ) : (
                  client.name
                )}
              </TableCell>
              <TableCell>{formatCPF(client.cpf)}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{formatPhoneNumber(client.phone)}</TableCell>
              <TableCell>{client.state}/{client.city}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onViewDossier && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDossier(client)}
                      className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300"
                      title="Abrir Dossiê do Produtor"
                      aria-label="Abrir Dossiê do Produtor"
                    >
                      <FileText className="h-4 w-4 mr-1 text-emerald-600" />
                      <span className="text-xs font-semibold">Dossiê</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(client)}
                    title="Editar cliente"
                    aria-label="Editar cliente"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {canNavigateToFarms && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToFarms(client.cpf)}
                      title="Ver fazendas do cliente"
                      aria-label="Ver fazendas do cliente"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Mostrando {totalItems > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, totalItems)} de {totalItems} clientes
          </span>
          <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
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
