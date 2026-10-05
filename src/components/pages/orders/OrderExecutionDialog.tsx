import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/hooks/useOrders';
import { Play, CheckCircle2, History, Users, Wrench, X } from 'lucide-react';
import { api } from '@/services/api';

interface OrderExecutionDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordExecution: (orderId: string, execution: {
    areaExecuted: number;
    notes?: string;
    collaboratorName?: string;
    collaborators?: string[];
    equipmentNames?: string[];
  }) => Promise<void>;
}

export const OrderExecutionDialog: React.FC<OrderExecutionDialogProps> = ({
  order,
  open,
  onOpenChange,
  onRecordExecution,
}) => {
  const [executionType, setExecutionType] = useState<'total' | 'partial'>('total');
  const [partialArea, setPartialArea] = useState<string>('');
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [collaboratorsList, setCollaboratorsList] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string; type?: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open]);

  const fetchOptions = async () => {
    try {
      const [collabs, equips] = await Promise.all([
        api.get<any[]>('/collaborators').catch(() => []),
        api.get<any[]>('/equipment').catch(() => [])
      ]);
      if (Array.isArray(collabs)) setCollaboratorsList(collabs);
      if (Array.isArray(equips)) setEquipmentList(equips);
    } catch {}
  };

  if (!order) return null;

  const totalArea = parseFloat(order.area) || 0;
  const executedArea = order.executedArea || 0;
  const remainingArea = Math.max(0, totalArea - executedArea);
  const percentExecuted = totalArea > 0 ? (executedArea / totalArea) * 100 : 0;

  const toggleCollaborator = (name: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const toggleEquipment = (name: string) => {
    setSelectedEquipment(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  const handleConfirm = async () => {
    let areaToExecute = 0;
    if (executionType === 'total') {
      areaToExecute = remainingArea;
    } else {
      areaToExecute = parseFloat(partialArea) || 0;
    }

    if (areaToExecute <= 0) return;

    setSubmitting(true);
    try {
      await onRecordExecution(order.id, {
        areaExecuted: areaToExecute,
        collaborators: selectedCollaborators,
        collaboratorName: selectedCollaborators.join(', ') || undefined,
        equipmentNames: selectedEquipment,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      // Reset
      setPartialArea('');
      setNotes('');
      setSelectedCollaborators([]);
      setSelectedEquipment([]);
      setExecutionType('total');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Play className="h-5 w-5 text-primary" />
            Registrar Execução do Serviço
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="p-3 border rounded-md bg-muted/30 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente / Fazenda:</span>
              <span className="font-semibold">{order.client?.name || order.clientId} • {order.farm?.name || order.farmId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-semibold">{order.serviceName || order.type}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-muted-foreground">Área Total Contratada:</span>
              <strong>{totalArea.toFixed(1)} ha</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Área Já Executada:</span>
              <strong className="text-primary">{executedArea.toFixed(1)} ha ({percentExecuted.toFixed(1)}%)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo Restante a Executar:</span>
              <strong className="text-amber-600">{remainingArea.toFixed(1)} ha</strong>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mt-1">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: Math.min(100, percentExecuted) + '%' }}
              />
            </div>
          </div>

          {remainingArea <= 0 ? (
            <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Este serviço já foi 100% executado e concluído!
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="font-semibold text-xs">Tipo de Execução nesta Etapa:</Label>
              <RadioGroup
                value={executionType}
                onValueChange={(v) => setExecutionType(v as 'total' | 'partial')}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 border rounded p-2.5 cursor-pointer hover:bg-muted/20">
                  <RadioGroupItem value="total" id="exec-total" />
                  <Label htmlFor="exec-total" className="text-xs cursor-pointer">
                    Executar 100% ({remainingArea.toFixed(1)} ha restantes)
                  </Label>
                </div>

                <div className="flex items-center space-x-2 border rounded p-2.5 cursor-pointer hover:bg-muted/20">
                  <RadioGroupItem value="partial" id="exec-partial" />
                  <Label htmlFor="exec-partial" className="text-xs cursor-pointer">
                    Execução Parcial
                  </Label>
                </div>
              </RadioGroup>

              {executionType === 'partial' && (
                <div>
                  <Label htmlFor="partial-area" className="text-xs">
                    Área Executada nesta Etapa (ha):
                  </Label>
                  <Input
                    id="partial-area"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={remainingArea}
                    value={partialArea}
                    onChange={(e) => setPartialArea(e.target.value)}
                    placeholder={'Máximo: ' + remainingArea.toFixed(1) + ' ha'}
                  />
                </div>
              )}

              {/* Multi-Select Colaboradores */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  Equipe / Operadores no Campo ({selectedCollaborators.length}):
                </Label>
                <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                  {selectedCollaborators.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">Nenhum operador selecionado</span>
                  ) : (
                    selectedCollaborators.map(c => (
                      <Badge key={c} variant="secondary" className="text-[11px] py-0 px-1.5 flex items-center gap-1 bg-blue-50 text-blue-800">
                        {c}
                        <button type="button" onClick={() => toggleCollaborator(c)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                {collaboratorsList.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border rounded bg-card">
                    {collaboratorsList.map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleCollaborator(c.name)}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                          selectedCollaborators.includes(c.name)
                            ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Select Equipamentos */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5 text-amber-600" />
                  Equipamentos Utilizados ({selectedEquipment.length}):
                </Label>
                <div className="flex flex-wrap gap-1 p-1.5 border rounded-md bg-muted/20 min-h-[32px]">
                  {selectedEquipment.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">Nenhum equipamento selecionado</span>
                  ) : (
                    selectedEquipment.map(eq => (
                      <Badge key={eq} variant="outline" className="text-[11px] py-0 px-1.5 flex items-center gap-1 bg-card">
                        {eq}
                        <button type="button" onClick={() => toggleEquipment(eq)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                {equipmentList.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 border rounded bg-card">
                    {equipmentList.map(eq => (
                      <button
                        type="button"
                        key={eq.id}
                        onClick={() => toggleEquipment(eq.name)}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                          selectedEquipment.includes(eq.name)
                            ? 'bg-amber-100 border-amber-400 text-amber-800 font-medium'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                      >
                        {eq.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="exec-notes" className="text-xs">
                  Observações da Execução (opcional):
                </Label>
                <Textarea
                  id="exec-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Condições climáticas boas, realizado nos talhões 1 e 2"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Histórico de execuções anteriores */}
          {order.executions && order.executions.length > 0 && (
            <div className="space-y-1 pt-2 border-t text-xs">
              <Label className="font-semibold flex items-center gap-1 text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                Histórico de Execuções ({order.executions.length}):
              </Label>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {order.executions.map((ex: any, idx) => (
                  <div key={ex.id || idx} className="p-2 bg-muted/40 rounded flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-medium">{ex.date}</span>: {ex.areaExecuted || ex.hectares} ha ({ex.percentage}%)
                      {(ex.collaborators?.length > 0 || ex.collaboratorName) && (
                        <span className="text-muted-foreground"> • Op: {ex.collaborators?.join(', ') || ex.collaboratorName}</span>
                      )}
                      {(ex.equipmentNames?.length > 0 || ex.equipmentName) && (
                        <span className="text-muted-foreground"> • Eq: {ex.equipmentNames?.join(', ') || ex.equipmentName}</span>
                      )}
                      {ex.notes && <div className="text-muted-foreground italic text-[10px]">{ex.notes}</div>}
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {remainingArea > 0 && (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
              disabled={submitting || (executionType === 'partial' && (!partialArea || parseFloat(partialArea) <= 0))}
            >
              Confirmar Execução
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
