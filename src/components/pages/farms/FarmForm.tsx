
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IMaskInput } from "react-imask";
import { Trash2, Plus } from "lucide-react";

import { useState, useEffect } from "react";
import { CustomerSelect } from "./CustomerSelect";
import { CityStateSelect } from "./CityStateSelect";
import { Farm } from "@/hooks/useFarms";
import { useClients, Client } from "@/hooks/useClients";

interface FarmFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFarm: Farm | null;
  formData: Farm;
  onInputChange: (field: keyof Farm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDeletePlot?: (farmId: string, plotId: string) => void;
  onAddPlot?: (farmId: string) => void;
}

export const FarmForm = ({
  open,
  onOpenChange,
  editingFarm,
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  onDeletePlot,
  onAddPlot
}: FarmFormProps) => {
  const { clients, loading: clientsLoading } = useClients();
  const [customers, setCustomers] = useState<Client[]>([]);

  useEffect(() => {
    if (!clientsLoading) {
      setCustomers(clients);
    }
  }, [clients, clientsLoading]);

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

  const handleAddPlotClick = () => {
    if (!onAddPlot) {
      return;
    }
    const farmId = editingFarm ? editingFarm.id : formData.id || 'temp';
    onAddPlot(farmId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingFarm ? "Editar Fazenda" : "Nova Fazenda"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" role="form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Fazenda</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="owner">Proprietário</Label>
              <CustomerSelect
                value={formData.owner}
                onValueChange={(value) => onInputChange("owner", value)}
                customers={customers}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Área Total (ha)</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => onInputChange("area", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact">Contato</Label>
              <IMaskInput
                mask="(00) 00000-0000"
                id="contact"
                value={formData.contact}
                onAccept={(value) => onInputChange("contact", value as string)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <CityStateSelect
              city={formData.city}
              state={formData.state}
              onCityChange={(value) => onInputChange("city", value)}
              onStateChange={(value) => onInputChange("state", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lot">Lote</Label>
              <Input
                id="lot"
                value={formData.lot}
                onChange={(e) => onInputChange("lot", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="registration">Matrícula</Label>
            <Input
              id="registration"
              value={formData.registration}
              onChange={(e) => onInputChange("registration", e.target.value)}
              required
            />
          </div>

          {editingFarm && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Talhões da Fazenda</h4>
                <Button
                  type="button"
                  onClick={handleAddPlotClick}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Talhão
                </Button>
              </div>
              
              {formData.plots.length > 0 ? (
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
                    {formData.plots.map((plot) => (
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
                          {onDeletePlot && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onDeletePlot(formData.id, plot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum talhão cadastrado para esta fazenda
                </p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingFarm ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
