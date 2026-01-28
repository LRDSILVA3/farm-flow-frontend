
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
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
  equipmentStartIndex,
  equipmentEndIndex,
  totalEquipment,
  equipmentPerPage,
  setEquipmentPerPage,
  equipmentPage,
  setEquipmentPage,
  totalEquipmentPages,
  setShowEquipmentForm,
  handleEditEquipment,
  handleDeleteEquipment
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Equipamentos</CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "Disponível" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
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
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Mostrando {equipmentStartIndex + 1} a {Math.min(equipmentEndIndex, totalEquipment)} de {totalEquipment} equipamentos
                </span>
                <Select value={equipmentPerPage.toString()} onValueChange={(value) => {
                  setEquipmentPerPage(Number(value));
                  setEquipmentPage(1);
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
              
              {totalEquipmentPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setEquipmentPage(Math.max(1, equipmentPage - 1))}
                        className={equipmentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalEquipmentPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setEquipmentPage(page)}
                          isActive={equipmentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setEquipmentPage(Math.min(totalEquipmentPages, equipmentPage + 1))}
                        className={equipmentPage === totalEquipmentPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
