
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CidadeEstadoSelect } from "@/components/pages/fazendas/CidadeEstadoSelect";
import { useToast } from "@/hooks/use-toast";
import { Cliente } from "./useClientes";

interface ClienteFormProps {
  editingClient: Cliente | null;
  onSave: (cliente: Omit<Cliente, 'id'>) => void;
  onUpdate: (cliente: Cliente) => void;
  onCancel: () => void;
}

export const ClienteForm = ({ editingClient, onSave, onUpdate, onCancel }: ClienteFormProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cpf: editingClient?.cpf || "",
    nome: editingClient?.nome || "",
    dataNascimento: editingClient?.dataNascimento || "",
    email: editingClient?.email || "",
    telefone: editingClient?.telefone || "",
    cep: editingClient?.cep || "",
    cidade: editingClient?.cidade || "",
    estado: editingClient?.estado || "",
    cadPro: editingClient?.cadPro || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      onUpdate({ ...formData, id: editingClient.id });
      toast({ title: "Cliente atualizado com sucesso!" });
    } else {
      onSave(formData);
      toast({ title: "Cliente cadastrado com sucesso!" });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cpf: "",
      nome: "",
      dataNascimento: "",
      email: "",
      telefone: "",
      cep: "",
      cidade: "",
      estado: "",
      cadPro: ""
    });
    onCancel();
  };

  const handleEstadoChange = (estado: string) => {
    setFormData(prev => ({ ...prev, estado }));
  };

  const handleCidadeChange = (cidade: string) => {
    setFormData(prev => ({ ...prev, cidade }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value})}
              placeholder="123.456.789-00"
              required
            />
          </div>
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
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
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={(e) => setFormData({...formData, cep: e.target.value})}
              placeholder="01234-567"
              required
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
          <CidadeEstadoSelect
            estado={formData.estado}
            cidade={formData.cidade}
            onEstadoChange={handleEstadoChange}
            onCidadeChange={handleCidadeChange}
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
