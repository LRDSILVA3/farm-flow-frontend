
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Farm, Plot } from "@/types/farm";
import { PlotForm } from "./PlotForm";
import { PlotsTable } from "./PlotsTable";
import { usePlotsModal } from "./usePlotModal";

interface PlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: Farm | null;
  plotForm: Plot;
  setPlotForm: (plot: Plot) => void;
  onAddPlot: (farmId: string) => void;
  onDeletePlot: (farmId: string, plotId: string) => void;
}

export const PlotsModal = ({
  open,
  onOpenChange,
  farm,
  plotForm,
  setPlotForm,
  onAddPlot,
  onDeletePlot
}: PlotsModalProps) => {
  const {
    showPlotForm,
    editingPlot,
    handleAddPlot,
    handleEditPlot,
    handleOpenNewPlot,
    handleCancel
  } = usePlotsModal(onAddPlot, plotForm, setPlotForm);

  if (!farm) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Talhões de {farm.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Lista e gerenciamento de talhões da fazenda {farm.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {farm.plots.length} talhão{farm.plots.length !== 1 ? 'es' : ''} cadastrado{farm.plots.length !== 1 ? 's' : ''}
              </p>
              <Button
                onClick={handleOpenNewPlot}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Talhão
              </Button>
            </div>

            <PlotsTable
              plots={farm.plots}
              onEditPlot={handleEditPlot}
              onDeletePlot={(plotId) => onDeletePlot(farm.id, plotId)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlotForm} onOpenChange={(isOpen) => { if (!isOpen) handleCancel(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlot ? `Editar Talhão - ${farm.name}` : `Adicionar Novo Talhão - ${farm.name}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingPlot ? "Formulário de edição de talhão" : "Formulário para adicionar talhão à fazenda"}
            </DialogDescription>
          </DialogHeader>
          <PlotForm
            plotForm={plotForm}
            setPlotForm={setPlotForm}
            editingPlot={editingPlot}
            onSubmit={(e) => handleAddPlot(e, farm.id)}
            onCancel={handleCancel}
            hideHeader
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
