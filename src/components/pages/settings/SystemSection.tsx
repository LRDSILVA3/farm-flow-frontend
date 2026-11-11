
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle2, XCircle, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

const STORAGE_KEY_SYSTEM_PARAMS = "farm_flow_system_params";

export const SystemSection = () => {
  const { toast } = useToast();
  const [healthStatus, setHealthStatus] = useState<"checking" | "online" | "offline">("checking");
  const [uptimeSeconds, setUptimeSeconds] = useState<number | null>(null);
  const [params, setParams] = useState({
    defaultValidityDays: "60",
    hectaresPerAlqueire: "2.42",
    defaultCurrency: "BRL (R$)",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYSTEM_PARAMS);
      if (saved) setParams(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch { }
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus("checking");
    try {
      const res = await api.get<{ status: string; uptime: number }>("/health");
      if (res?.status === "ok") {
        setHealthStatus("online");
        setUptimeSeconds(Math.round(res.uptime || 0));
      } else {
        setHealthStatus("offline");
      }
    } catch {
      setHealthStatus("offline");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY_SYSTEM_PARAMS, JSON.stringify(params));
    toast({
      title: "Parâmetros salvos",
      description: "As configurações gerais do sistema foram atualizadas.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-700" />
            Diagnóstico & Ambiente da API
          </CardTitle>
          <CardDescription>
            Status de conexão com o backend Express e banco de dados PostgreSQL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-muted/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>Status da API Backend:</span>
                {healthStatus === "checking" && <Badge variant="secondary">Verificando...</Badge>}
                {healthStatus === "online" && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Online
                  </Badge>
                )}
                {healthStatus === "offline" && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Indisponível
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {uptimeSeconds !== null && healthStatus === "online"
                  ? `Tempo de atividade do servidor: ${Math.floor(uptimeSeconds / 60)} min ${uptimeSeconds % 60} s`
                  : "Clique em verificar para testar a comunicação com a API."}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={checkHealth} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${healthStatus === "checking" ? "animate-spin" : ""}`} />
              Verificar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Gerais de Cálculo e Orçamento</CardTitle>
          <CardDescription>
            Referências padrão utilizadas na conversão agronômica e exibição comercial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sys-validity">Validade Padrão (dias)</Label>
                <Input
                  id="sys-validity"
                  type="number"
                  min="1"
                  value={params.defaultValidityDays}
                  onChange={(e) => setParams({ ...params, defaultValidityDays: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sys-alqueire">Hectares por Alqueire</Label>
                <Input
                  id="sys-alqueire"
                  value={params.hectaresPerAlqueire}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="sys-currency">Moeda Padrão</Label>
                <Input
                  id="sys-currency"
                  value={params.defaultCurrency}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-1.5">
                <Save className="h-4 w-4" />
                Salvar Parâmetros
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
