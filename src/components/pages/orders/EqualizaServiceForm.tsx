import React, { useState, useEffect, useMemo } from 'react';
import { EqualizaService, EqualizaCalculationResult } from '../../../services/EqualizaService';
import { useCostVariables } from '../../../hooks/useCostVariables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info } from 'lucide-react';

interface EqualizaServiceFormProps {
  initialAlqueires: number;
  onValuesChange: (calculatedValue: number) => void;
}

export const EqualizaServiceForm: React.FC<EqualizaServiceFormProps> = ({
  initialAlqueires,
  onValuesChange,
}) => {
  const { costVariables, loading: loadingCostVariables } = useCostVariables();

  const [totalAlqueires, setTotalAlqueires] = useState<number | null>(
    initialAlqueires === 0 ? null : initialAlqueires
  );
  const [anosCiclo, setAnosCiclo] = useState<string>('3'); // 2, 3, 4, 5 anos
  const [incluirFolha, setIncluirFolha] = useState<boolean>(false);
  const [incluirFungoNema, setIncluirFungoNema] = useState<boolean>(false);
  const [incluirCompactacao, setIncluirCompactacao] = useState<boolean>(false);
  const [descontoManual, setDescontoManual] = useState<number | null>(null);

  const [calculationResult, setCalculationResult] = useState<EqualizaCalculationResult | null>(null);

  const equalizaService = useMemo(() => {
    if (costVariables.length > 0) {
      return new EqualizaService(costVariables);
    }
    return null;
  }, [costVariables]);

  useEffect(() => {
    setTotalAlqueires(initialAlqueires === 0 ? null : initialAlqueires);
  }, [initialAlqueires]);

  useEffect(() => {
    if (equalizaService) {
      const anos = parseInt(anosCiclo) || 3;
      const percentualAnualAP = 1 / anos;

      const result = equalizaService.calculate({
        totalAlqueires: totalAlqueires === null ? 0 : totalAlqueires,
        percentualAnualAP,
        incluirFolha,
        incluirFungoNema,
        incluirCompactacao,
        descontoManual: descontoManual === null ? 0 : descontoManual,
      });

      setCalculationResult(result);
      // We pass the annual contract value as the order value (or total period)
      onValuesChange(result.totalAnualContrato);
    }
  }, [
    totalAlqueires,
    anosCiclo,
    incluirFolha,
    incluirFungoNema,
    incluirCompactacao,
    descontoManual,
    onValuesChange,
    equalizaService,
  ]);

  if (loadingCostVariables) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Carregando variáveis de custo...</p>
      </div>
    );
  }

  if (!equalizaService) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        As variáveis de custo não foram carregadas. O cálculo não pode ser realizado.
      </div>
    );
  }

  const details = calculationResult?.details;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sistema EQUALIZA (Contrato Multi-anual)</h3>
        
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="equaliza-area">Área Total da Propriedade (Alqueires):</Label>
            <Input
              id="equaliza-area"
              type="number" step="any"
              value={totalAlqueires === null ? '' : totalAlqueires}
              onChange={(e) => {
                const val = e.target.value;
                setTotalAlqueires(val === '' ? null : parseFloat(val));
              }}
              min="0"
              placeholder="Ex: 120"
            />
            {totalAlqueires && totalAlqueires >= 100 && (
              <span className="text-xs text-green-600 font-medium">
                Desconto de 5% aplicado por área &gt;= 100 alqueires!
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="equaliza-anos">Duração do Ciclo de AP / Contrato:</Label>
            <Select value={anosCiclo} onValueChange={setAnosCiclo}>
              <SelectTrigger id="equaliza-anos">
                <SelectValue placeholder="Selecione os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 anos (50% AP / 50% Conferência ao ano)</SelectItem>
                <SelectItem value="3">3 anos (33% AP / 67% Conferência ao ano)</SelectItem>
                <SelectItem value="4">4 anos (25% AP / 75% Conferência ao ano)</SelectItem>
                <SelectItem value="5">5 anos (20% AP / 80% Conferência ao ano)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-3 bg-muted/30 border rounded-md space-y-2">
          <span className="text-sm font-medium">Serviços Adicionais Inclusos no Contrato:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eq-folha"
                checked={incluirFolha}
                onCheckedChange={(checked) => setIncluirFolha(checked as boolean)}
              />
              <Label htmlFor="eq-folha" className="cursor-pointer text-xs">
                Análise Foliar Anual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eq-fungo"
                checked={incluirFungoNema}
                onCheckedChange={(checked) => setIncluirFungoNema(checked as boolean)}
              />
              <Label htmlFor="eq-fungo" className="cursor-pointer text-xs">
                Fungo / Nematóide
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eq-compacta"
                checked={incluirCompactacao}
                onCheckedChange={(checked) => setIncluirCompactacao(checked as boolean)}
              />
              <Label htmlFor="eq-compacta" className="cursor-pointer text-xs">
                Compactação de Solo
              </Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="equaliza-desconto">Desconto Manual Negociado (R$):</Label>
          <Input
            id="equaliza-desconto"
            type="number" step="any"
            value={descontoManual === null ? '' : descontoManual}
            onChange={(e) => {
              const val = e.target.value;
              setDescontoManual(val === '' ? null : parseFloat(val));
            }}
            min="0"
            placeholder="Ex: R$ 100,00"
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t space-y-3">
        <h4 className="text-md font-semibold">Resumo do Contrato Equalizado:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor Anual do Contrato</span>
            <strong className="text-lg text-primary">
              {equalizaService.formatCurrency(calculationResult?.totalAnualContrato ?? 0)}
            </strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Total Período ({calculationResult?.anosContrato} anos)</span>
            <strong className="text-lg text-foreground">
              {equalizaService.formatCurrency(calculationResult?.totalPeriodoContrato ?? 0)}
            </strong>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground block">Valor por Alqueire/Ano</span>
            <strong className="text-lg text-foreground">
              {equalizaService.formatCurrency(calculationResult?.precoPorAlqueireAnual ?? 0)}/ALQ
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-md border">
          <div>
            <span className="text-muted-foreground block">Parcela Agosto (50%):</span>
            <span className="font-semibold text-sm">
              {equalizaService.formatCurrency(calculationResult?.parcelaAgosto ?? 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Parcela Março (50%):</span>
            <span className="font-semibold text-sm">
              {equalizaService.formatCurrency(calculationResult?.parcelaMarco ?? 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Ou 12x Mensal:</span>
            <span className="font-semibold text-sm">
              {equalizaService.formatCurrency(calculationResult?.parcelaMensal ?? 0)}/mês
            </span>
          </div>
        </div>

        {details && (
          <div className="mt-3 p-3 border rounded-md text-xs space-y-1 bg-muted/10">
            <div className="font-semibold text-sm mb-1 text-muted-foreground">Composição Unitária Anual:</div>
            <div className="flex justify-between">
              <span>Parcela Anual AP:</span>
              <span>{equalizaService.formatCurrency(details.custoUnitarioAP)}/alq</span>
            </div>
            <div className="flex justify-between">
              <span>Parcela Anual Conferência:</span>
              <span>{equalizaService.formatCurrency(details.custoUnitarioConferencia)}/alq</span>
            </div>
            {details.custoUnitarioFolha > 0 && (
              <div className="flex justify-between">
                <span>Análise Foliar:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioFolha)}/alq</span>
              </div>
            )}
            {details.custoUnitarioCompactacao > 0 && (
              <div className="flex justify-between">
                <span>Compactação de Solo:</span>
                <span>{equalizaService.formatCurrency(details.custoUnitarioCompactacao)}/alq</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
