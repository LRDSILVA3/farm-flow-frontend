
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plano } from "./usePlanos";
import { FormEvent } from "react";

interface PlanoModalProps {
  servicos: { id: number; nome: string }[];
  showPlanoForm: boolean;
  setShowPlanoForm: (show: boolean) => void;
  editingPlano: Plano | null;
  planoFormData: Plano;
  handlePlanoSubmit: (e: FormEvent) => void;
  resetPlanoForm: () => void;
  handlePlanoInputChange: (field: keyof Plano, value: string | number | number[]) => void;
  handleServicoToggle: (servicoId: number) => void;
}

export const PlanoModal = ({
  servicos,
  showPlanoForm,
  setShowPlanoForm,
  editingPlano,
  planoFormData,
  handlePlanoSubmit,
  resetPlanoForm,
  handlePlanoInputChange,
  handleServicoToggle
}: PlanoModalProps) => {
  return (
    <Dialog open={showPlanoForm} onOpenChange={setShowPlanoForm}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPlano ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handlePlanoSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Plano</Label>
            <Input
              id="nome"
              value={planoFormData.nome}
              onChange={(e) => handlePlanoInputChange("nome", e.target.value)}
              placeholder="Digite o nome do plano"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={planoFormData.descricao}
              onChange={(e) => handlePlanoInputChange("descricao", e.target.value)}
              placeholder="Digite a descrição do plano"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="recorrencia">Recorrência</Label>
            <Select 
              value={planoFormData.recorrencia} 
              onValueChange={(value: "mensal" | "unico") => handlePlanoInputChange("recorrencia", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="unico">Único</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={planoFormData.valor}
              onChange={(e) => handlePlanoInputChange("valor", Number(e.target.value))}
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={planoFormData.status} 
              onValueChange={(value: "Ativo" | "Inativo") => handlePlanoInputChange("status", value)}
            >
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
            <Label>Serviços Inclusos</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3 mt-2">
              {servicos.map((servico) => (
                <div key={servico.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`servico-${servico.id}`}
                    checked={planoFormData.servicosIds.includes(servico.id)}
                    onCheckedChange={() => handleServicoToggle(servico.id)}
                  />
                  <Label 
                    htmlFor={`servico-${servico.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {servico.nome}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selecione os serviços que fazem parte deste plano
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={resetPlanoForm}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingPlano ? "Atualizar" : "Criar"} Plano
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
