
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Customer {
  id: string;
  cpf: string;
  name: string;
  email: string;
}

interface CustomerSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  customers: Customer[];
}

export const CustomerSelect = ({ value, onValueChange, customers }: CustomerSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredcustomers = customers.filter(cliente =>
    cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf.includes(searchTerm)
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um cliente" />
      </SelectTrigger>
      <SelectContent>
        <div className="flex items-center px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full border-0 p-0 focus-visible:ring-0"
          />
        </div>
        {filteredcustomers.map((cliente) => (
          <SelectItem key={cliente.id} value={cliente.name}>
            {cliente.name} - {cliente.cpf}
          </SelectItem>
        ))}
        {filteredcustomers.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
