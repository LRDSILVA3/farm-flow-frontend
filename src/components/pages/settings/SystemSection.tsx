
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const SystemSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Seção em desenvolvimento</p>
          <p className="text-sm mt-2">Aqui você poderá configurar parâmetros gerais do sistema</p>
        </div>
      </CardContent>
    </Card>
  );
};
