
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMaskInput } from "react-imask";
import { CityStateSelect } from "@/components/pages/farms/CityStateSelect";
import { useToast } from "@/hooks/use-toast";
import { Client } from "../../../hooks/useClients";

interface CustomersFormProps {
  editingClient: Client | null;
  onSave: (Client: Omit<Client, 'id'>) => void;
  onUpdate: (Client: Client) => void;
  onCancel: () => void;
}

export const CustomersForm = ({ editingClient, onSave, onUpdate, onCancel }: CustomersFormProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cpf: editingClient?.cpf || "",
    name: editingClient?.name || "",
    birthDate: editingClient?.birthDate || "",
    email: editingClient?.email || "",
    phone: editingClient?.phone || "",
    zipCode: editingClient?.zipCode || "",
    city: editingClient?.city || "",
    state: editingClient?.state || "",
    cadPro: editingClient?.cadPro || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      onUpdate({ ...formData, id: editingClient.id });
      toast({ title: "Client atualizado com sucesso!" });
    } else {
      onSave(formData);
      toast({ title: "Client cadastrado com sucesso!" });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cpf: "",
      name: "",
      birthDate: "",
      email: "",
      phone: "",
      zipCode: "",
      city: "",
      state: "",
      cadPro: ""
    });
    onCancel();
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({ ...prev, state }));
  };

  const handleCityChange = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingClient ? "Editar Client" : "Novo Client"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <IMaskInput
              mask="000.000.000-00"
              id="cpf"
              value={formData.cpf}
              onAccept={(value) => setFormData({...formData, cpf: value as string})}
              placeholder="123.456.789-00"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="name">name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="name completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">phone</Label>
            <IMaskInput
              mask="(00) 00000-0000"
              id="phone"
              value={formData.phone}
              onAccept={(value) => setFormData({...formData, phone: value as string})}
              placeholder="(11) 99999-9999"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">zipCode</Label>
            <IMaskInput
              mask="00000-000"
              id="zipCode"
              value={formData.zipCode}
              onAccept={(value) => setFormData({...formData, zipCode: value as string})}
              placeholder="01234-567"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="cadPro">CAD/PRO (Opcional)</Label>
            <Input
              id="cadPro"
              value={formData.cadPro}
              onChange={(e) => setFormData({...formData, cadPro: e.target.value})}
              placeholder="Número do CAD/PRO"
            />
          </div>
          <CityStateSelect
            state={formData.state}
            city={formData.city}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
          />
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {editingClient ? "Atualizar" : "Cadastrar"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
