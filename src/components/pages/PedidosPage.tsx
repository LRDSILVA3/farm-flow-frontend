
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Search } from "lucide-react";

const PedidosPage = () => {
  const [pedidos] = useState([
    {
      id: "1",
      cliente: "João Silva",
      fazenda: "Fazenda São João",
      servico: "Pulverização",
      area: "45.5",
      valor: "R$ 9.100,00",
      status: "Pendente",
      pagamento: "Aguardando"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-gray-600">Gerencie os pedidos de serviços</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fazenda</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Área (ha)</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.fazenda}</TableCell>
                  <TableCell>{pedido.servico}</TableCell>
                  <TableCell>{pedido.area}</TableCell>
                  <TableCell>{pedido.valor}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {pedido.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      {pedido.pagamento}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidosPage;
