import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IMaskInput } from "react-imask";
import { Trash2, Plus, AlertCircle } from "lucide-react";

import { useState, useEffect } from "react";
import { CustomerSelect } from "./CustomerSelect";
import { CityStateSelect } from "./CityStateSelect";
import { Farm } from "@/types/farm";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [haInput, setHaInput] = useState<string>(() => {
    if (formData.area === undefined || formData.area === null || formData.area === "") return "";
    const num = parseFloat(formData.area);
    return isNaN(num) ? "" : num === 0 ? "0" : num.toFixed(2);
  });
  const [alqInput, setAlqInput] = useState<string>(() => {
    if (formData.area === undefined || formData.area === null || formData.area === "") return "";
    const num = parseFloat(formData.area);
    return isNaN(num) ? "" : num === 0 ? "0" : (num / 2.42).toFixed(2);
  });

  // Sincroniza os inputs ao abrir o modal ou carregar fazenda para edição
  useEffect(() => {
    if (formData.area !== undefined && formData.area !== null && formData.area !== "") {
      const num = parseFloat(formData.area);
      if (!isNaN(num)) {
        setHaInput(num === 0 ? "0" : num.toFixed(2));
        setAlqInput(num === 0 ? "0" : (num / 2.42).toFixed(2));
      } else {
        setHaInput("");
        setAlqInput("");
      }
    } else {
      setHaInput("");
      setAlqInput("");
    }
  }, [formData.id, formData.area, open]);

  const handleHaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHaInput(val);
    if (errors.area) setErrors(prev => ({ ...prev, area: "" }));

    if (val === "") {
      setAlqInput("");
      onInputChange("area", "");
      return;
    }

    const numHa = parseFloat(val);
    if (!isNaN(numHa)) {
      setAlqInput(numHa > 0 ? Number((numHa / 2.42).toFixed(2)).toString() : "0");
      onInputChange("area", val);
    }
  };

  const handleHaBlur = () => {
    const numHa = parseFloat(haInput);
    if (!isNaN(numHa) && numHa > 0) {
      const formattedHa = numHa.toFixed(2);
      const formattedAlq = (numHa / 2.42).toFixed(2);
      setHaInput(formattedHa);
      setAlqInput(formattedAlq);
      onInputChange("area", formattedHa);
    }
  };

  const handleAlqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAlqInput(val);

    if (val === "") {
      setHaInput("");
      onInputChange("area", "");
      return;
    }

    const numAlq = parseFloat(val);
    if (!isNaN(numAlq)) {
      const calculatedHa = Number((numAlq * 2.42).toFixed(2));
      setHaInput(calculatedHa.toFixed(2));
      onInputChange("area", calculatedHa.toFixed(2));
      if (errors.area) setErrors(prev => ({ ...prev, area: "" }));
    }
  };

  const handleAlqBlur = () => {
    const numAlq = parseFloat(alqInput);
    if (!isNaN(numAlq) && numAlq > 0) {
      const formattedAlq = numAlq.toFixed(2);
      const calculatedHa = (numAlq * 2.42).toFixed(2);
      setAlqInput(formattedAlq);
      setHaInput(calculatedHa);
      onInputChange("area", calculatedHa);
    }
  };

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
    if (!onAddPlot) return;
    const farmId = editingFarm ? editingFarm.id : formData.id || 'temp';
    onAddPlot(farmId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Nome da fazenda é obrigatório";
    }
    if (!formData.clientId) {
      newErrors.clientId = "Selecione o proprietário";
    }
    const numArea = parseFloat(formData.area || "0");
    if (!formData.area || isNaN(numArea) || numArea <= 0) {
      newErrors.area = "Informe uma área válida em hectares ou alqueires";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Garante rigorosamente 2 dígitos após a vírgula ao salvar
    onInputChange("area", numArea.toFixed(2));

    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingFarm ? "Editar Fazenda" : "Nova Fazenda"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4" role="form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Fazenda</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  onInputChange("name", e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                }}
                placeholder="Ex: Fazenda Santa Maria"
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="owner">Proprietário</Label>
              <CustomerSelect
                value={formData.clientId}
                onValueChange={(value) => {
                  const selectedCustomer = customers.find(cust => cust.id === value);
                  if (selectedCustomer) {
                    onInputChange("clientId", selectedCustomer.id);
                    onInputChange("clientName", selectedCustomer.name);
                    if (errors.clientId) setErrors(prev => ({ ...prev, clientId: "" }));
                  }
                }}
                customers={customers}
              />
              {errors.clientId && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.clientId}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="area">Área Total (ha)</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                value={haInput}
                onChange={handleHaChange}
                onBlur={handleHaBlur}
                placeholder="0.00"
                className={errors.area ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.area && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.area}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="areaAlq">Área Total (alq)</Label>
              <Input
                id="areaAlq"
                type="number"
                step="0.01"
                value={alqInput}
                onChange={handleAlqChange}
                onBlur={handleAlqBlur}
                placeholder="0.00"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                1 alq paulista = 2,42 ha
              </p>
            </div>

            <div>
              <Label htmlFor="contact">Contato (Opcional)</Label>
              <IMaskInput
                mask="(00) 00000-0000"
                id="contact"
                value={formData.contact}
                onAccept={(value) => onInputChange("contact", value as string)}
                placeholder="(00) 00000-0000"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CityStateSelect
              city={formData.city}
              state={formData.state}
              onCityChange={(value) => onInputChange("city", value)}
              onStateChange={(value) => onInputChange("state", value)}
            />
          </div>

          {/* Ordem Padronizada: Status, LOTE primeiro, depois MATRÍCULA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onInputChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lot">Lote (Opcional)</Label>
              <Input
                id="lot"
                value={formData.lot || ""}
                onChange={(e) => onInputChange("lot", e.target.value)}
                placeholder="Ex: Lote 14-B"
              />
            </div>
            <div>
              <Label htmlFor="registration">Matrícula (Opcional)</Label>
              <Input
                id="registration"
                value={formData.registration || ""}
                onChange={(e) => onInputChange("registration", e.target.value)}
                placeholder="Ex: 12.345"
              />
            </div>
          </div>

          {editingFarm && (
            <div className="mt-6 border-t pt-4">
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
              
              {formData.plots && formData.plots.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.plots.map((plot) => (
                      <TableRow key={plot.id}>
                        <TableCell className="font-medium">{plot.name}</TableCell>
                        <TableCell>
                          <span>{parseFloat(plot.area || "0").toFixed(2)} ha</span>{" "}
                          <span className="text-xs text-muted-foreground font-normal">
                            ({((parseFloat(plot.area || "0") || 0) / 2.42).toFixed(2)} alq)
                          </span>
                        </TableCell>
                        <TableCell>{plot.city || "-"}</TableCell>
                        <TableCell>{plot.state || "-"}</TableCell>
                        <TableCell>{plot.lot || "-"}</TableCell>
                        <TableCell>{plot.registration || "-"}</TableCell>
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
                <p className="text-gray-500 text-center py-6 text-sm">
                  Nenhum talhão cadastrado para esta fazenda
                </p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
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
