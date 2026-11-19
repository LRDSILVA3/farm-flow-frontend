import React, { useState, useEffect, useMemo, useRef } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  Tag,
  RotateCcw,
  Sparkles,
  X,
  Check,
} from "lucide-react";

export interface ProductOrderItem {
  id: string;
  productId?: string;
  name: string;
  unit: string;
  category?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  stockAvailable?: number;
  controlsStock?: boolean;
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

  // Categorias disponíveis no catálogo
  const categories = useMemo(() => {
    const set = new Set<string>();
    activeCatalog.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["Todos", ...Array.from(set)];
  }, [activeCatalog]);

  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCatalogDropdown, setShowCatalogDropdown] = useState<boolean>(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Itens selecionados no carrinho/pedido
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
        originalPrice: Number(p.originalPrice ?? p.price ?? p.unitPrice ?? 0),
        stockAvailable: p.stockAvailable,
        controlsStock: p.controlsStock ?? p.controls_stock,
      }));
    }
    return [];
  });

  const [descontoTipo, setDescontoTipo] = useState<"R$" | "%">("R$");
  const [descontoInput, setDescontoInput] = useState<string>("");

  // Refs para prevenir loops de re-renderização
  const onValuesChangeRef = useRef(onValuesChange);
  const onProductsChangeRef = useRef(onProductsChange);
  const lastTotalRef = useRef<number | null>(null);
  const lastItemsJsonRef = useRef<string>("");

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  useEffect(() => {
    onProductsChangeRef.current = onProductsChange;
  }, [onProductsChange]);

  // Hidrata dados de estoque e preços do catálogo quando carregado
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
          stockAvailable: Number(found.quantity ?? 0),
          originalPrice:
            item.originalPrice ||
            Number(found.valuePerUnit ?? found.unitValue ?? 0),
          controlsStock: found.controlsStock,
        };
      })
    );
  }, [activeCatalog]);

  // Fecha dropdown de busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowCatalogDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Produtos filtrados para a busca/catálogo
  const filteredCatalog = useMemo(() => {
    return activeCatalog.filter((prod) => {
      const matchCat =
        selectedCategory === "Todos" || prod.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        prod.name.toLowerCase().includes(term) ||
        (prod.code && prod.code.toLowerCase().includes(term)) ||
        (prod.category && prod.category.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [activeCatalog, selectedCategory, searchTerm]);

  // Cálculos financeiros
  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (!item.id) return sum;
        return sum + (Number(item.quantity) || 0) * (Number(item.price) || 0);
      }, 0),
    [items]
  );

  // Calcula desconto em reais
  const valorDescontoEfetivo = useMemo(() => {
    const raw = parseFloat(descontoInput) || 0;
    if (raw <= 0) return 0;
    if (descontoTipo === "%") {
      return (subtotal * Math.min(100, raw)) / 100;
    }
    return Math.min(subtotal, raw);
  }, [descontoInput, descontoTipo, subtotal]);

  const totalFinal = useMemo(
    () => Math.max(0, subtotal - valorDescontoEfetivo),
    [subtotal, valorDescontoEfetivo]
  );

  const totalItensCount = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );

  // Sincroniza total calculado e produtos estruturados de volta ao OrderForm
  useEffect(() => {
    if (
      lastTotalRef.current === null ||
      Math.abs(lastTotalRef.current - totalFinal) >= 0.01
    ) {
      lastTotalRef.current = totalFinal;
      onValuesChangeRef.current(totalFinal);
    }

    const validItems = items.filter((i) => i.id && i.name && i.quantity > 0);
    const json = JSON.stringify(validItems);
    if (json !== lastItemsJsonRef.current) {
      lastItemsJsonRef.current = json;
      onProductsChangeRef.current(validItems);
    }
  }, [items, totalFinal]);

  // Ação de adicionar produto ao carrinho
  const handleAddProduct = (prod: Product) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === prod.id);
      const unitVal = Number(prod.valuePerUnit ?? prod.unitValue ?? 0);
      if (existingIndex >= 0) {
        // Se já existe, incrementa a quantidade em 1
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Number(next[existingIndex].quantity) + 1,
        };
        return next;
      }
      // Adiciona novo item
      return [
        ...prev,
        {
          id: prod.id,
          productId: prod.id,
          name: prod.name,
          unit: prod.unit || "Un",
          category: prod.category || "",
          quantity: 1,
          price: unitVal,
          originalPrice: unitVal,
          stockAvailable: Number(prod.quantity ?? 0),
          controlsStock: prod.controlsStock,
        },
      ];
    });
    setSearchTerm("");
    setShowCatalogDropdown(false);
  };

  // Alteração de quantidade com stepper
  const handleQuantityStep = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const cur = Number(next[index].quantity) || 0;
      const updated = Math.max(0.1, cur + delta);
      next[index] = { ...next[index], quantity: Number(updated.toFixed(2)) };
      return next;
    });
  };

  const handleUpdateQuantity = (index: number, val: number | null) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        quantity: val === null || val < 0 ? 0 : val,
      };
      return next;
    });
  };

  const handleUpdatePrice = (index: number, val: number | null) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        price: val === null || val < 0 ? 0 : val,
      };
      return next;
    });
  };

  const handleResetPrice = (index: number) => {
    setItems((prev) => {
      const next = [...prev];
      const orig = next[index].originalPrice ?? 0;
      next[index] = { ...next[index], price: orig };
      return next;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 border rounded-lg bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Carregando catálogo de produtos...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SEÇÃO 1: CABEÇALHO & BARRA DE BUSCA RÁPIDA DE PRODUTOS */}
      <div className="p-4 border rounded-xl bg-card shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                Catálogo & Adição de Produtos
                <Badge variant="outline" className="text-xs font-normal">
                  {activeCatalog.length} produtos disponíveis
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Pesquise e clique no produto para adicionar diretamente ao pedido de venda.
              </p>
            </div>
          </div>
        </div>

        {/* Categorias Rápidas (Chips / Pills) */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Filtro:
            </span>
            {categories.map((cat) => {
              const count =
                cat === "Todos"
                  ? activeCatalog.length
                  : activeCatalog.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Input de Busca com Auto-complete / Popover de Resultados */}
        <div ref={searchBoxRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Digite o nome, código ou insumo do produto para buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowCatalogDropdown(true);
              }}
              onFocus={() => setShowCatalogDropdown(true)}
              className="pl-9 pr-9 h-10 bg-background text-sm rounded-lg"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown Flutuante de Produtos Encontrados */}
          {showCatalogDropdown && (
            <div className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-popover text-popover-foreground border rounded-lg shadow-xl divide-y">
              {filteredCatalog.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhum produto encontrado para &quot;{searchTerm}&quot;
                  {selectedCategory !== "Todos" && ` na categoria ${selectedCategory}`}.
                </div>
              ) : (
                filteredCatalog.map((prod) => {
                  const alreadyInCart = items.find((i) => i.id === prod.id);
                  const isStockControlled = prod.controlsStock;
                  const stockQty = Number(prod.quantity ?? 0);
                  const price = Number(prod.valuePerUnit ?? prod.unitValue ?? 0);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleAddProduct(prod)}
                      className="p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {prod.name}
                          </span>
                          {prod.category && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {prod.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Unidade: <strong>{prod.unit}</strong></span>
                          <span>•</span>
                          {isStockControlled ? (
                            <span
                              className={
                                stockQty <= 0
                                  ? "text-destructive font-medium"
                                  : "text-emerald-700 font-medium"
                              }
                            >
                              Estoque: {stockQty} {prod.unit}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Insumo sob demanda (sem estoque próprio)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">
                            Preço Tabela
                          </span>
                          <span className="font-bold text-foreground">
                            {formatBRL(price)}
                          </span>
                        </div>
                        {alreadyInCart ? (
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="default"
                              className="bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {alreadyInCart.quantity} {alreadyInCart.unit}
                            </Badge>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="h-8 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(prod);
                              }}
                              title="Adicionar mais 1"
                            >
                              +1
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Adicionar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: ITENS SELECIONADOS NO PEDIDO (CARRINHO) */}
      <div className="p-4 border rounded-xl bg-card shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Itens do Pedido de Venda
            </h4>
            <Badge variant="secondary" className="text-xs">
              {items.length} {items.length === 1 ? "produto" : "produtos"} •{" "}
              {totalItensCount} volumes
            </Badge>
          </div>
          {items.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setItems([])}
              className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
            >
              Limpar lista
            </Button>
          )}
        </div>

        {/* Se a lista estiver vazia (Empty State amigável) */}
        {items.length === 0 ? (
          <div className="py-8 px-4 text-center border border-dashed rounded-xl bg-muted/20 space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground">
                Nenhum produto adicionado ao pedido ainda
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Use a busca rápida acima para localizar produtos ou clique em uma das opções frequentes abaixo:
              </p>
            </div>

            {/* Atalhos com produtos mais frequentes */}
            {activeCatalog.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {activeCatalog.slice(0, 4).map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddProduct(p)}
                    className="text-xs h-8 border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {p.name} ({formatBRL(p.valuePerUnit)})
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Lista de Produtos Adicionados com Stepper e Valores */
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const itemSubtotal =
                (Number(item.quantity) || 0) * (Number(item.price) || 0);
              const isStockControlled = item.controlsStock;
              const stock = Number(item.stockAvailable ?? 0);
              const exceedsStock =
                isStockControlled && item.quantity > stock;
              const hasPriceChanged =
                item.originalPrice !== undefined &&
                Math.abs(item.price - item.originalPrice) >= 0.01;

              return (
                <div
                  key={item.id || index}
                  className="p-3 border rounded-xl bg-muted/20 hover:bg-muted/30 transition-all space-y-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Identificação do Produto */}
                    <div className="space-y-1 flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">
                          {item.name}
                        </span>
                        {item.category && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {item.category}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          {item.unit}
                        </Badge>
                      </div>

                      {/* Informações de Estoque */}
                      <div className="text-xs flex items-center gap-2">
                        {isStockControlled ? (
                          <span
                            className={
                              exceedsStock
                                ? "text-destructive font-semibold flex items-center gap-1"
                                : "text-muted-foreground"
                            }
                          >
                            {exceedsStock && (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            )}
                            Estoque atual: <strong>{stock} {item.unit}</strong>
                            {!exceedsStock && (
                              <span className="text-emerald-700 ml-1">
                                (restarão {stock - item.quantity} {item.unit})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            Insumo sob demanda (fornecimento de serviço / terceiro)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controles de Quantidade & Preço Unitário & Subtotal */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Quantidade com Stepper [-] [ Qtd ] [+] */}
                      <div className="space-y-0.5">
                        <Label className="text-[11px] font-medium text-muted-foreground block">
                          Qtd ({item.unit})
                        </Label>
                        <div className="flex items-center border rounded-lg bg-background overflow-hidden h-9">
                          <button
                            type="button"
                            onClick={() => handleQuantityStep(index, -1)}
                            className="px-2.5 h-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Diminuir 1"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <DecimalInput
                            value={item.quantity}
                            onValueChange={(val) =>
                              handleUpdateQuantity(index, val)
                            }
                            className="w-16 h-full text-center border-0 rounded-none focus-visible:ring-0 text-sm font-semibold p-0"
                            placeholder="1"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityStep(index, 1)}
                            className="px-2.5 h-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Aumentar 1"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Preço Unitário Editável */}
                      <div className="space-y-0.5 min-w-[110px]">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-medium text-muted-foreground">
                            Unitário (R$)
                          </Label>
                          {hasPriceChanged && (
                            <button
                              type="button"
                              onClick={() => handleResetPrice(index)}
                              className="text-[10px] text-primary flex items-center hover:underline"
                              title={`Restaurar tabela: ${formatBRL(item.originalPrice || 0)}`}
                            >
                              <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                              Tabela
                            </button>
                          )}
                        </div>
                        <DecimalInput
                          value={item.price}
                          onValueChange={(val) =>
                            handleUpdatePrice(index, val)
                          }
                          className="h-9 text-right text-sm bg-background font-medium"
                          placeholder="0,00"
                        />
                      </div>

                      {/* Subtotal do Item */}
                      <div className="space-y-0.5 min-w-[110px] text-right">
                        <Label className="text-[11px] font-medium text-muted-foreground block">
                          Subtotal
                        </Label>
                        <div className="h-9 px-2.5 flex items-center justify-end rounded-lg bg-background border font-bold text-sm text-foreground">
                          {formatBRL(itemSubtotal)}
                        </div>
                      </div>

                      {/* Botão de Excluir */}
                      <div className="pt-3 md:pt-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg"
                          title="Remover produto do pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Alerta de Estoque Insuficiente */}
                  {exceedsStock && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Atenção: A quantidade solicitada ({item.quantity} {item.unit}) supera o saldo físico disponível em estoque ({stock} {item.unit}). O saldo ficará negativo se a venda for concluída sem nova entrada.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: RESUMO COMERCIAL, DESCONTO & VALOR TOTAL */}
      <div className="p-4 border rounded-xl bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Subtotal Bruto */}
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">
              Subtotal Bruto ({items.length} {items.length === 1 ? "item" : "itens"})
            </span>
            <div className="text-lg font-bold text-foreground">
              {formatBRL(subtotal)}
            </div>
            <span className="text-[11px] text-muted-foreground">
              Soma de todos os produtos sem desconto
            </span>
          </div>

          {/* Desconto Comercial */}
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Desconto Comercial
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDescontoTipo("R$")}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    descontoTipo === "R$"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  R$
                </button>
                <button
                  type="button"
                  onClick={() => setDescontoTipo("%")}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    descontoTipo === "%"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  %
                </button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="prod-desconto-input"
                type="number"
                step="any"
                min="0"
                value={descontoInput}
                onChange={(e) => setDescontoInput(e.target.value)}
                placeholder={descontoTipo === "R$" ? "0,00" : "0"}
                className="h-8 bg-background text-sm font-semibold pr-8"
              />
              <span className="absolute right-2.5 top-2 text-xs text-muted-foreground font-medium">
                {descontoTipo}
              </span>
            </div>
            {valorDescontoEfetivo > 0 && (
              <span className="text-[11px] text-emerald-700 font-medium block">
                Abatimento de -{formatBRL(valorDescontoEfetivo)}
              </span>
            )}
          </div>

          {/* Valor Total da Venda */}
          <div className="p-3 bg-primary/10 border-2 border-primary/40 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">
                Total da Venda
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-primary">
              {formatBRL(totalFinal)}
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Valor final calculado a ser faturado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
