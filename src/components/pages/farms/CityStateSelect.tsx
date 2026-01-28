
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CidadeEstadoSelectProps {
  cidade: string;
  estado: string;
  onCidadeChange: (cidade: string) => void;
  onEstadoChange: (estado: string) => void;
}

const estadosComCidades = {
  "SP": {
    label: "São Paulo",
    cidades: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba"]
  },
  "RJ": {
    label: "Rio de Janeiro", 
    cidades: ["Rio de Janeiro", "Niterói", "Petrópolis", "Nova Iguaçu", "Duque de Caxias"]
  },
  "MG": {
    label: "Minas Gerais",
    cidades: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"]
  },
  "DF": {
    label: "Distrito Federal",
    cidades: ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina"]
  },
  "BA": {
    label: "Bahia",
    cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"]
  },
  "PR": {
    label: "Paraná",
    cidades: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"]
  },
  "RS": {
    label: "Rio Grande do Sul",
    cidades: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"]
  },
  "GO": {
    label: "Goiás",
    cidades: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"]
  },
  "MS": {
    label: "Mato Grosso do Sul",
    cidades: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"]
  },
  "MT": {
    label: "Mato Grosso",
    cidades: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"]
  }
};

export const CidadeEstadoSelect = ({ cidade, estado, onCidadeChange, onEstadoChange }: CidadeEstadoSelectProps) => {
  const handleEstadoChange = (novoEstado: string) => {
    onEstadoChange(novoEstado);
    // Limpar cidade quando estado mudar
    onCidadeChange("");
  };

  const cidadesDisponiveis = estado && estadosComCidades[estado as keyof typeof estadosComCidades] 
    ? estadosComCidades[estado as keyof typeof estadosComCidades].cidades 
    : [];

  return (
    <>
      <div>
        <Label htmlFor="estado">Estado</Label>
        <Select value={estado} onValueChange={handleEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(estadosComCidades).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="cidade">Cidade</Label>
        <Select value={cidade} onValueChange={onCidadeChange} disabled={!estado}>
          <SelectTrigger>
            <SelectValue placeholder={estado ? "Selecione a cidade" : "Primeiro selecione o estado"} />
          </SelectTrigger>
          <SelectContent>
            {cidadesDisponiveis.map((cidadeOption) => (
              <SelectItem key={cidadeOption} value={cidadeOption}>
                {cidadeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
