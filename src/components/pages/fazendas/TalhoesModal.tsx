
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Fazenda, Talhao } from "../FazendasPage";
import { TalhaoForm } from "./TalhaoForm";
import { TalhoesTable } from "./TalhoesTable";
import { useTalhoesModal } from "./useTalhoesModal";

interface TalhoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fazenda: Fazenda | null;
  talhaoForm: Talhao;
  setTalhaoForm: (talhao: Talhao) => void;
  onAddTalhao: (fazendaId: string) => void;
  onDeleteTalhao: (fazendaId: string, talhaoId: string) => void;
  formOnly?: boolean;
}

export const TalhoesModal = ({
  open,
  onOpenChange,
  fazenda,
  talhaoForm,
  setTalhaoForm,
  onAddTalhao,
  onDeleteTalhao,
  formOnly = false
}: TalhoesModalProps) => {
  const {
    showTalhaoForm,
    setShowTalhaoForm,
    editingTalhao,
    handleAddTalhao,
    handleEditTalhao,
    handleCancel
  } = useTalhoesModal(onAddTalhao, talhaoForm, setTalhaoForm, formOnly);

  if (!fazenda) return null;

  // Se é modo form-only, mostra APENAS o formulário
  if (formOnly) {
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
  }

  // Modo normal - mostra listagem e formulário opcional
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            Talhões de {fazenda.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {fazenda.talhoes.length} talhão{fazenda.talhoes.length !== 1 ? 'es' : ''} cadastrado{fazenda.talhoes.length !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={() => setShowTalhaoForm(!showTalhaoForm)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Talhão
            </Button>
          </div>

          {showTalhaoForm && (
            <TalhaoForm
              talhaoForm={talhaoForm}
              setTalhaoForm={setTalhaoForm}
              editingTalhao={editingTalhao}
              onSubmit={(e) => handleAddTalhao(e, fazenda.id)}
              onCancel={handleCancel}
            />
          )}

          <TalhoesTable
            talhoes={fazenda.talhoes}
            onEditTalhao={handleEditTalhao}
            onDeleteTalhao={(talhaoId) => onDeleteTalhao(fazenda.id, talhaoId)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
