import React, { useState, useEffect, useMemo } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package, AlertTriangle, Loader2, Tag } from "lucide-react";

export interface ProductOrderItem {
  id: string;
  productId?: string;
  name: string;
  unit: string;
  category?: string;
  quantity: number;
  price: number;
  stockAvailable?: number;
}

interface ProductOrderFormProps {
  initialProducts?: any[];
  onValuesChange: (calculatedValue: number) => void;
  onProductsChange: (products: ProductOrderItem[]) => void;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

export const ProductOrderForm: React.FC<ProductOrderFormProps> = ({
  initialProducts,
  onValuesChange,
  onProductsChange,
}) => {
  const { products: catalogProducts, loading } = useProducts();

  const activeCatalog = useMemo(
    () =>
      catalogProducts.filter(
        (p) => !p.status || p.status.toLowerCase() === "ativo"
      ),
    [catalogProducts]
  );

  const [items, setItems] = useState<ProductOrderItem[]>(() => {
    if (Array.isArray(initialProducts) && initialProducts.length > 0) {
      return initialProducts.map((p: any) => ({
        id: p.id || p.productId || "",
        productId: p.productId || p.id || "",
        name: p.name || "",
        unit: p.unit || "Un",
        category: p.category || "",
        quantity: Number(p.quantity) || 1,
        price: Number(p.price ?? p.unitPrice ?? 0),
        stockAvailable: p.stockAvailable,
      }));
    }
    return [
      {
        id: "",
        productId: "",
        name: "",
        unit: "Un",
        category: "",
        quantity: 1,
        price: 0,
      },
    ];
  });

  const [descontoValor, setDescontoValor] = useState<number>(0);

  // Refs to prevent infinite re-render loops
  const onValuesChangeRef = React.useRef(onValuesChange);
  const onProductsChangeRef = React.useRef(onProductsChange);
  const lastTotalRef = React.useRef<number | null>(null);
  const lastItemsJsonRef = React.useRef<string>("");

  React.useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  React.useEffect(() => {
    onProductsChangeRef.current = onProductsChange;
  }, [onProductsChange]);

  // Hydrate stockAvailable once catalog loads
  useEffect(() => {
    if (activeCatalog.length === 0) return;
    setItems((prev) =>
      prev.map((item) => {
        if (!item.id) return item;
        const found = activeCatalog.find((p) => p.id === item.id);
        if (!found) return item;
        return {
          ...item,
          unit: item.unit || found.unit || "Un",
          category: item.category || found.category || "",
          stockAvailable: found.quantity,
        };
      })
    );
  }, [activeCatalog]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (!item.id) return sum;
        return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0);
      }, 0),
    [items]
  );

  const totalFinal = useMemo(
    () => Math.max(0, subtotal - (Number(descontoValor) || 0)),
    [subtotal, descontoValor]
  );

  const validItemsCount = useMemo(
    () => items.filter((i) => i.id && i.quantity > 0).length,
    [items]
  );

  // Sync calculated total and structured products back to OrderForm
  useEffect(() => {
    if (
      lastTotalRef.current === null ||
      Math.abs(lastTotalRef.current - totalFinal) >= 0.01
    ) {
      lastTotalRef.current = totalFinal;
      onValuesChangeRef.current(totalFinal);
    }

    const validItems = items.filter((i) => i.id && i.name);
    const json = JSON.stringify(validItems);
    if (json !== lastItemsJsonRef.current) {
      lastItemsJsonRef.current = json;
      onProductsChangeRef.current(validItems);
    }
  }, [items, totalFinal]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: "",
        productId: "",
        name: "",
        unit: "Un",
        category: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: "",
            productId: "",
            name: "",
            unit: "Un",
            category: "",
            quantity: 1,
            price: 0,
          },
        ];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const selected: Product | undefined = activeCatalog.find(
      (p) => p.id === productId
    );
    if (!selected) return;

    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        id: selected.id,
        productId: selected.id,
        name: selected.name,
        unit: selected.unit || "Un",
        category: selected.category || "",
        price: Number(selected.valuePerUnit ?? selected.unitValue ?? 0),
        stockAvailable: Number(selected.quantity ?? 0),
      };
      return next;
    });
  };

  const handleUpdateField = (
    index: number,
    field: "quantity" | "price",
    value: number | null
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value === null ? 0 : value,
      };
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-md bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando catálogo de produtos...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">
              Itens de Venda / Produtos
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecione os produtos cadastrados no estoque. O valor total é
              calculado automaticamente.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddItem}
          className="border-primary/40 text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Produto
        </Button>
      </div>

      {activeCatalog.length === 0 ? (
        <div className="p-6 text-center border border-dashed rounded-md bg-muted/20 text-sm text-muted-foreground">
          Nenhum produto ativo cadastrado no sistema. Cadastre produtos em{" "}
          <strong>Configurações → Produtos</strong>.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const itemSubtotal =
              (Number(item.quantity) || 0) * (Number(item.price) || 0);
            const exceedsStock =
              item.id &&
              item.stockAvailable !== undefined &&
              item.quantity > item.stockAvailable;

            return (
              <div
                key={index}
                className="p-3 border rounded-lg bg-muted/15 space-y-2.5"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  {/* Seletor de Produto */}
                  <div className="md:col-span-5 space-y-1">
                    <Label className="text-xs font-medium">
                      Produto {index + 1} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={item.id}
                      onValueChange={(val) => handleSelectProduct(index, val)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione um produto do catálogo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCatalog.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id}>
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="font-medium">{prod.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatBRL(prod.valuePerUnit)}/{prod.unit} • Est:{" "}
                                {prod.quantity} {prod.unit}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantidade */}
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-medium">
                      Qtd ({item.unit || "Un"})
                    </Label>
                    <DecimalInput
                      value={item.quantity}
                      onValueChange={(val) =>
                        handleUpdateField(index, "quantity", val)
                      }
                      placeholder="1"
                    />
                  </div>

                  {/* Preço Unitário */}
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-medium">
                      Unitário (R$)
                    </Label>
                    <DecimalInput
                      value={item.price}
                      onValueChange={(val) =>
                        handleUpdateField(index, "price", val)
                      }
                      placeholder="0,00"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Subtotal
                    </Label>
                    <div className="h-10 px-3 flex items-center justify-end rounded-md border bg-muted/40 font-semibold text-sm">
                      {formatBRL(itemSubtotal)}
                    </div>
                  </div>

                  {/* Remover */}
                  <div className="md:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10"
                      title="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Linha de Metadados / Alerta de Estoque */}
                {item.id && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      {item.category && (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.category}
                        </Badge>
                      )}
                      {item.stockAvailable !== undefined && (
                        <span
                          className={
                            item.stockAvailable <= 0
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          Estoque disponível:{" "}
                          <strong>
                            {item.stockAvailable} {item.unit}
                          </strong>
                        </span>
                      )}
                    </div>

                    {exceedsStock && (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>
                          Quantidade solicitada excede o estoque atual (
                          {item.stockAvailable} {item.unit})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo Financeiro e Desconto */}
      <div className="pt-3 border-t space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="p-3 bg-muted/40 rounded-md border">
            <span className="text-xs text-muted-foreground block">
              Subtotal ({validItemsCount}{" "}
              {validItemsCount === 1 ? "item" : "itens"})
            </span>
            <strong className="text-base">{formatBRL(subtotal)}</strong>
          </div>

          <div className="space-y-1">
            <Label htmlFor="prod-desconto" className="text-xs font-medium">
              Desconto Comercial (R$)
            </Label>
            <Input
              id="prod-desconto"
              type="number"
              step="any"
              min="0"
              value={descontoValor === 0 ? "" : descontoValor}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setDescontoValor(isNaN(v) || v < 0 ? 0 : v);
              }}
              placeholder="0,00"
              className="bg-background"
            />
          </div>

          <div className="p-3 bg-primary/10 border border-primary/30 rounded-md">
            <span className="text-xs text-primary font-medium block">
              Valor Total dos Produtos
            </span>
            <strong className="text-lg text-primary">
              {formatBRL(totalFinal)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
