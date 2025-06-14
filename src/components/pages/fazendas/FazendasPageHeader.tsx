
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FazendasPageHeaderProps {
  onNewFazenda: () => void;
}

export const FazendasPageHeader = ({ onNewFazenda }: FazendasPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fazendas</h1>
        <p className="text-gray-600">Gerencie as fazendas e seus talhões</p>
      </div>
      <Button 
        className="bg-green-600 hover:bg-green-700"
        onClick={onNewFazenda}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nova Fazenda
      </Button>
    </div>
  );
};
