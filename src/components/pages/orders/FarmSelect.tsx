
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Farm {
  id: string;
  name: string;
  owner: string;
  area: string;
  location: string;
}

interface FarmSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  farms: Farm[];
}

export const FarmSelect = ({ value, onValueChange, farms }: FarmSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma fazenda" />
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar fazenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full border-0 p-0 focus-visible:ring-0"
          />
        </div>
        {filteredFarms.map((farm) => (
          <SelectItem key={farm.id} value={farm.name}>
            {farm.name} - {farm.owner}
          </SelectItem>
        ))}
        {filteredFarms.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            Nenhuma fazenda encontrada
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
