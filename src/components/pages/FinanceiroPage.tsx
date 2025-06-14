
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock } from "lucide-react";

const FinanceiroPage = () => {
  const pedidosFinalizados = [
    {
      id: "1",
      cliente: "João Silva",
      servico: "Pulverização",
      valor: "R$ 9.100,00",
      data: "10/06/2025",
      status: "Aguardando Pagamento"
    },
    {
      id: "2",
      cliente: "Maria Santos",
      servico: "Plantio",
      valor: "R$ 24.000,00",
      data: "08/06/2025",
      status: "Pago"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-gray-600">Controle financeiro e pagamentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 245.890</div>
            <p className="text-xs text-gray-600">+18% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.200</div>
            <p className="text-xs text-gray-600">12 pedidos aguardando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24%</div>
            <p className="text-xs text-gray-600">Crescimento trimestral</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos Finalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFinalizados.map((pedido) => (
                <TableRow key={pedido.id}>
                  <TableCell>{pedido.cliente}</TableCell>
                  <TableCell>{pedido.servico}</TableCell>
                  <TableCell>{pedido.valor}</TableCell>
                  <TableCell>{pedido.data}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pedido.status === "Pago" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {pedido.status}
                    </span>
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

export default FinanceiroPage;
