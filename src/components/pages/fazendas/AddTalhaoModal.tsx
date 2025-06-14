
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Fazenda, Talhao } from "../FazendasPage";
import { TalhaoForm } from "./TalhaoForm";
import { useTalhoesModal } from "./useTalhoesModal";

interface AddTalhaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fazenda: Fazenda | null;
  talhaoForm: Talhao;
  setTalhaoForm: (talhao: Talhao) => void;
  onAddTalhao: (fazendaId: string) => void;
}

export const AddTalhaoModal = ({
  open,
  onOpenChange,
  fazenda,
  talhaoForm,
  setTalhaoForm,
  onAddTalhao
}: AddTalhaoModalProps) => {
  const {
    editingTalhao,
    handleAddTalhao
  } = useTalhoesModal(onAddTalhao, talhaoForm, setTalhaoForm, true);

  if (!fazenda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Adicionar Talhão - {fazenda.nome}
          </DialogTitle>
        </DialogHeader>

        <TalhaoForm
          talhaoForm={talhaoForm}
          setTalhaoForm={setTalhaoForm}
          editingTalhao={editingTalhao}
          onSubmit={(e) => handleAddTalhao(e, fazenda.id)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
