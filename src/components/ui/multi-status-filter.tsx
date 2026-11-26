import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiStatusOption {
  value: string;
  label: string;
  badgeClass?: string;
  count?: number;
}

interface MultiStatusFilterProps {
  options: MultiStatusOption[];
  selected: string[]; // empty array means "All"
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export const MultiStatusFilter: React.FC<MultiStatusFilterProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Status",
  className,
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);

  const isAll = selected.length === 0;

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      const next = selected.filter((v) => v !== value);
      onChange(next);
    } else {
      const next = [...selected, value];
      if (next.length === options.length) {
        onChange([]); // Todos marcados = sem restrição
      } else {
        onChange(next);
      }
    }
  };

  const handleSelectAll = () => {
    onChange([]);
  };

  const displayText = () => {
    if (selected.length === 0) {
      return "Todos";
    }
    if (selected.length === 1) {
      const opt = options.find((o) => o.value === selected[0]);
      return opt ? opt.label : selected[0];
    }
    return `${selected.length} selecionados`;
  };

  return (
    <div className={cn("inline-block", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-9 text-xs justify-between font-normal bg-background px-3 min-w-[160px] w-full sm:w-auto",
              selected.length > 0 && "border-primary/50 text-foreground font-semibold bg-primary/5",
              triggerClassName
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Filter className={cn("h-3.5 w-3.5 shrink-0", selected.length > 0 ? "text-primary" : "text-muted-foreground")} />
              <span className="text-muted-foreground font-normal">{placeholder}:</span>
              <span className="truncate">{displayText()}</span>
            </div>
            {selected.length > 0 ? (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1 bg-primary text-primary-foreground font-bold shrink-0">
                {selected.length}
              </Badge>
            ) : (
              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2 text-xs shadow-md" align="start">
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b text-[11px] font-semibold text-muted-foreground">
            <span>Filtrar por {placeholder}</span>
            {selected.length > 0 ? (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-primary hover:underline font-medium text-[11px] flex items-center gap-0.5"
              >
                <X className="h-3 w-3" /> Limpar ({selected.length})
              </button>
            ) : (
              <span className="text-muted-foreground font-normal">Todos visíveis</span>
            )}
          </div>

          <div className="space-y-1">
            {/* Opção Todos */}
            <div
              onClick={handleSelectAll}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors hover:bg-muted/70",
                isAll && "bg-muted font-semibold text-foreground"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Checkbox
                  checked={isAll}
                  onCheckedChange={handleSelectAll}
                  className="h-3.5 w-3.5"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="truncate text-xs">Todos os Status</span>
              </div>
            </div>

            {/* Opções individuais */}
            {options.map((option) => {
              const isChecked = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors hover:bg-muted/70",
                    isChecked && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => handleToggle(option.value)}
                      className="h-3.5 w-3.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="truncate text-xs">{option.label}</span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-[10px] text-muted-foreground font-semibold px-1 rounded bg-muted/60">
                      {option.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
