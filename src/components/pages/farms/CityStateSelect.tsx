
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CityStateSelectProps {
  city: string;
  state: string;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
}

const estadosComCidades = {
  "SP": {
    label: "São Paulo",
    cities: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba"]
  },
  "RJ": {
    label: "Rio de Janeiro", 
    cities: ["Rio de Janeiro", "Niterói", "Petrópolis", "Nova Iguaçu", "Duque de Caxias"]
  },
  "MG": {
    label: "Minas Gerais",
    cities: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"]
  },
  "DF": {
    label: "Distrito Federal",
    cities: ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina"]
  },
  "BA": {
    label: "Bahia",
    cities: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro"]
  },
  "PR": {
    label: "Paraná",
    cities: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"]
  },
  "RS": {
    label: "Rio Grande do Sul",
    cities: ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"]
  },
  "GO": {
    label: "Goiás",
    cities: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"]
  },
  "MS": {
    label: "Mato Grosso do Sul",
    cities: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"]
  },
  "MT": {
    label: "Mato Grosso",
    cities: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"]
  }
};

export const CityStateSelect = ({ city, state, onCityChange, onStateChange }: CityStateSelectProps) => {
  const handleEstadoChange = (novoEstado: string) => {
    onStateChange(novoEstado);
    // Limpar city quando state mudar
    onCityChange("");
  };

  const cidadesDisponiveis = state && estadosComCidades[state as keyof typeof estadosComCidades] 
    ? estadosComCidades[state as keyof typeof estadosComCidades].cities 
    : [];

  return (
    <>
      <div>
        <Label htmlFor="state">Estado</Label>
        <Select value={state} onValueChange={handleEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o state" />
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
        <Label htmlFor="city">Cidade</Label>
        <Select value={city} onValueChange={onCityChange} disabled={!state}>
          <SelectTrigger>
            <SelectValue placeholder={state ? "Selecione a city" : "Primeiro selecione o state"} />
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
