import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "../../../hooks/useProducts";
import { ArrowDownRight, ArrowUpRight, Sliders, PackagePlus, AlertCircle } from "lucide-react";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSaveMovement: (
    productId: string,
    data: {
      type: 'ENTRADA' | 'SAIDA_ORDEM' | 'SAIDA_AVULSA' | 'AJUSTE';
      quantity: number;
      unit_price?: number;
      document_number?: string;
      notes?: string;
    }
  ) => Promise<boolean>;
}

export const StockMovementDialog: React.FC<StockMovementDialogProps> = ({
  open,
  onOpenChange,
  product,
  onSaveMovement,
}) => {
  const [type, setType] = useState<'ENTRADA' | 'SAIDA_AVULSA' | 'AJUSTE'>('ENTRADA');
  const [quantity, setQuantity] = useState<number | string>("");
  const [unitPrice, setUnitPrice] = useState<number | string>("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!product) return null;

  const currentStock = Number(product.quantity) || 0;
  const numQty = parseFloat(quantity as string) || 0;

  let projectedStock = currentStock;
  if (type === 'ENTRADA') projectedStock = currentStock + numQty;
  else if (type === 'SAIDA_AVULSA') projectedStock = Math.max(0, currentStock - numQty);
  else if (type === 'AJUSTE') projectedStock = numQty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0 && type !== 'AJUSTE') return;

    setSaving(true);
    const success = await onSaveMovement(product.id, {
      type,
      quantity: numQty,
      unit_price: unitPrice ? parseFloat(unitPrice as string) : undefined,
      document_number: documentNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);

    if (success) {
      setQuantity("");
      setUnitPrice("");
      setDocumentNumber("");
      setNotes("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <PackagePlus className="h-5 w-5 text-emerald-600" />
            Movimentação de Estoque
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Produto: <strong className="text-foreground">{product.name}</strong> ({product.unit || 'un'})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Card de Saldo */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg border text-xs">
            <div>
              <span className="text-muted-foreground block">Saldo Atual:</span>
              <span className="text-sm font-semibold">{currentStock.toLocaleString('pt-BR')} {product.unit}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Novo Saldo Previsto:</span>
              <span className={`text-sm font-bold ${projectedStock < currentStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                {projectedStock.toLocaleString('pt-BR')} {product.unit}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Tipo de Movimentação</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              <Button
                type="button"
                variant={type === 'ENTRADA' ? 'default' : 'outline'}
                size="sm"
                className={`text-xs gap-1 h-9 ${type === 'ENTRADA' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={() => setType('ENTRADA')}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Entrada
              </Button>
              <Button
                type="button"
                variant={type === 'SAIDA_AVULSA' ? 'default' : 'outline'}
                size="sm"
                className={`text-xs gap-1 h-9 ${type === 'SAIDA_AVULSA' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                onClick={() => setType('SAIDA_AVULSA')}
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Saída
              </Button>
              <Button
                type="button"
                variant={type === 'AJUSTE' ? 'default' : 'outline'}
                size="sm"
                className={`text-xs gap-1 h-9 ${type === 'AJUSTE' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setType('AJUSTE')}
              >
                <Sliders className="h-3.5 w-3.5" />
                Ajuste
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mov-qty" className="text-xs font-semibold">
                {type === 'AJUSTE' ? 'Novo Saldo Contado *' : 'Quantidade *'}
              </Label>
              <Input
                id="mov-qty"
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="mov-price" className="text-xs font-semibold">
                Custo Unitário (R$)
              </Label>
              <Input
                id="mov-price"
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder={product.costPrice ? product.costPrice.toFixed(2) : "0.00"}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mov-doc" className="text-xs font-semibold">
              Nº Documento / Romaneio / NF
            </Label>
            <Input
              id="mov-doc"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="Ex: NF-12345, Romaneio 88"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="mov-notes" className="text-xs font-semibold">
              Motivo / Observações
            </Label>
            <Textarea
              id="mov-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Carga recebida para safra 2026 / Perda por umidade / Acerto de inventário"
              className="mt-1 text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || (!quantity && type !== 'AJUSTE')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? "Salvando..." : "Confirmar Movimentação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
