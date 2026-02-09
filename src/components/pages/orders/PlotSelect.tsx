
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface Plot {
  id: string;
  name: string;
  area: string;
}

interface PlotSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  plots: Plot[];
  disabled: boolean;
}

export const PlotSelect = ({ value, onValueChange, plots, disabled }: PlotSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlots = plots.filter(plot =>
    plot.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um talhão" />
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar talhão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full border-0 p-0 focus-visible:ring-0"
          />
        </div>
        <SelectItem value="todos">Todos</SelectItem>
        {filteredPlots.map((plot) => (
          <SelectItem key={plot.id} value={plot.id}>
            {plot.name}
          </SelectItem>
        ))}
        {filteredPlots.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            Nenhum talhão encontrado
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
