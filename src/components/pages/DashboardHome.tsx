import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, FileText, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useCounterAnimation } from "@/hooks/useCounterAnimation";
import { supabase } from "@/integrations/supabase/client";

const AnimatedValue = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const animatedCount = useCounterAnimation(value, 2000);
  
  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  return (
    <span>
      {prefix}{formatNumber(animatedCount)}{suffix}
    </span>
  );
};

interface DashboardStats {
  activeClients: number;
  registeredFarms: number;
  pendingOrders: number;
  scheduledExecutions: number;
  monthlyRevenue: number;
  workedHectares: number;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0,
    registeredFarms: 0,
    pendingOrders: 0,
    scheduledExecutions: 0,
    monthlyRevenue: 0,
    workedHectares: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingExecutions, setUpcomingExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch counts
      const [clientsRes, farmsRes, ordersRes, executionsRes] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("farms").select("id, area", { count: "exact" }),
        supabase.from("orders").select("id, status, value, area", { count: "exact" }),
        supabase.from("executions").select("id, status, scheduled_date, service_name, area, farm_id", { count: "exact" })
      ]);

      const clientsCount = clientsRes.count || 0;
      const farmsCount = farmsRes.count || 0;
      
      const pendingOrders = (ordersRes.data || []).filter(p => p.status === "Pendente").length;
      const scheduledExecutions = (executionsRes.data || []).filter(e => e.status === "Agendado").length;
      
      // Calculate revenue (sum of completed orders)
      const revenue = (ordersRes.data || [])
        .filter(p => p.status === "Concluído")
        .reduce((sum, p) => sum + (Number(p.value) || 0), 0);
      
      // Calculate hectares
      const hectares = (executionsRes.data || [])
        .filter(e => e.status === "Concluído")
        .reduce((sum, e) => sum + (Number(e.area) || 0), 0);

      setStats({
        activeClients: clientsCount,
        registeredFarms: farmsCount,
        pendingOrders,
        scheduledExecutions,
        monthlyRevenue: revenue,
        workedHectares: hectares
      });

      // Fetch recent clients for activities
      const { data: recentClients } = await supabase
        .from("clients")
        .select("name, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      setRecentActivities((recentClients || []).map(c => ({
        action: `Novo cliente: ${c.name}`,
        time: formatTimeAgo(c.created_at),
        user: c.name
      })));

      // Fetch upcoming executions
      const { data: executions } = await supabase
        .from("executions")
        .select(`
          id, service_name, area, scheduled_date,
          farms:farm_id (name)
        `)
        .eq("status", "Agendado")
        .order("scheduled_date", { ascending: true })
        .limit(4);

      setUpcomingExecutions((executions || []).map(e => ({
        service: e.service_name || "Serviço",
        farm: (e.farms as any)?.name || "Fazenda",
        date: e.scheduled_date ? new Date(e.scheduled_date).toLocaleDateString('pt-BR') : "-",
        area: `${e.area || 0} ha`
      })));

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    return "Agora";
  };

  const statCards = [
    {
      title: "Clientes Ativos",
      value: stats.activeClients,
      description: "Total cadastrado",
      icon: Users,
      color: "text-blue-600",
      prefix: "",
      suffix: ""
    },
    {
      title: "Fazendas Cadastradas",
      value: stats.registeredFarms,
      description: "Total cadastrado",
      icon: MapPin,
      color: "text-green-600",
      prefix: "",
      suffix: ""
    },
    {
      title: "Pedidos Pendentes",
      value: stats.pendingOrders,
      description: "Para aprovação",
      icon: FileText,
      color: "text-orange-600",
      prefix: "",
      suffix: ""
    },
    {
      title: "Execuções Agendadas",
      value: stats.scheduledExecutions,
      description: "Próximos dias",
      icon: Calendar,
      color: "text-purple-600",
      prefix: "",
      suffix: ""
    },
    {
      title: "Faturamento Mensal",
      value: stats.monthlyRevenue,
      description: "Pedidos concluídos",
      icon: DollarSign,
      color: "text-emerald-600",
      prefix: "R$ ",
      suffix: ""
    },
    {
      title: "Hectares Trabalhados",
      value: stats.workedHectares,
      description: "Total executado",
      icon: TrendingUp,
      color: "text-cyan-600",
      prefix: "",
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
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                <AnimatedValue 
                  value={stat.value} 
                  prefix={stat.prefix || ""} 
                  suffix={stat.suffix || ""} 
                />
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
            <CardDescription>Últimos clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Execuções</CardTitle>
            <CardDescription>Serviços agendados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExecutions.length > 0 ? (
                upcomingExecutions.map((execution, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <p className="text-sm font-medium">{execution.service}</p>
                    <p className="text-xs text-gray-600">{execution.farm} • {execution.area}</p>
                    <p className="text-xs text-gray-500">{execution.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma execução agendada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
