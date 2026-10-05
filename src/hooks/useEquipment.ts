import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

export interface Equipment {
  id: string;
  name: string;
  type?: "Veículo" | "Ferramenta" | "Outro" | string;
  model?: string;
  plate?: string;
  serialNumber?: string;
  hourmeter?: string;
  year?: string;
  notes?: string;
  status: string;
}

export const useEquipment = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [equipmentPerPage, setEquipmentPerPage] = useState(10);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentFormData, setEquipmentFormData] = useState<Equipment>({
    id: "",
    name: "",
    type: "Veículo",
    model: "",
    plate: "",
    serialNumber: "",
    hourmeter: "",
    year: "",
    notes: "",
    status: "Disponível"
  });

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/equipment');
      if (Array.isArray(data)) {
        setEquipment(data.map(e => ({
          id: e.id,
          name: e.name || "",
          type: e.type || "Veículo",
          model: e.model || "",
          plate: e.plate || "",
          serialNumber: e.serial_number || e.serialNumber || "",
          hourmeter: e.hourmeter || "",
          year: e.year || "",
          notes: e.notes || "",
          status: e.status || "Disponível"
        })));
      }
    } catch (error: any) {
      toast({ title: "Erro ao carregar equipamentos", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleEquipmentInputChange = (field: keyof Equipment, value: any) => {
    setEquipmentFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEquipmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: equipmentFormData.name,
        type: equipmentFormData.type || "Veículo",
        model: equipmentFormData.model || null,
        plate: equipmentFormData.plate || null,
        serial_number: equipmentFormData.serialNumber || null,
        hourmeter: equipmentFormData.hourmeter || null,
        year: equipmentFormData.year || null,
        notes: equipmentFormData.notes || null,
        status: equipmentFormData.status
      };

      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.id}`, payload);
        toast({ title: "Equipamento atualizado", description: "O equipamento foi atualizado com sucesso." });
      } else {
        await api.post('/equipment', payload);
        toast({ title: "Equipamento cadastrado", description: "O equipamento foi cadastrado com sucesso." });
      }
      resetEquipmentForm();
      await fetchEquipment();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setEquipmentFormData(item);
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await api.delete(`/equipment/${id}`);
      toast({ title: "Equipamento removido", description: "Equipamento excluído com sucesso." });
      await fetchEquipment();
    } catch (error: any) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const resetEquipmentForm = () => {
    setShowEquipmentForm(false);
    setEditingEquipment(null);
    setEquipmentFormData({
      id: "",
      name: "",
      type: "Veículo",
      model: "",
      plate: "",
      serialNumber: "",
      hourmeter: "",
      year: "",
      notes: "",
      status: "Disponível"
    });
  };

  const totalEquipment = equipment.length;
  const totalEquipmentPages = Math.max(1, Math.ceil(totalEquipment / (equipmentPerPage || 10)));
  const safePage = Math.min(equipmentPage, totalEquipmentPages);
  const equipmentStartIndex = (safePage - 1) * (equipmentPerPage || 10);
  const equipmentEndIndex = equipmentStartIndex + (equipmentPerPage || 10);
  const paginatedEquipment = equipment.slice(equipmentStartIndex, equipmentEndIndex);

  return {
    equipment: paginatedEquipment,
    allEquipment: equipment,
    loading,
    equipmentPage: safePage,
    setEquipmentPage,
    equipmentPerPage,
    setEquipmentPerPage,
    totalEquipment,
    totalEquipmentPages,
    equipmentStartIndex,
    equipmentEndIndex,
    showEquipmentForm,
    setShowEquipmentForm,
    editingEquipment,
    setEditingEquipment,
    equipmentFormData,
    setEquipmentFormData,
    handleEquipmentInputChange,
    handleInputChange: handleEquipmentInputChange,
    handleEquipmentSubmit,
    handleSaveEquipment: handleEquipmentSubmit,
    handleEditEquipment,
    handleDeleteEquipment,
    resetEquipmentForm,
    refetch: fetchEquipment
  };
};