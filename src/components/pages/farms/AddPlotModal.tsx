
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Farm, Plot } from "@/types/farm";
import { PlotForm } from "./PlotForm";
import { usePlotsModal } from "./usePlotModal";

interface AddPlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: Farm | null;
  plotForm: Plot;
  setPlotForm: (plot: Plot) => void;
  onAddPlot: (farmId: string) => void;
}

export const AddPlotModal = ({
  open,
  onOpenChange,
  farm,
  plotForm,
  setPlotForm,
  onAddPlot
}: AddPlotModalProps) => {
  const {
    editingPlot,
    handleAddPlot
  } = usePlotsModal(onAddPlot, plotForm, setPlotForm, true);

  if (!farm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Adicionar Talhão - {farm.name}
          </DialogTitle>
        </DialogHeader>

        <PlotForm
          plotForm={plotForm}
          setPlotForm={setPlotForm}
          editingPlot={editingPlot}
          onSubmit={(e) => handleAddPlot(e, farm.id)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
