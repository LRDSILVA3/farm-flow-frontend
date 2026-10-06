import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plot } from "@/types/farm";
import { AlertCircle } from "lucide-react";

interface PlotFormProps {
  plotForm: Plot;
  setPlotForm: (plot: Plot) => void;
  editingPlot: Plot | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PlotForm = ({
  plotForm,
  setPlotForm,
  editingPlot,
  onSubmit,
  onCancel
}: PlotFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [haInput, setHaInput] = useState<string>(() => {
    if (plotForm.area === undefined || plotForm.area === null || plotForm.area === "") return "";
    const num = parseFloat(plotForm.area);
    return isNaN(num) ? "" : num === 0 ? "0" : num.toFixed(2);
  });
  const [alqInput, setAlqInput] = useState<string>(() => {
    if (plotForm.area === undefined || plotForm.area === null || plotForm.area === "") return "";
    const num = parseFloat(plotForm.area);
    return isNaN(num) ? "" : num === 0 ? "0" : (num / 2.42).toFixed(2);
  });

  useEffect(() => {
    if (plotForm.area !== undefined && plotForm.area !== null && plotForm.area !== "") {
      const num = parseFloat(plotForm.area);
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
  }, [plotForm.id, plotForm.area]);

  const handleHaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHaInput(val);
    if (errors.area) setErrors(prev => ({ ...prev, area: "" }));

    if (val === "") {
      setAlqInput("");
      setPlotForm({ ...plotForm, area: "" });
      return;
    }

    const numHa = parseFloat(val);
    if (!isNaN(numHa)) {
      setAlqInput(numHa > 0 ? Number((numHa / 2.42).toFixed(2)).toString() : "0");
      setPlotForm({ ...plotForm, area: val });
    }
  };

  const handleHaBlur = () => {
    const numHa = parseFloat(haInput);
    if (!isNaN(numHa) && numHa > 0) {
      const formattedHa = numHa.toFixed(2);
      const formattedAlq = (numHa / 2.42).toFixed(2);
      setHaInput(formattedHa);
      setAlqInput(formattedAlq);
      setPlotForm({ ...plotForm, area: formattedHa });
    }
  };

  const handleAlqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAlqInput(val);

    if (val === "") {
      setHaInput("");
      setPlotForm({ ...plotForm, area: "" });
      return;
    }

    const numAlq = parseFloat(val);
    if (!isNaN(numAlq)) {
      const calculatedHa = Number((numAlq * 2.42).toFixed(2));
      setHaInput(calculatedHa.toFixed(2));
      setPlotForm({ ...plotForm, area: calculatedHa.toFixed(2) });
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
      setPlotForm({ ...plotForm, area: calculatedHa });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!plotForm.name?.trim()) {
      newErrors.name = "Nome do talhão é obrigatório";
    }
    const numArea = parseFloat(plotForm.area || "0");
    if (!plotForm.area || isNaN(numArea) || numArea <= 0) {
      newErrors.area = "Informe uma área válida em hectares ou alqueires";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Garante rigorosamente 2 casas decimais ao salvar
    setPlotForm({ ...plotForm, area: numArea.toFixed(2) });
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-gray-50 p-4 rounded-lg border space-y-4">
      <h5 className="font-semibold text-base">
        {editingPlot ? "Editar Talhão" : "Adicionar Novo Talhão"}
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plotName">Nome do Talhão</Label>
          <Input
            id="plotName"
            value={plotForm.name}
            onChange={(e) => {
              setPlotForm({ ...plotForm, name: e.target.value });
              if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
            }}
            placeholder="Ex: Talhão 01 - Sede"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="plotArea">Área Total (ha)</Label>
            <Input
              id="plotArea"
              type="number"
              step="0.01"
              value={haInput}
              onChange={handleHaChange}
              onBlur={handleHaBlur}
              placeholder="0.00"
              className={errors.area ? "border-red-500" : ""}
            />
            {errors.area && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.area}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="plotAreaAlq">Área Total (alq)</Label>
            <Input
              id="plotAreaAlq"
              type="number"
              step="0.01"
              value={alqInput}
              onChange={handleAlqChange}
              onBlur={handleAlqBlur}
              placeholder="0.00"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              1 alq = 2,42 ha
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="plotCity">Cidade</Label>
          <Input
            id="plotCity"
            value={plotForm.city || ""}
            onChange={(e) => setPlotForm({ ...plotForm, city: e.target.value })}
            placeholder="Cidade"
          />
        </div>

        <div>
          <Label htmlFor="plotState">Estado</Label>
          <Input
            id="plotState"
            value={plotForm.state || ""}
            onChange={(e) => setPlotForm({ ...plotForm, state: e.target.value })}
            placeholder="UF"
          />
        </div>

        {/* Ordem Padronizada: LOTE primeiro, depois MATRÍCULA (Ambos Opcionais) */}
        <div>
          <Label htmlFor="plotLot">Lote</Label>
          <Input
            id="plotLot"
            value={plotForm.lot || ""}
            onChange={(e) => setPlotForm({ ...plotForm, lot: e.target.value })}
            placeholder="Ex: Lote 04 (Opcional)"
          />
        </div>

        <div>
          <Label htmlFor="plotRegistration">Matrícula</Label>
          <Input
            id="plotRegistration"
            value={plotForm.registration || ""}
            onChange={(e) => setPlotForm({ ...plotForm, registration: e.target.value })}
            placeholder="Ex: 56.789 (Opcional)"
          />
        </div>

        <div>
          <Label htmlFor="plotStatus">Status</Label>
          <Select value={plotForm.status} onValueChange={(value) => setPlotForm({ ...plotForm, status: value })}>
            <SelectTrigger id="plotStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {editingPlot ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
};
