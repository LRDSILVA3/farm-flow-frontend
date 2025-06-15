
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Servico } from "./useServicos";

interface ServicosTabProps {
  currentServicos: Servico[];
  servicosStartIndex: number;
  servicosEndIndex: number;
  totalServicos: number;
  servicosPerPage: number;
  setServicosPerPage: (value: number) => void;
  servicosPage: number;
  setServicosPage: (value: number) => void;
  totalServicosPages: number;
  setShowServicoForm: (value: boolean) => void;
  handleEditServico: (servico: Servico) => void;
}

export const ServicosTab: React.FC<ServicosTabProps> = ({
  currentServicos,
  servicosStartIndex,
  servicosEndIndex,
  totalServicos,
  servicosPerPage,
  setServicosPerPage,
  servicosPage,
  setServicosPage,
  totalServicosPages,
  setShowServicoForm,
  handleEditServico
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Serviços</CardTitle>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowServicoForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Valor por Alqueire</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentServicos.map((servico) => (
                <TableRow key={servico.id}>
                  <TableCell className="font-medium">{servico.nome}</TableCell>
                  <TableCell>R$ {servico.valorAlqueire}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {servico.status}
                    </span>
                  </TableCell>
                  <TableCell>{servico.produtos}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditServico(servico)}
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
                Mostrando {servicosStartIndex + 1} a {Math.min(servicosEndIndex, totalServicos)} de {totalServicos} serviços
              </span>
              <Select value={servicosPerPage.toString()} onValueChange={(value) => {
                setServicosPerPage(Number(value));
                setServicosPage(1);
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
            
            {totalServicosPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setServicosPage(Math.max(1, servicosPage - 1))}
                      className={servicosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalServicosPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setServicosPage(page)}
                        isActive={servicosPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setServicosPage(Math.min(totalServicosPages, servicosPage + 1))}
                      className={servicosPage === totalServicosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
