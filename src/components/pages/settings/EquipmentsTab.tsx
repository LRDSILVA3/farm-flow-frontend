import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Truck, Wrench, Package, Search, X, RotateCcw, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Equipment } from "../../../hooks/useEquipment";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

interface EquipmentsTabProps {
  equipment: Equipment[];
  equipmentStartIndex: number;
  equipmentEndIndex: number;
  totalEquipment: number;
  equipmentPerPage: number;
  setEquipmentPerPage: (value: number) => void;
  equipmentPage: number;
  setEquipmentPage: (value: number) => void;
  totalEquipmentPages: number;
  setShowEquipmentForm: (value: boolean) => void;
  handleEditEquipment: (equipment: Equipment) => void;
  handleDeleteEquipment: (id: string) => void;
}

export const EquipmentsTab: React.FC<EquipmentsTabProps> = ({
  equipment,
  equipmentPerPage,
  setEquipmentPerPage,
  equipmentPage,
  setEquipmentPage,
  setShowEquipmentForm,
  handleEditEquipment,
  handleDeleteEquipment
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        item.name.toLowerCase().includes(term) ||
        (item.model && item.model.toLowerCase().includes(term)) ||
        (item.plate && item.plate.toLowerCase().includes(term)) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(term));

      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [equipment, searchTerm, typeFilter, statusFilter]);

  const totalFiltered = filteredEquipment.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / (equipmentPerPage || 10)));
  const currentPage = Math.min(equipmentPage, totalPages);
  const startIndex = (currentPage - 1) * (equipmentPerPage || 10);
  const endIndex = Math.min(startIndex + (equipmentPerPage || 10), totalFiltered);
  const displayedEquipment = filteredEquipment.slice(startIndex, endIndex);

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setEquipmentPage(1);
  };

  const openDeleteDialog = (id: string) => {
    setEquipmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (equipmentToDelete) {
      handleDeleteEquipment(equipmentToDelete);
      setEquipmentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Equipamentos</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Veículos, quadriciclos, ferramentas e maquinários operacionais
            </p>
          </div>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowEquipmentForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Equipamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg border">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, modelo, placa ou serial..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setEquipmentPage(1);
                    }}
                    className="pl-8 pr-8 h-9 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setEquipmentPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select 
                  value={typeFilter} 
                  onValueChange={(val) => {
                    setTypeFilter(val);
                    setEquipmentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Veículo">Veículo</SelectItem>
                    <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={statusFilter} 
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setEquipmentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Em Uso">Em Uso</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpar
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground self-center">
                {totalFiltered} {totalFiltered === 1 ? 'equipamento' : 'equipamentos'}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Placa / Nº de Série</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedEquipment.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">Nenhum equipamento encontrado</p>
                          <p className="text-xs text-muted-foreground">
                            {hasActiveFilters 
                              ? "Tente ajustar os filtros ou termo de busca." 
                              : "Nenhum equipamento cadastrado no sistema."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedEquipment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{item.name}</div>
                          {item.model && <div className="text-xs text-muted-foreground">{item.model}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs font-normal gap-1 ${
                            item.type === "Veículo" ? "bg-blue-50 text-blue-800 border-blue-200" :
                            item.type === "Ferramenta" ? "bg-purple-50 text-purple-800 border-purple-200" :
                            "bg-slate-50 text-slate-800 border-slate-200"
                          }`}>
                            {item.type === "Veículo" && <Truck className="h-3 w-3" />}
                            {item.type === "Ferramenta" && <Wrench className="h-3 w-3" />}
                            {item.type === "Outro" && <Package className="h-3 w-3" />}
                            {item.type || "Geral"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.plate ? (
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded font-bold">
                              {item.plate}
                            </code>
                          ) : item.serialNumber ? (
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                              S/N: {item.serialNumber}
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "Disponível" 
                              ? "bg-green-100 text-green-800" 
                              : item.status === "Em Uso"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditEquipment(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDeleteDialog(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {totalFiltered > 0 ? startIndex + 1 : 0} a {endIndex} de {totalFiltered} equipamentos
                </span>
                <Select 
                  value={(equipmentPerPage || 10).toString()} 
                  onValueChange={(value) => {
                    setEquipmentPerPage(Number(value));
                    setEquipmentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">por página</span>
              </div>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setEquipmentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setEquipmentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setEquipmentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir equipamento"
        description="Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita."
      />
    </>
  );
};
