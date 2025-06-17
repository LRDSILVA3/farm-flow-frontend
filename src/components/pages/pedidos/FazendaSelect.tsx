
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Fazenda {
  id: string;
  nome: string;
  proprietario: string;
  area: string;
  localizacao: string;
}

interface FazendaSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  fazendas: Fazenda[];
}

export const FazendaSelect = ({ value, onValueChange, fazendas }: FazendaSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFazendas = fazendas.filter(fazenda =>
    fazenda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fazenda.proprietario.toLowerCase().includes(searchTerm.toLowerCase())
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
        {filteredFazendas.map((fazenda) => (
          <SelectItem key={fazenda.id} value={fazenda.nome}>
            {fazenda.nome} - {fazenda.proprietario}
          </SelectItem>
        ))}
        {filteredFazendas.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            Nenhuma fazenda encontrada
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
