
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, FileText, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useCounterAnimation } from "@/hooks/useCounterAnimation";

const AnimatedValue = ({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) => {
  // Extrair apenas números da string
  const numericValue = parseInt(value.replace(/[^\d]/g, '')) || 0;
  const animatedCount = useCounterAnimation(numericValue, 2000);
  
  // Se o valor original contém pontos ou vírgulas, formatar o número animado
  const formatNumber = (num: number) => {
    if (value.includes('.') || value.includes(',')) {
      return num.toLocaleString('pt-BR');
    }
    return num.toString();
  };

  return (
    <span>
      {prefix}{formatNumber(animatedCount)}{suffix}
    </span>
  );
};

const DashboardHome = () => {
  const stats = [
    {
      title: "Clientes Ativos",
      value: "156",
      description: "+12% este mês",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Fazendas Cadastradas",
      value: "89",
      description: "+5 novas fazendas",
      icon: MapPin,
      color: "text-green-600"
    },
    {
      title: "Pedidos Pendentes",
      value: "23",
      description: "Para aprovação",
      icon: FileText,
      color: "text-orange-600"
    },
    {
      title: "Execuções Agendadas",
      value: "47",
      description: "Próximos 7 dias",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Faturamento Mensal",
      value: "245890",
      description: "+18% vs mês anterior",
      icon: DollarSign,
      color: "text-emerald-600",
      prefix: "R$ ",
      suffix: ""
    },
    {
      title: "Hectares Trabalhados",
      value: "1245",
      description: "Este mês",
      icon: TrendingUp,
      color: "text-cyan-600",
      suffix: ""
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema Preciza</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.title === "Faturamento Mensal" ? (
                  <AnimatedValue value={stat.value} prefix="R$ " />
                ) : (
                  <AnimatedValue value={stat.value} />
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Novo cliente cadastrado", time: "2 horas atrás", user: "João Silva" },
                { action: "Pedido aprovado", time: "4 horas atrás", user: "Maria Santos" },
                { action: "Execução finalizada", time: "6 horas atrás", user: "Pedro Costa" },
                { action: "Nova fazenda cadastrada", time: "1 dia atrás", user: "Ana Oliveira" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Execuções</CardTitle>
            <CardDescription>Serviços agendados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: "Pulverização", farm: "Fazenda São João", date: "15/06/2025", area: "45 ha" },
                { service: "Plantio", farm: "Fazenda Santa Maria", date: "16/06/2025", area: "120 ha" },
                { service: "Colheita", farm: "Fazenda Boa Vista", date: "17/06/2025", area: "80 ha" },
                { service: "Adubação", farm: "Fazenda Esperança", date: "18/06/2025", area: "95 ha" }
              ].map((execution, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm font-medium">{execution.service}</p>
                  <p className="text-xs text-gray-600">{execution.farm} • {execution.area}</p>
                  <p className="text-xs text-gray-500">{execution.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
