
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Plano } from "./usePlanos";

interface PlanosTabProps {
  planos: Plano[];
  servicos: { id: number; nome: string }[];
  currentPlanos: Plano[];
  planosStartIndex: number;
  planosEndIndex: number;
  totalPlanos: number;
  planosPerPage: number;
  setPlanosPerPage: (value: number) => void;
  planosPage: number;
  setPlanosPage: (value: number) => void;
  totalPlanosPages: number;
  handleEditPlano: (plano: Plano) => void;
  setShowPlanoForm: (show: boolean) => void;
}

export const PlanosTab = ({
  servicos,
  currentPlanos,
  planosStartIndex,
  planosEndIndex,
  totalPlanos,
  planosPerPage,
  setPlanosPerPage,
  planosPage,
  setPlanosPage,
  totalPlanosPages,
  handleEditPlano,
  setShowPlanoForm
}: PlanosTabProps) => {
  const getServicosNames = (servicosIds: number[]) => {
    return servicos
      .filter(servico => servicosIds.includes(servico.id))
      .map(servico => servico.nome);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Planos do App</CardTitle>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowPlanoForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPlanos.map((plano) => (
                <TableRow key={plano.id}>
                  <TableCell className="font-medium">{plano.nome}</TableCell>
                  <TableCell className="max-w-xs truncate">{plano.descricao}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plano.recorrencia === "mensal" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {plano.recorrencia === "mensal" ? "Mensal" : "Único"}
                    </span>
                  </TableCell>
                  <TableCell>R$ {plano.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plano.status === "Ativo" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {plano.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getServicosNames(plano.servicosIds).slice(0, 2).map((nome) => (
                        <span key={nome} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {nome}
                        </span>
                      ))}
                      {plano.servicosIds.length > 2 && (
                        <span className="text-xs text-gray-500">+{plano.servicosIds.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{plano.dataCriacao}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlano(plano)}
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
                Mostrando {planosStartIndex + 1} a {Math.min(planosEndIndex, totalPlanos)} de {totalPlanos} planos
              </span>
              <Select value={planosPerPage.toString()} onValueChange={(value) => {
                setPlanosPerPage(Number(value));
                setPlanosPage(1);
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
            
            {totalPlanosPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPlanosPage(Math.max(1, planosPage - 1))}
                      className={planosPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPlanosPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setPlanosPage(page)}
                        isActive={planosPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPlanosPage(Math.min(totalPlanosPages, planosPage + 1))}
                      className={planosPage === totalPlanosPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
