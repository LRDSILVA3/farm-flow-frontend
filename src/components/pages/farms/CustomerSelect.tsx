import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.cpf.includes(searchTerm)
  );

  const selectedCustomer = customers.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedCustomer ? `${selectedCustomer.name} - ${selectedCustomer.cpf}` : "Selecione um cliente"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[60] w-full p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 border-0 p-0 focus-visible:ring-0"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={cn(
                  "flex cursor-pointer items-center px-3 py-2 hover:bg-accent",
                  value === customer.id && "bg-accent"
                )}
                onClick={() => {
                  onValueChange(customer.id);
                  setOpen(false);
                  setSearchTerm("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === customer.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {customer.name} - {customer.cpf}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
