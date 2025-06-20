
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CidadeEstadoSelectProps {
  cidade: string;
  estado: string;
  onCidadeChange: (cidade: string) => void;
  onEstadoChange: (estado: string) => void;
}

const cidades = [
  "São Paulo",
  "Rio de Janeiro", 
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Curitiba",
  "Porto Alegre",
  "Goiânia",
  "Campo Grande",
  "Cuiabá"
];

const estados = [
  { value: "SP", label: "São Paulo" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "MG", label: "Minas Gerais" },
  { value: "DF", label: "Distrito Federal" },
  { value: "BA", label: "Bahia" },
  { value: "PR", label: "Paraná" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "GO", label: "Goiás" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MT", label: "Mato Grosso" }
];

export const CidadeEstadoSelect = ({ cidade, estado, onCidadeChange, onEstadoChange }: CidadeEstadoSelectProps) => {
  return (
    <>
      <div>
        <Label htmlFor="cidade">Cidade</Label>
        <Select value={cidade} onValueChange={onCidadeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            {cidades.map((cidadeOption) => (
              <SelectItem key={cidadeOption} value={cidadeOption}>
                {cidadeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="estado">Estado</Label>
        <Select value={estado} onValueChange={onEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((estadoOption) => (
              <SelectItem key={estadoOption.value} value={estadoOption.value}>
                {estadoOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
