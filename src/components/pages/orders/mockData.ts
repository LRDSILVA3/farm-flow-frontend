export interface Plot {
  id: string;
  farm_id: string;
  name: string;
  area: string;
}

export const availableCustomers = [
  { id: "1", cpf: "123.456.789-00", name: "João Silva", email: "joao@email.com" },
  { id: "2", cpf: "987.654.321-00", name: "Maria Santos", email: "maria@email.com" },
  { id: "3", cpf: "456.789.123-00", name: "Pedro Oliveira", email: "pedro@email.com" }
];

export const allFarms = [
  { id: "1", name: "Fazenda São João", owner: "João Silva", area: "100", location: "Interior SP" },
  { id: "2", name: "Fazenda Santa Maria", owner: "Maria Santos", area: "200", location: "Interior MG" },
  { id: "3", name: "Fazenda Boa Vista", owner: "Pedro Oliveira", area: "150", location: "Interior GO" },
  { id: "4", name: "Fazenda Esperança", owner: "João Silva", area: "80", location: "Interior SP" },
  { id: "5", name: "Fazenda Progresso", owner: "Maria Santos", area: "120", location: "Interior MG" }
];

export const allPlots: Plot[] = [
  { id: "p1", farm_id: "1", name: "Talhão 1A", area: "50" },
  { id: "p2", farm_id: "1", name: "Talhão 1B", area: "50" },
  { id: "p3", farm_id: "2", name: "Talhão 2A", area: "100" },
  { id: "p4", farm_id: "2", name: "Talhão 2B", area: "100" },
  { id: "p5", farm_id: "3", name: "Talhão 3", area: "150" },
  { id: "p6", farm_id: "4", name: "Talhão 4A", area: "40" },
  { id: "p7", farm_id: "4", name: "Talhão 4B", area: "40" },
];
