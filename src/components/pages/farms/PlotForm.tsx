
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plot } from "@/types/farm";

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
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-4 rounded-lg border">
      <h5 className="font-medium mb-4">
        {editingPlot ? "Editar Talhão" : "Adicionar Novo Talhão"}
      </h5>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plotName">Nome do Talhão</Label>
          <Input
            id="plotName"
            value={plotForm.name}
            onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="plotArea">Área (ha)</Label>
          <Input
            id="plotArea"
            type="number"
            step="0.1"
            value={plotForm.area}
            onChange={(e) => setPlotForm({ ...plotForm, area: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="plotCity">Cidade</Label>
          <Input
            id="plotCity"
            value={plotForm.city}
            onChange={(e) => setPlotForm({ ...plotForm, city: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="plotState">Estado</Label>
          <Input
            id="plotState"
            value={plotForm.state}
            onChange={(e) => setPlotForm({ ...plotForm, state: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="plotRegistration">Matrícula</Label>
          <Input
            id="plotRegistration"
            value={plotForm.registration}
            onChange={(e) => setPlotForm({ ...plotForm, registration: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="plotLot">Lote</Label>
          <Input
            id="plotLot"
            value={plotForm.lot}
            onChange={(e) => setPlotForm({ ...plotForm, lot: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="plotStatus">Status</Label>
          <Select value={plotForm.status} onValueChange={(value) => setPlotForm({ ...plotForm, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
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
