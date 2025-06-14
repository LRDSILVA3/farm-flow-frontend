
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

const AgendaPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-gray-600">Gerencie execuções e agendamentos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Execuções Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">Pulverização - Fazenda São João</h4>
                <p className="text-sm text-gray-600">45 hectares • Cliente: João Silva</p>
                <p className="text-xs text-gray-500">Aguardando agendamento</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium">Plantio - Fazenda Santa Maria</h4>
                <p className="text-sm text-gray-600">120 hectares • Cliente: Maria Santos</p>
                <p className="text-xs text-gray-500">Aguardando agendamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Execuções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium">Colheita - Fazenda Boa Vista</h4>
                <p className="text-sm text-gray-600">80 hectares • 17/06/2025</p>
                <p className="text-xs text-gray-500">Equipamento: Colheitadeira 01</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">Adubação - Fazenda Esperança</h4>
                <p className="text-sm text-gray-600">95 hectares • 18/06/2025</p>
                <p className="text-xs text-gray-500">Equipamento: Caminhão 02</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgendaPage;
