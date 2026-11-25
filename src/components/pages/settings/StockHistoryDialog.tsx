import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Product, StockMovement } from "../../../hooks/useProducts";
import { History, ArrowUpRight, ArrowDownRight, Sliders, Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  movements: StockMovement[];
  loading: boolean;
  onLoadMovements: (productId?: string) => void;
}

export const StockHistoryDialog: React.FC<StockHistoryDialogProps> = ({
  open,
  onOpenChange,
  product,
  movements,
  loading,
  onLoadMovements,
}) => {
  useEffect(() => {
    if (open) {
      onLoadMovements(product ? product.id : undefined);
    }
  }, [open, product]);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 gap-1 text-[11px]">
            <ArrowUpRight className="h-3 w-3" />
            Entrada
          </Badge>
        );
      case 'SAIDA_ORDEM':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 gap-1 text-[11px]">
            <ArrowDownRight className="h-3 w-3" />
            Saída Pedido
          </Badge>
        );
      case 'SAIDA_AVULSA':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-0 gap-1 text-[11px]">
            <ArrowDownRight className="h-3 w-3" />
            Saída Avulsa
          </Badge>
        );
      case 'AJUSTE':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 gap-1 text-[11px]">
            <Sliders className="h-3 w-3" />
            Ajuste
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-emerald-600" />
            Histórico de Movimentações de Estoque
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {product ? (
              <>Produto: <strong className="text-foreground">{product.name}</strong> ({product.unit || 'un'})</>
            ) : (
              "Todas as movimentações recentes do estoque"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-2 rounded-md border">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-10 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="text-xs">Carregando movimentações...</span>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 gap-2 text-muted-foreground">
              <Package className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">Nenhuma movimentação registrada</p>
              <p className="text-xs">As entradas, saídas e acertos de estoque aparecerão aqui.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Data</TableHead>
                  {!product && <TableHead>Produto</TableHead>}
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Qtd Movimentada</TableHead>
                  <TableHead className="text-right">Saldo Anterior</TableHead>
                  <TableHead className="text-right">Novo Saldo</TableHead>
                  <TableHead>Documento / Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id} className="text-xs">
                    <TableCell className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                      {m.created_at ? format(new Date(m.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                    </TableCell>
                    {!product && (
                      <TableCell className="font-semibold text-foreground">
                        {m.product?.name || "-"}
                      </TableCell>
                    )}
                    <TableCell>{getMovementBadge(m.type)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {m.type.startsWith('SAIDA') ? '-' : '+'}
                      {Number(m.quantity).toLocaleString('pt-BR')} {m.product?.unit || product?.unit || ''}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {Number(m.previous_stock).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {Number(m.new_stock).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={m.notes || m.document_number || ''}>
                      {m.document_number && <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">[{m.document_number}]</span>}
                      {m.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
