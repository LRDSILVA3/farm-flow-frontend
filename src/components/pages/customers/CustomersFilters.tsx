
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CustomersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cityStateFilter: string;
  onCityStateFilterChange: (value: string) => void;
  cityStates: string[];
}

export const CustomersFilters = ({
  searchTerm,
  onSearchChange,
  cityStateFilter,
  onCityStateFilterChange,
  cityStates
}: CustomersFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64"
        />
      </div>
      <Select value={cityStateFilter} onValueChange={onCityStateFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Cidade/Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as cidades</SelectItem>
          {cityStates.map((cityState) => (
            <SelectItem key={cityState} value={cityState}>
              {cityState}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
