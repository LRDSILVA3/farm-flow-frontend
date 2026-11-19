import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, Check, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Plot {
  id: string;
  name: string;
  area: string;
}

interface PlotSelectProps {
  value?: string | string[];
  selectedPlotIds?: string[];
  onPlotsChange?: (selectedIds: string[], selectedPlots: Plot[]) => void;
  onValueChange?: (value: string) => void;
  plots: Plot[];
  disabled: boolean;
}

export const PlotSelect: React.FC<PlotSelectProps> = ({
  value,
  selectedPlotIds: propSelectedPlotIds,
  onPlotsChange,
  onValueChange,
  plots,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Normaliza os IDs selecionados a partir de props
  const selectedIds = useMemo<string[]>(() => {
    if (propSelectedPlotIds && Array.isArray(propSelectedPlotIds)) {
      return propSelectedPlotIds;
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      if (value === "todos") return ["todos"];
      if (value) return [value];
    }
    return ["todos"];
  }, [value, propSelectedPlotIds]);

  const isAllSelected = selectedIds.includes("todos") || (plots.length > 0 && selectedIds.length === plots.length);

  const filteredPlots = useMemo(() => {
    return plots.filter((plot) =>
      plot.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plots, searchTerm]);

  // Calcula a área total dos talhões selecionados
  const selectedPlotsObjects = useMemo(() => {
    if (isAllSelected) return plots;
    return plots.filter((p) => selectedIds.includes(p.id));
  }, [plots, selectedIds, isAllSelected]);

  const totalSelectedAreaHa = useMemo(() => {
    return selectedPlotsObjects.reduce(
      (sum, p) => sum + (parseFloat(p.area || "0") || 0),
      0
    );
  }, [selectedPlotsObjects]);

  const notifyChange = (newSelectedIds: string[]) => {
    let finalIds = newSelectedIds;
    let finalPlots: Plot[] = [];

    if (finalIds.includes("todos") || (plots.length > 0 && finalIds.length === plots.length)) {
      finalIds = ["todos"];
      finalPlots = plots;
    } else {
      finalPlots = plots.filter((p) => finalIds.includes(p.id));
    }

    if (onPlotsChange) {
      onPlotsChange(finalIds, finalPlots);
    }
    if (onValueChange) {
      onValueChange(finalIds.length === 1 ? finalIds[0] : finalIds.includes("todos") ? "todos" : finalIds.join(","));
    }
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      notifyChange([]);
    } else {
      notifyChange(["todos"]);
    }
  };

  const handleTogglePlot = (plotId: string) => {
    if (isAllSelected) {
      // Se estava "todos" e o usuário desmarcou ou clicou em um específico,
      // ele quer todos MENOS aquele, ou se tinha só um talhão, seleciona apenas os outros
      const newIds = plots.map((p) => p.id).filter((id) => id !== plotId);
      notifyChange(newIds);
      return;
    }

    const exists = selectedIds.includes(plotId);
    let newIds: string[];
    if (exists) {
      newIds = selectedIds.filter((id) => id !== plotId && id !== "todos");
    } else {
      newIds = [...selectedIds.filter((id) => id !== "todos"), plotId];
    }

    if (newIds.length === plots.length && plots.length > 0) {
      notifyChange(["todos"]);
    } else {
      notifyChange(newIds);
    }
  };

  const handleRemoveBadge = (plotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleTogglePlot(plotId);
  };

  // Label do botão Trigger
  const triggerLabel = useMemo(() => {
    if (disabled || plots.length === 0) {
      return "Nenhum talhão disponível";
    }
    if (isAllSelected) {
      return `Todos os Talhões (${plots.length} talhões • ${totalSelectedAreaHa.toFixed(1)} ha)`;
    }
    if (selectedPlotsObjects.length === 0) {
      return "Selecione o(s) talhão(ões)...";
    }
    if (selectedPlotsObjects.length === 1) {
      const p = selectedPlotsObjects[0];
      return `${p.name} (${parseFloat(p.area || "0").toFixed(1)} ha)`;
    }
    return `${selectedPlotsObjects.length} talhões selecionados (${totalSelectedAreaHa.toFixed(1)} ha)`;
  }, [disabled, plots.length, isAllSelected, selectedPlotsObjects, totalSelectedAreaHa]);

  return (
    <div className="space-y-1.5 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || plots.length === 0}
            className={cn(
              "w-full justify-between text-xs h-9 font-normal bg-card hover:bg-muted/50 border",
              selectedPlotsObjects.length > 0 && "text-foreground font-medium"
            )}
          >
            <span className="truncate flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {triggerLabel}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-2 text-xs" align="start">
          {/* Campo de Busca */}
          <div className="flex items-center px-2 py-1 border rounded-md mb-2 bg-muted/20">
            <Search className="h-3.5 w-3.5 mr-1.5 opacity-50 shrink-0" />
            <Input
              placeholder="Buscar talhão por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 text-xs border-0 p-0 focus-visible:ring-0 bg-transparent shadow-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Opção Todos os Talhões */}
          <div
            onClick={handleToggleAll}
            className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/60 transition-colors border-b mb-1 pb-2"
          >
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-plots"
                checked={isAllSelected}
                onCheckedChange={handleToggleAll}
              />
              <Label
                htmlFor="select-all-plots"
                className="text-xs font-semibold cursor-pointer text-primary"
              >
                Todos os Talhões da Fazenda
              </Label>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">
              {plots.reduce((sum, p) => sum + (parseFloat(p.area || "0") || 0), 0).toFixed(1)} ha
            </span>
          </div>

          {/* Lista de Talhões Individuais */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredPlots.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground italic text-xs">
                Nenhum talhão encontrado
              </div>
            ) : (
              filteredPlots.map((plot) => {
                const isChecked = isAllSelected || selectedIds.includes(plot.id);
                const areaHa = parseFloat(plot.area || "0");
                return (
                  <div
                    key={plot.id}
                    onClick={() => handleTogglePlot(plot.id)}
                    className={cn(
                      "flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                      isChecked && "bg-primary/5 font-medium"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`plot-${plot.id}`}
                        checked={isChecked}
                        onCheckedChange={() => handleTogglePlot(plot.id)}
                      />
                      <Label
                        htmlFor={`plot-${plot.id}`}
                        className="text-xs cursor-pointer truncate max-w-[170px]"
                      >
                        {plot.name}
                      </Label>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 font-normal">
                      {areaHa.toFixed(1)} ha
                    </Badge>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé com Resumo e Ação de Fechar */}
          <div className="pt-2 mt-1 border-t flex justify-between items-center text-[11px] text-muted-foreground">
            <span>
              Total: <strong>{totalSelectedAreaHa.toFixed(1)} ha</strong> ({selectedPlotsObjects.length} talhões)
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-primary px-2 hover:bg-primary/10"
              onClick={() => setOpen(false)}
            >
              Concluir
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges dos Talhões Selecionados (quando não forem 'todos') */}
      {!isAllSelected && selectedPlotsObjects.length > 0 && selectedPlotsObjects.length <= 8 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedPlotsObjects.map((p) => (
            <Badge
              key={p.id}
              variant="secondary"
              className="text-[10px] py-0 px-1.5 flex items-center gap-1 bg-muted/60 text-foreground"
            >
              <span>{p.name} ({parseFloat(p.area || "0").toFixed(1)} ha)</span>
              <button
                type="button"
                onClick={(e) => handleRemoveBadge(p.id, e)}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
