import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PedidoFinanceiro {
  id: string;
  cliente: string;
  servico: string;
  valor: string;
  data: string;
  status: string;
}

const FinanceiroPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pedidosFinalizados, setPedidosFinalizados] = useState<PedidoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    faturamentoMensal: 0,
    pagamentosPendentes: 0,
    pedidosAguardando: 0
  });

  useEffect(() => {
    fetchFinanceiroData();
  }, []);

  const fetchFinanceiroData = async () => {
    try {
      // Fetch pedidos com status concluído ou com pagamento definido
      const { data: pedidos, error } = await supabase
        .from("pedidos")
        .select(`
          id, servico, valor, pagamento, created_at,
          clientes:cliente_id (nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (pedidos || []).map(p => ({
        id: p.id,
        cliente: (p.clientes as any)?.nome || "Cliente",
        servico: p.servico || "Serviço",
        valor: p.valor ? `R$ ${Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 0,00",
        data: p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : "-",
        status: p.pagamento || "Aguardando"
      }));

      setPedidosFinalizados(mapped);

      // Calculate stats
      const faturamento = (pedidos || [])
        .filter(p => p.pagamento === "Pago")
        .reduce((sum, p) => sum + (Number(p.valor) || 0), 0);

      const pendentes = (pedidos || [])
        .filter(p => p.pagamento === "Aguardando" || !p.pagamento)
        .reduce((sum, p) => sum + (Number(p.valor) || 0), 0);

      const aguardando = (pedidos || [])
        .filter(p => p.pagamento === "Aguardando" || !p.pagamento).length;

      setStats({
        faturamentoMensal: faturamento,
        pagamentosPendentes: pendentes,
        pedidosAguardando: aguardando
      });

    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalItems = pedidosFinalizados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPedidos = pedidosFinalizados.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-gray-600">Controle financeiro e pagamentos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600">Pedidos pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600">{stats.pedidosAguardando} pedidos aguardando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats.faturamentoMensal + stats.pagamentosPendentes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600">Todos os pedidos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Carregando...</p>
            ) : pedidosFinalizados.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado</p>
            ) : (
              <>
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
                    {currentPedidos.map((pedido) => (
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} pedidos
                    </span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">por página</span>
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroPage;
